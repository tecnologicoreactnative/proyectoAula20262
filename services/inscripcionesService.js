/**
 * @file inscripcionesService.js
 * @description Capa de servicios para la matrícula y cancelación atómica de Cátedras ACUDE
 * en Cloud Firestore mediante transacciones (runTransaction).
 * Garantiza integridad concurrente de cupos (prevención de sobrecupo virtual duplicado)
 * y persistencia vinculada al perfil del estudiante.
 * @module services/inscripcionesService
 */

import {
  collection,
  doc,
  query,
  where,
  getDocs,
  runTransaction,
} from 'firebase/firestore';
import dayjs from 'dayjs';
import { db } from './firebaseConfig';
import { normalizarHorariosConAforo } from './acudesService';

const COLECCION_INSCRIPCIONES = 'inscripciones';
const COLECCION_ACUDES = 'acudes';

/**
 * Normaliza cadenas removiendo tildes, diacríticos y espacios para comparaciones tolerantes.
 */
function normalizarTexto(txt = '') {
  return String(txt || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Verifica si un estudiante ya cuenta con una inscripción activa en una cátedra ACUDE.
 *
 * @async
 * @function verificarInscripcionPrevia
 * @param {string} acudeId - ID del taller.
 * @param {string} userId - UID del estudiante.
 * @returns {Promise<Object|null>} El objeto inscripción si existe activa, o null.
 */
export async function verificarInscripcionPrevia(acudeId, userId) {
  if (!acudeId || !userId) return null;

  try {
    const q = query(
      collection(db, COLECCION_INSCRIPCIONES),
      where('idUsuario', '==', userId),
      where('idAcude', '==', acudeId),
      where('estado', '==', 'activa')
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const primerDoc = snapshot.docs[0];
      return { id: primerDoc.id, ...primerDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error al verificar inscripción previa:', error);
    return null;
  }
}

/**
 * Inscribe atómicamente a un estudiante en una cátedra ACUDE.
 * Aplica una transacción de Firestore para garantizar que no se sobrepase el aforo
 * y que el estudiante no quede duplicado.
 *
 * @async
 * @function inscribirEstudiante
 * @param {string} acudeId - ID del ACUDE.
 * @param {string} userId - UID del estudiante en Firebase Auth.
 * @param {Object} [datosEstudiante={}] - Metadatos opcionales (email, nombre).
 * @returns {Promise<{ exitoso: boolean, inscripcionId: string, mensaje: string }>}
 */
export async function inscribirEstudiante(acudeId, userId, datosEstudiante = {}) {
  if (!acudeId || !userId) {
    throw new Error('Se requiere el ID de la actividad y el ID del estudiante.');
  }

  // 1. Verificación previa de duplicados
  const yaInscrito = await verificarInscripcionPrevia(acudeId, userId);
  if (yaInscrito) {
    throw new Error('Ya te encuentras formalmente inscrito en esta cátedra ACUDE.');
  }

  const acudeRef = doc(db, COLECCION_ACUDES, acudeId);
  const nuevaInscripcionRef = doc(collection(db, COLECCION_INSCRIPCIONES));

  try {
    const resultado = await runTransaction(db, async (transaction) => {
      const acudeDoc = await transaction.get(acudeRef);
      if (!acudeDoc.exists()) {
        throw new Error('La cátedra ACUDE no existe en la base de datos.');
      }

      const dataAcude = acudeDoc.data();
      // Normalizar todos los horarios garantizando que cada franja tenga aforo definido y coherente
      const horarios = normalizarHorariosConAforo(
        dataAcude.horarios,
        dataAcude.cupoTotal,
        dataAcude.cuposDisponibles,
        acudeId
      );

      // Determinar horario seleccionado específico
      let indiceHorario = -1;
      const horarioObj = datosEstudiante.horarioSeleccionado;
      if (horarioObj?.id) {
        indiceHorario = horarios.findIndex((h) => h.id === horarioObj.id);
      }
      if (indiceHorario === -1) {
        const diaTarget = normalizarTexto(horarioObj?.dia || datosEstudiante.diaSeleccionado || '');
        const horaTarget = (horarioObj?.horaInicio || '').trim();
        if (diaTarget) {
          indiceHorario = horarios.findIndex((h) => {
            const coincideDia = normalizarTexto(h.dia) === diaTarget;
            if (!coincideDia) return false;
            if (horaTarget && h.horaInicio) {
              return h.horaInicio.trim() === horaTarget;
            }
            return true;
          });
        }
      }
      // Fallback si no se seleccionó o no se encontró: primer horario con cupos libres
      if (indiceHorario === -1 && horarios.length > 0) {
        const conCupoIdx = horarios.findIndex((h) => h.cuposDisponibles > 0);
        indiceHorario = conCupoIdx !== -1 ? conCupoIdx : 0;
      }

      const horarioElegido = indiceHorario !== -1 ? horarios[indiceHorario] : null;

      // Validación de cupos del horario específico
      if (horarioElegido) {
        if (horarioElegido.cuposDisponibles <= 0) {
          throw new Error(
            `Los cupos oficiales en la app para el horario de los ${horarioElegido.dia} (${horarioElegido.horaInicio} - ${horarioElegido.horaFin}) están agotados. Puedes elegir otro horario disponible o consultar con el docente para sobrecupo presencial en Bloque 10.`
          );
        }
      } else {
        const cuposGlobales = typeof dataAcude.cuposDisponibles === 'number' ? dataAcude.cuposDisponibles : 0;
        if (cuposGlobales <= 0) {
          throw new Error(
            'Los cupos oficiales en la app para esta cátedra están agotados. Puedes consultar el cronograma y lugar para solicitar sobrecupo presencial en la primera sesión con el docente.'
          );
        }
      }

      // Decrementar ÚNICAMENTE el cupo del horario específico seleccionado
      const nuevosHorarios = horarios.map((h, idx) => {
        if (idx === indiceHorario) {
          return {
            ...h,
            cuposDisponibles: Math.max(0, h.cuposDisponibles - 1),
          };
        }
        return h;
      });

      // Recalcular cupos totales y estado a partir de los horarios normalizados
      const nuevosCupos =
        nuevosHorarios.length > 0
          ? nuevosHorarios.reduce((acc, h) => acc + h.cuposDisponibles, 0)
          : Math.max(0, (typeof dataAcude.cuposDisponibles === 'number' ? dataAcude.cuposDisponibles : 1) - 1);

      const nuevoEstado = nuevosCupos === 0 ? 'agotado' : 'disponible';

      // 2. Decrementar cupo en la cátedra
      transaction.update(acudeRef, {
        horarios: nuevosHorarios,
        cuposDisponibles: nuevosCupos,
        estado: nuevoEstado,
        actualizadoEn: new Date(),
      });

      const diaElegido =
        datosEstudiante.diaSeleccionado ||
        horarioElegido?.dia ||
        'Por programar';

      const franjaElegida =
        datosEstudiante.franjaSeleccionada ||
        (horarioElegido
          ? `${horarioElegido.horaInicio || '00:00'} - ${horarioElegido.horaFin || '00:00'}`
          : 'Horario institucional');

      const lugarElegido =
        horarioElegido?.lugar ||
        dataAcude.ubicacion ||
        'Campus Robledo - Bloque 10';

      const idHorarioElegido =
        horarioElegido?.id || `${acudeId}-horario-${indiceHorario + 1}`;

      // 3. Crear el documento de inscripción vinculado al estudiante
      transaction.set(nuevaInscripcionRef, {
        idUsuario: userId,
        emailUsuario: datosEstudiante.email || '',
        nombreUsuario: datosEstudiante.nombre || 'Estudiante TdeA',
        idAcude: acudeId,
        nombreAcude: dataAcude.nombre || 'Cátedra ACUDE',
        categoria: dataAcude.categoria || 'Deportiva',
        disciplina: dataAcude.disciplina || 'General',
        docente: dataAcude.docente || 'Docente asignado',
        ubicacion: dataAcude.ubicacion || 'Campus Robledo - Bloque 10',
        horarios: nuevosHorarios,
        // Metadatos específicos de la sesión elegida por el estudiante
        horarioSeleccionado: horarioElegido
          ? {
              ...horarioElegido,
              cuposDisponibles: Math.max(0, (horarioElegido.cuposDisponibles || 1) - 1),
            }
          : null,
        idHorario: idHorarioElegido,
        diaSeleccionado: diaElegido,
        franjaSeleccionada: franjaElegida,
        lugarSesion: lugarElegido,
        estado: 'activa',
        fechaInscripcion: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        asistenciaMinima: dataAcude.asistenciaMinima || '80% de asistencia obligatoria',
      });

      return {
        exitoso: true,
        inscripcionId: nuevaInscripcionRef.id,
        diaSeleccionado: diaElegido,
        franjaSeleccionada: franjaElegida,
        mensaje: `¡Inscripción exitosa en ${dataAcude.nombre} para los ${diaElegido} (${franjaElegida})! Recuerda la regla del 80% de asistencia mínima.`,
      };
    });

    return resultado;
  } catch (error) {
    console.error('Error en la transacción de inscripción:', error);
    throw new Error(error.message || 'No fue posible completar la inscripción.');
  }
}

/**
 * Cancela una inscripción activa de forma atómica y reintegra el cupo a la cátedra.
 *
 * @async
 * @function cancelarInscripcion
 * @param {string} inscripcionId - ID del documento de inscripción.
 * @param {string} acudeId - ID de la cátedra para devolver el cupo.
 * @returns {Promise<{ exitoso: boolean, mensaje: string }>}
 */
export async function cancelarInscripcion(inscripcionId, acudeId) {
  if (!inscripcionId) {
    throw new Error('Se requiere el ID de la inscripción.');
  }

  const inscripcionRef = doc(db, COLECCION_INSCRIPCIONES, inscripcionId);

  try {
    const resultado = await runTransaction(db, async (transaction) => {
      // 1. TODAS LAS LECTURAS PRIMERO (READS)
      const inscripcionDoc = await transaction.get(inscripcionRef);
      if (!inscripcionDoc.exists()) {
        throw new Error('El registro de inscripción no fue encontrado.');
      }

      const dataInscripcion = inscripcionDoc.data();
      if (dataInscripcion.estado === 'cancelada') {
        throw new Error('Esta inscripción ya se encuentra cancelada.');
      }

      // Determinar ID de cátedra para devolver el cupo (del documento o del parámetro)
      const idAcudeDestino =
        acudeId ||
        dataInscripcion.idAcude ||
        dataInscripcion.acudeId ||
        dataInscripcion.idCatedra;

      let acudeDoc = null;
      let acudeRef = null;
      if (idAcudeDestino) {
        acudeRef = doc(db, COLECCION_ACUDES, idAcudeDestino);
        acudeDoc = await transaction.get(acudeRef);
      }

      // 2. TODAS LAS ESCRITURAS AL FINAL (WRITES)
      // A. Marcar inscripción como cancelada
      transaction.update(inscripcionRef, {
        estado: 'cancelada',
        fechaCancelacion: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      });

      // B. Devolver el cupo en acudes si el documento existe
      if (acudeDoc && acudeDoc.exists() && acudeRef) {
        const dataAcude = acudeDoc.data();
        const horarios = normalizarHorariosConAforo(
          dataAcude.horarios,
          dataAcude.cupoTotal,
          dataAcude.cuposDisponibles,
          idAcudeDestino
        );

        // Localizar el horario matriculado para reintegrar el cupo
        const idHorarioMatriculado =
          dataInscripcion.idHorario || dataInscripcion.horarioSeleccionado?.id;
        const diaMatriculado = normalizarTexto(
          dataInscripcion.diaSeleccionado || dataInscripcion.horarioSeleccionado?.dia || ''
        );
        const franjaMatriculada = dataInscripcion.franjaSeleccionada || '';

        let indiceReintegro = -1;
        if (idHorarioMatriculado) {
          indiceReintegro = horarios.findIndex((h) => h.id === idHorarioMatriculado);
        }
        if (indiceReintegro === -1 && diaMatriculado) {
          indiceReintegro = horarios.findIndex((h) => {
            const coincideDia = normalizarTexto(h.dia) === diaMatriculado;
            if (!coincideDia) return false;
            if (franjaMatriculada && h.horaInicio) {
              return franjaMatriculada.includes(h.horaInicio);
            }
            return true;
          });
        }

        let nuevosHorarios = horarios;
        if (indiceReintegro !== -1) {
          nuevosHorarios = horarios.map((h, idx) => {
            if (idx === indiceReintegro) {
              const maxCupos = typeof h.cupoTotal === 'number' ? h.cupoTotal : h.cuposDisponibles + 1;
              return {
                ...h,
                cuposDisponibles: Math.min(maxCupos, h.cuposDisponibles + 1),
              };
            }
            return h;
          });
        }

        // Recalcular cupos totales y estado a partir de los horarios normalizados
        const cuposTotalesActualizados =
          nuevosHorarios.length > 0
            ? nuevosHorarios.reduce((acc, h) => acc + h.cuposDisponibles, 0)
            : Math.min(
                typeof dataAcude.cupoTotal === 'number' ? dataAcude.cupoTotal : 25,
                (typeof dataAcude.cuposDisponibles === 'number' ? dataAcude.cuposDisponibles : 0) + 1
              );

        transaction.update(acudeRef, {
          horarios: nuevosHorarios,
          cuposDisponibles: cuposTotalesActualizados,
          estado: 'disponible',
          actualizadoEn: new Date(),
        });
      }

      return {
        exitoso: true,
        mensaje: 'Tu inscripción ha sido cancelada y el cupo ha quedado liberado para otro estudiante.',
      };
    });

    return resultado;
  } catch (error) {
    console.error('Error al cancelar la inscripción:', error);
    throw new Error(error.message || 'No fue posible cancelar la inscripción.');
  }
}

/**
 * Consulta todas las cátedras ACUDE en las que el estudiante se encuentra inscrito activamente.
 *
 * @async
 * @function getMisInscripciones
 * @param {string} userId - UID del estudiante.
 * @returns {Promise<Array<Object>>} Lista de inscripciones activas.
 */
export async function getMisInscripciones(userId) {
  if (!userId) return [];

  try {
    const q = query(
      collection(db, COLECCION_INSCRIPCIONES),
      where('idUsuario', '==', userId),
      where('estado', '==', 'activa')
    );

    const snapshot = await getDocs(q);
    const lista = [];
    snapshot.forEach((docSnap) => {
      lista.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    return lista;
  } catch (error) {
    console.error('Error al consultar mis inscripciones:', error);
    throw new Error(
      `No se pudo cargar tus inscripciones: ${error.message || 'Error de conexión'}`
    );
  }
}

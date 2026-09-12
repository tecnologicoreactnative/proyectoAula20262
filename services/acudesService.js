/**
 * @file acudesService.js
 * @description Capa de servicios para la consulta del catálogo de Cátedras y Actividades ACUDE
 * (Actividades Culturales y Deportivas) de Bienestar Institucional (TdeA) en Cloud Firestore.
 * Satisface la arquitectura desacoplada: las pantallas no ejecutan queries de Firestore directamente.
 * @module services/acudesService
 */

import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

const COLECCION_ACUDES = 'acudes';

/**
 * Normaliza un arreglo de horarios asegurando que CADA franja tenga id, cupoTotal y cuposDisponibles válidos.
 * Si los horarios en Firestore carecen de aforo granular (datos legados o no sembrados), distribuye
 * equitativamente el aforo general del documento para garantizar integridad matemática y evitar que
 * un horario quede con cupos indefinidos o en 0 al matricularse.
 *
 * @param {Array<Object>} rawHorarios - Arreglo de horarios del documento en Firestore.
 * @param {number} cupoTotalDoc - Aforo total registrado en el documento.
 * @param {number} cuposDisponiblesDoc - Cupos disponibles registrados en el documento.
 * @param {string} acudeId - ID del documento ACUDE.
 * @returns {Array<Object>} Arreglo de horarios normalizados con cupos individuales consistentes.
 */
export function normalizarHorariosConAforo(
  rawHorarios = [],
  cupoTotalDoc = 20,
  cuposDisponiblesDoc = 0,
  acudeId = ''
) {
  if (!Array.isArray(rawHorarios) || rawHorarios.length === 0) {
    return [];
  }

  const n = rawHorarios.length;
  const todosTienenCupos = rawHorarios.every(
    (h) => typeof h?.cuposDisponibles === 'number' && typeof h?.cupoTotal === 'number'
  );

  if (todosTienenCupos) {
    return rawHorarios.map((h, idx) => ({
      ...h,
      id: h.id || `${acudeId}-horario-${idx + 1}`,
      dia: h.dia || 'Por definir',
      horaInicio: h.horaInicio || '00:00',
      horaFin: h.horaFin || '00:00',
      lugar: h.lugar || 'Campus Robledo - Bloque 10',
      docente: h.docente || 'Docente asignado',
      cupoTotal: h.cupoTotal,
      cuposDisponibles: Math.max(0, h.cuposDisponibles),
    }));
  }

  // Distribución equitativa y exacta sin pérdida de cupos por residuo
  const total = typeof cupoTotalDoc === 'number' && cupoTotalDoc > 0 ? cupoTotalDoc : 20;
  const disponibles = typeof cuposDisponiblesDoc === 'number' ? Math.max(0, cuposDisponiblesDoc) : 0;

  const baseTotal = Math.floor(total / n);
  const remTotal = total % n;

  const baseDisp = Math.floor(disponibles / n);
  const remDisp = disponibles % n;

  return rawHorarios.map((h, idx) => {
    const idHorario = h.id || `${acudeId}-horario-${idx + 1}`;
    const cupoTotalCalculado =
      typeof h.cupoTotal === 'number' ? h.cupoTotal : baseTotal + (idx < remTotal ? 1 : 0);

    const cuposDisponiblesCalculados =
      typeof h.cuposDisponibles === 'number'
        ? h.cuposDisponibles
        : baseDisp + (idx < remDisp ? 1 : 0);

    return {
      ...h,
      id: idHorario,
      dia: h.dia || 'Por definir',
      horaInicio: h.horaInicio || '00:00',
      horaFin: h.horaFin || '00:00',
      lugar: h.lugar || 'Campus Robledo - Bloque 10',
      docente: h.docente || 'Docente asignado',
      cupoTotal: cupoTotalCalculado,
      cuposDisponibles: Math.max(0, Math.min(cupoTotalCalculado, cuposDisponiblesCalculados)),
    };
  });
}

/**
 * Normaliza y formatea un documento de Firestore de la colección 'acudes'.
 * @param {import('firebase/firestore').DocumentSnapshot} docSnapshot
 * @returns {Object} Objeto normalizado con id y campos estandarizados.
 */
function normalizarDocumentoAcude(docSnapshot) {
  const data = docSnapshot.data() || {};
  const idDoc = docSnapshot.id;
  const rawHorarios = Array.isArray(data.horarios) ? data.horarios : [];

  const horarios = normalizarHorariosConAforo(
    rawHorarios,
    data.cupoTotal,
    data.cuposDisponibles,
    idDoc
  );

  // Si hay horarios configurados, la suma de cupos individuales determina el aforo total
  const sumaCuposDisponibles =
    horarios.length > 0
      ? horarios.reduce((acc, h) => acc + (h.cuposDisponibles || 0), 0)
      : typeof data.cuposDisponibles === 'number'
      ? data.cuposDisponibles
      : 0;

  const sumaCupoTotal =
    horarios.length > 0
      ? horarios.reduce((acc, h) => acc + (h.cupoTotal || 0), 0)
      : typeof data.cupoTotal === 'number'
      ? data.cupoTotal
      : 25;

  const estado = sumaCuposDisponibles > 0 ? 'disponible' : 'agotado';

  return {
    id: idDoc,
    nombre: data.nombre || 'Cátedra sin nombre',
    categoria: data.categoria || 'Deportiva', // 'Deportiva' | 'Cultural'
    disciplina: data.disciplina || 'General',
    ubicacion: data.ubicacion || 'Campus Robledo - Bloque 10',
    docente: data.docente || 'Docente de Bienestar',
    cupoTotal: sumaCupoTotal,
    cuposDisponibles: sumaCuposDisponibles,
    estado: data.estado || estado,
    descripcion: data.descripcion || '',
    requisitos: data.requisitos || 'Carné institucional TdeA y vestimenta adecuada.',
    asistenciaMinima:
      data.asistenciaMinima ||
      '80% de asistencia obligatoria durante el semestre para validación de créditos. Inasistencias reiteradas liberan el cupo para otros estudiantes.',
    notaPresencial:
      data.notaPresencial ||
      'Si no alcanzaste cupo virtual en la app o en Campus TdeA, preséntate directamente en el lugar de la clase en la primera sesión con el docente a cargo para solicitar sobrecupo si hay plazas liberadas.',
    horarios,
    imagenUrl: data.imagenUrl || null,
    actualizadoEn: data.actualizadoEn ? data.actualizadoEn.toDate() : null,
  };
}

/**
 * Obtiene el catálogo completo o filtrado de actividades ACUDE desde Firestore.
 *
 * @async
 * @function getAcudes
 * @param {string} [filtroCategoria='Todos'] - 'Todos' | 'Deportiva' | 'Cultural'
 * @returns {Promise<Array<Object>>} Lista de actividades ACUDE normalizadas.
 * @throws {Error} Si falla la comunicación con Firestore.
 */
export async function getAcudes(filtroCategoria = 'Todos') {
  try {
    const coleccionRef = collection(db, COLECCION_ACUDES);
    let consulta;

    if (filtroCategoria && filtroCategoria !== 'Todos') {
      consulta = query(
        coleccionRef,
        where('categoria', '==', filtroCategoria),
        orderBy('nombre', 'asc')
      );
    } else {
      consulta = query(coleccionRef, orderBy('nombre', 'asc'));
    }

    const querySnapshot = await getDocs(consulta);
    const acudes = [];
    querySnapshot.forEach((docSnap) => {
      acudes.push(normalizarDocumentoAcude(docSnap));
    });

    return acudes;
  } catch (error) {
    console.error('Error al consultar actividades ACUDE desde Firestore:', error);
    throw new Error(
      `No se pudo cargar el catálogo de actividades ACUDE: ${
        error.message || 'Error de conexión'
      }`
    );
  }
}

/**
 * Obtiene la ficha técnica completa de una actividad ACUDE por su ID de documento.
 *
 * @async
 * @function getAcudeById
 * @param {string} acudeId - Identificador único del taller en Firestore.
 * @returns {Promise<Object|null>} Actividad normalizada o null si no existe.
 */
export async function getAcudeById(acudeId) {
  if (!acudeId || typeof acudeId !== 'string') {
    throw new Error('El parámetro acudeId es obligatorio y debe ser un texto.');
  }

  try {
    const docRef = doc(db, COLECCION_ACUDES, acudeId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return normalizarDocumentoAcude(docSnap);
  } catch (error) {
    console.error(`Error al consultar actividad ACUDE con ID ${acudeId}:`, error);
    throw new Error(
      `No se pudo consultar el detalle de la actividad: ${
        error.message || 'Error de conexión'
      }`
    );
  }
}

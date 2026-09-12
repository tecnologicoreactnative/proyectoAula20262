/**
 * @file disponibilidadService.js
 * @description Capa de servicios para la consulta y cálculo de franjas horarias y cronogramas semanales
 * de las Cátedras ACUDE de Bienestar Institucional (TdeA).
 * Las cátedras no se alquilan por turnos sueltos; tienen días y franjas fijas recurrentes.
 * Facilita a los estudiantes verificar posibles cruces con su carga en Campus TdeA
 * y consultar el lugar exacto (Bloque 10) para presentarse con el docente por sobrecupo presencial.
 * @module services/disponibilidadService
 */

import { getAcudeById } from './acudesService';

/**
 * Consulta y estructura el cronograma semanal recurrente de una actividad ACUDE.
 *
 * @async
 * @function getHorariosAcude
 * @param {string} acudeId - Identificador único de la actividad.
 * @returns {Promise<Object>} Cronograma semanal enriquecido con metadata operativa.
 */
export async function getHorariosAcude(acudeId) {
  if (!acudeId) {
    throw new Error('El ID de la actividad es requerido.');
  }

  const acude = await getAcudeById(acudeId);
  if (!acude) {
    throw new Error('La actividad solicitada no existe.');
  }

  // Lista normalizada de sesiones semanales con aforo individual
  const sesiones = (acude.horarios || []).map((sesion, index) => {
    const cupoTotal = typeof sesion.cupoTotal === 'number' ? sesion.cupoTotal : null;
    const cuposDisponibles = typeof sesion.cuposDisponibles === 'number' ? sesion.cuposDisponibles : null;
    return {
      id: sesion.id || `${acude.id}-sesion-${index + 1}`,
      dia: sesion.dia || 'Por definir',
      horaInicio: sesion.horaInicio || '00:00',
      horaFin: sesion.horaFin || '00:00',
      lugar: sesion.lugar || acude.ubicacion || 'Campus Robledo - Bloque 10',
      docente: sesion.docente || acude.docente,
      cupoTotal,
      cuposDisponibles,
      hayCupo:
        typeof cuposDisponibles === 'number'
          ? cuposDisponibles > 0
          : (acude.cuposDisponibles || 0) > 0,
    };
  });

  // Días únicos de la semana en los que sesiona la cátedra
  const diasSemanales = [...new Set(sesiones.map((s) => s.dia))];

  return {
    acudeId: acude.id,
    nombre: acude.nombre,
    categoria: acude.categoria,
    docente: acude.docente,
    ubicacionGeneral: acude.ubicacion,
    cupoTotal: acude.cupoTotal,
    cuposDisponibles: acude.cuposDisponibles,
    estadoCupo: acude.cuposDisponibles > 0 ? 'disponible' : 'agotado',
    diasSemanales,
    sesiones,
    asistenciaMinima: acude.asistenciaMinima,
    sobrecupoPresencial: {
      habilitado: true,
      mensaje:
        'Si no alcanzaste cupo virtual en la app o en Campus TdeA, no necesitas ir a oficinas administrativas de Bienestar: preséntate directamente en el lugar de la clase en la primera sesión con el docente a cargo para solicitar sobrecupo, aprovechando cupos liberados por inasistencia o deserción.',
      lugarContacto: acude.ubicacion,
      docenteContacto: acude.docente,
    },
  };
}

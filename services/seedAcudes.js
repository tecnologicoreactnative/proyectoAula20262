/**
 * @file seedAcudes.js
 * @description Script de siembra de datos (Seed) para la colección 'acudes' en Cloud Firestore.
 * Carga las Cátedras y Talleres reales de Bienestar Institucional del Tecnológico de Antioquia (TdeA).
 * Todas las actividades se ubican en los espacios reales del campus Robledo (con núcleo en Bloque 10).
 * Es idempotente (utiliza setDoc con { merge: true } e IDs fijos).
 * @module services/seedAcudes
 */

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * Catálogo maestro de Cátedras ACUDE reales del TdeA (Bienestar Institucional).
 */
export const ACUDES_TDEA = [
  {
    id: 'acude-danza-contemporanea',
    nombre: 'Danza Contemporánea y Expresión Corporal',
    categoria: 'Cultural',
    disciplina: 'Danza',
    docente: 'Prof. Mateo Saldarriaga',
    ubicacion: 'Campus Robledo - Bloque 10 (Salón de Danza y Movimiento)',
    cupoTotal: 2,
    cuposDisponibles: 2,
    estado: 'disponible',
    descripcion:
      'Laboratorio de movimiento consciente, técnicas de danza contemporánea, improvisación y exploración coreográfica para el desarrollo del equilibrio, la flexibilidad y la presencia escénica.',
    requisitos:
      'Carné institucional TdeA, ropa elástica/cómoda (licra o sudadera) y medias de danza o pies descalzos.',
    asistenciaMinima:
      '80% de asistencia obligatoria durante el semestre. Estudiantes con inasistencias consecutivas pierden el cupo para sobrecupo.',
    notaPresencial:
      'Cada horario tiene cupo independiente. Si una franja horaria está agotada en la app, puedes consultar el otro horario o presentarte con el docente en Bloque 10 para sobrecupo presencial.',
    horarios: [
      {
        id: 'danza-contemporanea-martes',
        dia: 'Martes',
        horaInicio: '16:00',
        horaFin: '18:00',
        lugar: 'Bloque 10 - Salón de Danza y Movimiento',
        cupoTotal: 1,
        cuposDisponibles: 1,
      },
      {
        id: 'danza-contemporanea-jueves',
        dia: 'Jueves',
        horaInicio: '16:00',
        horaFin: '18:00',
        lugar: 'Bloque 10 - Salón de Danza y Movimiento',
        cupoTotal: 1,
        cuposDisponibles: 1,
      },
    ],
    imagenUrl:
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 'acude-futsal',
    nombre: 'Fútbol Sala Formativo y Representativo',
    categoria: 'Deportiva',
    disciplina: 'Fútbol Sala',
    docente: 'Lic. Carlos Mario Restrepo',
    ubicacion: 'Campus Robledo - Bloque 10 (Coliseo Institucional)',
    cupoTotal: 25,
    cuposDisponibles: 8,
    estado: 'disponible',
    descripcion:
      'Taller formativo de técnica individual, táctica colectiva y acondicionamiento aeróbico orientado a la integración estudiantil y preselección institucional.',
    requisitos:
      'Carné estudiantil TdeA vigente, calzado deportivo para maderamen (suela lisa sin taches) e hidratación personal.',
    asistenciaMinima:
      '80% de asistencia obligatoria durante el semestre. Estudiantes con inasistencias reiteradas pierden el curso y su cupo queda liberado para sobrecupo.',
    notaPresencial:
      'Si los cupos virtuales están agotados, preséntate directamente en el Coliseo (Bloque 10) al inicio de la primera sesión con el docente para solicitar autorización de sobrecupo.',
    horarios: [
      {
        id: 'futsal-martes',
        dia: 'Martes',
        horaInicio: '14:00',
        horaFin: '16:00',
        lugar: 'Bloque 10 - Coliseo Institucional',
        cupoTotal: 13,
        cuposDisponibles: 4,
      },
      {
        id: 'futsal-jueves',
        dia: 'Jueves',
        horaInicio: '14:00',
        horaFin: '16:00',
        lugar: 'Bloque 10 - Coliseo Institucional',
        cupoTotal: 12,
        cuposDisponibles: 4,
      },
    ],
    imagenUrl:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 'acude-danza-folclorica',
    nombre: 'Danza Folclórica y Expresión Tradicional',
    categoria: 'Cultural',
    disciplina: 'Danza',
    docente: 'Prof. María Elena Morales',
    ubicacion: 'Campus Robledo - Bloque 10 (Salón de Expresión Cultural)',
    cupoTotal: 20,
    cuposDisponibles: 5,
    estado: 'disponible',
    descripcion:
      'Espacio artístico enfocado en el rescate de las danzas típicas colombianas (cumbia, currulao, bambuco) fortaleciendo la memoria cultural, el ritmo y la expresión corporal.',
    requisitos:
      'Carné institucional TdeA, ropa cómoda de fácil movimiento (licra o sudadera) y pañuelo tradicional para prácticas coreográficas.',
    asistenciaMinima:
      '80% de asistencia obligatoria para acreditar créditos institucionales de Bienestar. Tres inasistencias sin excusa justificable conllevan la liberación del cupo.',
    notaPresencial:
      'Puedes acercarte directamente al Salón de Expresión Cultural en el Bloque 10 en la sesión inaugural para solicitar sobrecupo con la profesora en caso de cancelaciones de otros alumnos.',
    horarios: [
      {
        id: 'danza-folclorica-lunes',
        dia: 'Lunes',
        horaInicio: '16:00',
        horaFin: '18:00',
        lugar: 'Bloque 10 - Salón de Expresión Cultural',
        cupoTotal: 10,
        cuposDisponibles: 2,
      },
      {
        id: 'danza-folclorica-miercoles',
        dia: 'Miércoles',
        horaInicio: '16:00',
        horaFin: '18:00',
        lugar: 'Bloque 10 - Salón de Expresión Cultural',
        cupoTotal: 10,
        cuposDisponibles: 3,
      },
    ],
    imagenUrl:
      'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 'acude-acondicionamiento-salud',
    nombre: 'Acondicionamiento Físico y Salud',
    categoria: 'Deportiva',
    disciplina: 'Fitness y Salud',
    docente: 'Lic. Andrés Felipe Henao',
    ubicacion: 'Campus Robledo - Bloque 10 (Gimnasio de Bienestar Institucional, Piso 2)',
    cupoTotal: 30,
    cuposDisponibles: 12,
    estado: 'disponible',
    descripcion:
      'Entrenamiento funcional, fuerza resistida y prevención de lesiones con prescripción de ejercicio guiada por profesionales en ciencias del deporte para la comunidad universitaria.',
    requisitos:
      'Carné TdeA, toalla de uso personal obligatoria para máquinas, vestimenta deportiva transpirable y termo con agua.',
    asistenciaMinima:
      '80% de asistencia semestral. Los cupos son monitoreados mediante la bitácora de ingreso en el gimnasio.',
    notaPresencial:
      'Preséntate en el gimnasio (Piso 2 del Bloque 10) en la franja elegida; el docente a cargo evalúa disponibilidad de cupo presencial en la primera semana.',
    horarios: [
      {
        id: 'acondicionamiento-lunes',
        dia: 'Lunes',
        horaInicio: '08:00',
        horaFin: '10:00',
        lugar: 'Bloque 10 - Gimnasio Bienestar, Piso 2',
        cupoTotal: 15,
        cuposDisponibles: 6,
      },
      {
        id: 'acondicionamiento-miercoles',
        dia: 'Miércoles',
        horaInicio: '08:00',
        horaFin: '10:00',
        lugar: 'Bloque 10 - Gimnasio Bienestar, Piso 2',
        cupoTotal: 15,
        cuposDisponibles: 6,
      },
    ],
    imagenUrl:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 'acude-voleibol',
    nombre: 'Voleibol Formativo Mixto',
    categoria: 'Deportiva',
    disciplina: 'Voleibol',
    docente: 'Lic. Juan David Gómez',
    ubicacion: 'Campus Robledo - Bloque 10 (Coliseo Institucional / Placa Externa)',
    cupoTotal: 22,
    cuposDisponibles: 4,
    estado: 'disponible',
    descripcion:
      'Desarrollo de fundamentos técnicos del voleibol: saque, voleo, antebrazo, remate y rotaciones de juego recreativo y competitivo.',
    requisitos:
      'Carné institucional TdeA, rodilleras recomendadas, tenis deportivos y ropa adecuada para práctica bajo techo y al aire libre.',
    asistenciaMinima:
      '80% de asistencia obligatoria. Inasistencias consecutivas cancelan el registro del estudiante.',
    notaPresencial:
      'En caso de cupos agotados en Campus TdeA o en la app, acude a la placa exterior o al coliseo del Bloque 10 a las 14:00 para solicitar sobrecupo con el profesor.',
    horarios: [
      {
        id: 'voleibol-miercoles',
        dia: 'Miércoles',
        horaInicio: '14:00',
        horaFin: '16:00',
        lugar: 'Bloque 10 - Coliseo / Placa Externa',
        cupoTotal: 11,
        cuposDisponibles: 2,
      },
      {
        id: 'voleibol-viernes',
        dia: 'Viernes',
        horaInicio: '14:00',
        horaFin: '16:00',
        lugar: 'Bloque 10 - Coliseo / Placa Externa',
        cupoTotal: 11,
        cuposDisponibles: 2,
      },
    ],
    imagenUrl:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 'acude-tenis-mesa',
    nombre: 'Tenis de Mesa y Deportes de Concentración',
    categoria: 'Deportiva',
    disciplina: 'Tenis de Mesa',
    docente: 'Prof. Gabriel Jaime Montoya',
    ubicacion: 'Campus Robledo - Bloque 10 (Área Multideportiva, Nivel 1)',
    cupoTotal: 16,
    cuposDisponibles: 3,
    estado: 'disponible',
    descripcion:
      'Práctica formativa de tenis de mesa que estimula la coordinación óculo-manual, concentración, velocidad de reacción y estrategia lúdica.',
    requisitos:
      'Carné TdeA. El departamento facilita raquetas y pelotas, aunque los estudiantes pueden llevar sus implementos personales.',
    asistenciaMinima:
      '80% de cumplimiento reglamentario. Se toma lista al inicio de cada jornada semanal.',
    notaPresencial:
      'Puedes acercarte directamente a las mesas de juego en el Nivel 1 del Bloque 10 a dialogar con el profesor en la primera clase para solicitar sobrecupo.',
    horarios: [
      {
        id: 'tenis-mesa-martes',
        dia: 'Martes',
        horaInicio: '10:00',
        horaFin: '12:00',
        lugar: 'Bloque 10 - Nivel 1 Coliseo',
        cupoTotal: 8,
        cuposDisponibles: 1,
      },
      {
        id: 'tenis-mesa-jueves',
        dia: 'Jueves',
        horaInicio: '10:00',
        horaFin: '12:00',
        lugar: 'Bloque 10 - Nivel 1 Coliseo',
        cupoTotal: 8,
        cuposDisponibles: 2,
      },
    ],
    imagenUrl:
      'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 'acude-teatro-expresion',
    nombre: 'Taller de Teatro, Cuentería y Expresión Oral',
    categoria: 'Cultural',
    disciplina: 'Teatro',
    docente: 'Maestra Laura Restrepo',
    ubicacion: 'Campus Robledo - Bloque 10 (Auditorio Gilberto Echeverri Mejía)',
    cupoTotal: 18,
    cuposDisponibles: 0, // Configurado intencionalmente en 0 para validar el flujo de Cupo Agotado y Sobrecupo Presencial
    estado: 'agotado',
    descripcion:
      'Laboratorio escénico para el desarrollo de la confianza vocal, improvisación, dramaturgia y expresión corporal aplicable a la vida académica y profesional.',
    requisitos:
      'Carné estudiantil TdeA y disposición creativa. No se requiere experiencia previa en actuación.',
    asistenciaMinima:
      '80% de asistencia obligatoria para el montaje final semestral en el auditorio institucional.',
    notaPresencial:
      '⚠️ CUPOS VIRTUALES AGOTADOS: Asiste presencialmente al Auditorio Gilberto Echeverri Mejía (Bloque 10) el viernes a las 14:00. La docente autoriza sobrecupo en sitio a los primeros asistentes que cubran plazas de deserción.',
    horarios: [
      {
        id: 'teatro-viernes',
        dia: 'Viernes',
        horaInicio: '14:00',
        horaFin: '18:00',
        lugar: 'Bloque 10 - Auditorio Gilberto Echeverri Mejía',
        cupoTotal: 18,
        cuposDisponibles: 0,
      },
    ],
    imagenUrl:
      'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&auto=format&fit=crop&q=60',
  },
];

/**
 * Ejecuta la siembra masiva de cátedras ACUDE en Cloud Firestore.
 * Idempotente: actualiza o crea sin duplicar documentos.
 *
 * @async
 * @function ejecutarSeedAcudes
 * @returns {Promise<{ exitoso: boolean, totalInsertados: number, mensaje: string }>}
 */
export async function ejecutarSeedAcudes() {
  try {
    let insertados = 0;

    for (const acude of ACUDES_TDEA) {
      const { id, ...datosAcude } = acude;
      const referenciaDoc = doc(db, 'acudes', id);

      await setDoc(
        referenciaDoc,
        {
          ...datosAcude,
          actualizadoEn: serverTimestamp(),
        },
        { merge: true }
      );

      insertados += 1;
    }

    return {
      exitoso: true,
      totalInsertados: insertados,
      mensaje: `Se sembraron exitosamente ${insertados} cátedras ACUDE en Firestore.`,
    };
  } catch (error) {
    console.error('Error al ejecutar el seed de ACUDEs en Firestore:', error);
    throw new Error(
      `Fallo en la siembra de datos ACUDE: ${
        error.message || 'Error de conexión con Firestore'
      }`
    );
  }
}

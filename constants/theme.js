/**
 * @file theme.js
 * @description Manual de identidad y tokens de diseño institucional para CanchaYa (TdeA).
 * Especificaciones cromáticas oficiales:
 * - Verde Claro (Lima):  PANTONE 375 C           -> #92BD24
 * - Verde Oscuro (Pino):  PANTONE 349 C           -> #00652E
 * - Gris Oscuro / Neutro: PANTONE Neutral Black C -> #5B5B5F
 * - Negro Institucional:  PANTONE Neutral Black C -> #211915
 * @module constants/theme
 */

export const COLORES = {
  // Colores Oficiales PANTONE
  verdeLima: '#92BD24',         // PANTONE 375 C
  verdePino: '#00652E',         // PANTONE 349 C
  grisNeutro: '#5B5B5F',        // PANTONE Neutral Black C (80% K)
  negroInstitucional: '#211915',// PANTONE Neutral Black C (100% K)

  // Tokens Semánticos Principales
  primario: '#00652E',          // Verde Pino: color corporativo de encabezados, botones y barras
  primarioOscuro: '#004720',
  primarioClaro: '#00833B',
  primarioTenue: 'rgba(0, 101, 46, 0.08)',

  acento: '#92BD24',            // Verde Lima: acentos activos, badges, indicadores deportivos
  acentoOscuro: '#739719',
  acentoClaro: '#F2F8E4',       // Fondo de píldoras y badges
  acentoTenue: 'rgba(146, 189, 36, 0.15)',

  // Textos y Contraste
  textoPrincipal: '#211915',    // Negro Institucional
  textoSecundario: '#5B5B5F',   // Gris Oscuro Neutro
  textoMuted: '#8A8A8E',
  textoBlanco: '#FFFFFF',
  textoSobreAcento: '#211915',  // Contraste óptimo sobre verde lima

  // Fondos y Superficies
  fondo: '#F5F7F5',             // Blanco marfil con tinte sutil institucional
  superficie: '#FFFFFF',
  superficieElevada: '#FFFFFF',
  superficieGris: '#F0F2F0',

  // Bordes y Separadores
  borde: '#E2E6E2',
  bordeFocus: '#00652E',
  bordeAcento: '#92BD24',

  // Estados Semánticos
  exito: '#00652E',
  exitoFondo: '#EAF5EF',
  alerta: '#B45309',
  alertaFondo: '#FEF3C7',
  error: '#B91C1C',
  errorFondo: '#FEE2E2',
  info: '#00652E',
  infoFondo: '#EDF7ED',

  // Sombras
  sombra: '#211915',
};

export const SOMBRAS = {
  suave: {
    shadowColor: COLORES.sombra,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  media: {
    shadowColor: COLORES.sombra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  boton: {
    shadowColor: COLORES.verdePino,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
};

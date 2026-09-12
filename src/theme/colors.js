// ============================================================================
// CAPA: VISTA (tema visual) — Paleta de colores para modo claro/oscuro
// ----------------------------------------------------------------------------
// Define las paletas Material Design 3 usadas por los componentes visuales.
// No forma parte del Modelo ni del VistaModelo: es configuración pura de
// presentación que podría inyectarse en `PaperProvider` (ver App.js).
// Actualmente App.js define su propio objeto de tema en línea; este archivo
// queda disponible para reutilizar la paleta o para soporte de modo oscuro.
// ============================================================================
export const LightTheme = {
  colors: {
    primary: '#256B42',
    onPrimary: '#FEFFFE',
    primaryContainer: '#ABF2C1',
    onPrimaryContainer: '#02210E',
    secondary: '#4F6355',
    secondaryContainer: '#D1E8D7',
    onSecondaryContainer: '#0E1F14',
    tertiaryContainer: '#B6ECF4',
    onTertiaryContainer: '#031F23',
    surface: '#F5FBF6',
    surfaceContainerLow: '#EFF5F1',
    surfaceContainer: '#EAEFEB',
    surfaceContainerHigh: '#E4EAE5',
    surfaceContainerHighest: '#DEE4E0',
    onSurface: '#181C1A',
    onSurfaceVariant: '#3E4941',
    outline: '#6E7A71',
    outlineVariant: '#BDCAC0',
    inverseSurface: '#2D312E',
    inverseOnSurface: '#ECF2EE',
    inversePrimary: '#90D6A6',
    error: '#B3261E',
    onError: '#FFFFFF',
    errorContainer: '#F9DEDC',
    onErrorContainer: '#410E0B',
    background: '#F5FBF6',
    onBackground: '#181C1A',
  },
  roundness: 32,
  animation: {
    scale: 1.0,
    defaultDuration: 300,
  },
};

// Paleta equivalente para modo oscuro (no está activada actualmente en
// App.js, pero sigue el mismo esquema de tokens que LightTheme).
export const DarkTheme = {
  colors: {
    primary: '#90D6A6',
    onPrimary: '#02210E',
    primaryContainer: '#0A5228',
    onPrimaryContainer: '#ABF2C1',
    secondary: '#B6CCBC',
    secondaryContainer: '#384B3D',
    onSecondaryContainer: '#D1E8D7',
    tertiaryContainer: '#1A4A52',
    onTertiaryContainer: '#B6ECF4',
    surface: '#101410',
    surfaceContainerLow: '#181C1A',
    surfaceContainer: '#1C201C',
    surfaceContainerHigh: '#262A27',
    surfaceContainerHighest: '#313532',
    onSurface: '#E0E3DF',
    onSurfaceVariant: '#BDCAC0',
    outline: '#879388',
    outlineVariant: '#414941',
    inverseSurface: '#E0E3DF',
    inverseOnSurface: '#2D312E',
    inversePrimary: '#256B42',
    error: '#F2B8B5',
    onError: '#601410',
    errorContainer: '#8C1D18',
    onErrorContainer: '#F9DEDC',
    background: '#101410',
    onBackground: '#E0E3DF',
  },
  roundness: 32,
  animation: {
    scale: 1.0,
    defaultDuration: 300,
  },
};

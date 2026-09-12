// ============================================================================
// CAPA: VISTA (tema visual) — Objeto de tema listo para PaperProvider
// ----------------------------------------------------------------------------
// Extiende el tema base de react-native-paper (MD3LightTheme) con la
// paleta de colores propia de PrestaLab. Es una alternativa reutilizable al
// objeto de tema definido en línea dentro de App.js.
// ============================================================================
import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
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
    error: '#B3261E',
    onError: '#FFFFFF',
    errorContainer: '#F9DEDC',
    onErrorContainer: '#410E0B',
  },
};

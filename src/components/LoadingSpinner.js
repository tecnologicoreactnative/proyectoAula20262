// ============================================================================
// CAPA: VISTA (componente reutilizable de presentación)
// ----------------------------------------------------------------------------
// Indicador de carga genérico. Las pantallas lo muestran mientras esperan
// una respuesta asíncrona del Modelo/servicios (por ejemplo, mientras
// `loading` del VistaModelo de sesión es `true`, ver App.js).
// ============================================================================
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';

export default function LoadingSpinner({ size = 'large', style }) {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

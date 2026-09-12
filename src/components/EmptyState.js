// ============================================================================
// CAPA: VISTA (componente reutilizable de presentación)
// ----------------------------------------------------------------------------
// Componente "tonto" (dumb component): solo recibe props (`icon`, `message`,
// `style`) y las renderiza. No conoce el VistaModelo ni el Modelo; cualquier
// pantalla puede usarlo para mostrar un estado vacío (ej. "sin préstamos",
// "sin artículos") sin duplicar el layout visual.
// ============================================================================
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function EmptyState({ icon = 'package-variant', message, style }) {
  // Se consume el tema global (definido en App.js) para mantener consistencia
  // visual con el resto de la app.
  const theme = useTheme();
  
  return (
    <View style={[styles.container, style]}>
      <MaterialCommunityIcons 
        name={icon} 
        size={48} 
        color={theme.colors.onSurfaceVariant} 
      />
      <Text style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  message: {
    fontSize: 14,
    marginTop: 12,
  },
});

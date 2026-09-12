/**
 * @file LogoInstitucional.js
 * @description Componente visual para renderizar el logo oficial de CanchaYa
 * a partir de assets/Logo.jpeg con dimensiones adaptables, esquinas redondeadas
 * y sombra sutil.
 * @module components/LogoInstitucional
 */

import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { COLORES, SOMBRAS } from '../constants/theme';

export default function LogoInstitucional({
  size = 48,
  style,
  redondeado = true,
  conSombra = false,
}) {
  const radio = redondeado ? Math.round(size * 0.22) : 0;

  return (
    <View
      style={[
        styles.contenedor,
        {
          width: size,
          height: size,
          borderRadius: radio,
        },
        conSombra && SOMBRAS.suave,
        style,
      ]}
    >
      <Image
        source={require('../assets/Logo.jpeg')}
        style={[
          styles.imagen,
          {
            width: size,
            height: size,
            borderRadius: radio,
          },
        ]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    overflow: 'hidden',
    backgroundColor: COLORES.negroInstitucional,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagen: {
    width: '100%',
    height: '100%',
  },
});

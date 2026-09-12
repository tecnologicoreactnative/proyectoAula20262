/**
 * @file Badge.js
 * @description Componente visual atómico para mostrar etiquetas y estados en Cátedras ACUDE
 * (cupos disponibles, agotado/sobrecupo, inscrito, deportiva, cultural).
 * Diseñado con contraste accesible y estilo tipo 'píldora' para su uso en tarjetas y pantallas.
 * @module components/Badge
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { COLORES } from '../constants/theme';

/**
 * Paleta semántica para estados y etiquetas de Cátedras ACUDE.
 * Alineada a la identidad oficial TdeA (Verde Pino, Verde Lima, Gris Neutro y Negro Institucional).
 */
const PALETA_ESTADOS = {
  disponible: {
    fondo: COLORES.exitoFondo,
    texto: COLORES.verdePino,
    borde: '#B8DECA',
    labelPorDefecto: 'Cupos disponibles',
  },
  agotado: {
    fondo: COLORES.alertaFondo,
    texto: COLORES.alerta,
    borde: '#FDE68A',
    labelPorDefecto: 'Agotado (Sobrecupo)',
  },
  inscrito: {
    fondo: COLORES.acentoClaro,
    texto: '#4F6C0C',
    borde: '#CBE58B',
    labelPorDefecto: 'Inscrito',
  },
  cultural: {
    fondo: '#F3F0F7',
    texto: '#4A3B66',
    borde: '#DDD6E8',
    labelPorDefecto: 'Cultural',
  },
  deportiva: {
    fondo: COLORES.exitoFondo,
    texto: COLORES.verdePino,
    borde: COLORES.verdeLima,
    labelPorDefecto: 'Deportiva',
  },
  mantenimiento: {
    fondo: COLORES.alertaFondo,
    texto: COLORES.alerta,
    borde: '#FDE68A',
    labelPorDefecto: 'Mantenimiento',
  },
  cancelado: {
    fondo: COLORES.errorFondo,
    texto: COLORES.error,
    borde: '#FECACA',
    labelPorDefecto: 'Cancelada',
  },
  info: {
    fondo: '#F0F4F1',
    texto: COLORES.verdePino,
    borde: '#C9DCCB',
    labelPorDefecto: 'Info',
  },
  default: {
    fondo: '#F5F7F5',
    texto: COLORES.grisNeutro,
    borde: COLORES.borde,
    labelPorDefecto: 'General',
  },
};

/**
 * Componente Badge reutilizable.
 *
 * @param {Object} props
 * @param {string} [props.texto] - Texto a mostrar. Si no se provee, usa el label por defecto del estado.
 * @param {('disponible'|'agotado'|'inscrito'|'cultural'|'deportiva'|'mantenimiento'|'cancelado'|'info'|'default')} [props.estado='default']
 * @param {('pequeno'|'mediano')} [props.tamano='mediano']
 * @param {object} [props.style]
 * @param {object} [props.textStyle]
 * @returns {React.JSX.Element}
 */
export default function Badge({
  texto,
  estado = 'default',
  tamano = 'mediano',
  style,
  textStyle,
}) {
  const estadoNormalizado = (estado || 'default').toLowerCase().trim();
  const configuracion = PALETA_ESTADOS[estadoNormalizado] || PALETA_ESTADOS.default;
  const textoAMostrar = texto || configuracion.labelPorDefecto;

  return (
    <View
      style={[
        styles.badge,
        tamano === 'pequeno' ? styles.badgePequeno : styles.badgeMediano,
        {
          backgroundColor: configuracion.fondo,
          borderColor: configuracion.borde,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.puntoIndicador,
          { backgroundColor: configuracion.texto },
          tamano === 'pequeno' && styles.puntoPequeno,
        ]}
      />
      <Text
        style={[
          styles.texto,
          tamano === 'pequeno' ? styles.textoPequeno : styles.textoMediano,
          { color: configuracion.texto },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {textoAMostrar}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeMediano: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgePequeno: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  puntoIndicador: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  puntoPequeno: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  texto: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textoMediano: {
    fontSize: 12,
  },
  textoPequeno: {
    fontSize: 11,
  },
});

/**
 * @file DateSelector.js
 * @description Componente visual interactivo para visualizar los días fijos de encuentro semanal
 * de una cátedra ACUDE (Lunes a Sábado).
 * Resalta los días específicos de clase con la paleta institucional TdeA (Verde Pino, Verde Lima, Gris Neutro).
 * @module components/DateSelector
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORES, SOMBRAS } from '../constants/theme';

const DIAS_SEMANA = [
  { clave: 'Lunes', abreviatura: 'Lun', nombreCompleto: 'Lunes' },
  { clave: 'Martes', abreviatura: 'Mar', nombreCompleto: 'Martes' },
  { clave: 'Miércoles', abreviatura: 'Mié', nombreCompleto: 'Miércoles' },
  { clave: 'Jueves', abreviatura: 'Jue', nombreCompleto: 'Jueves' },
  { clave: 'Viernes', abreviatura: 'Vie', nombreCompleto: 'Viernes' },
  { clave: 'Sábado', abreviatura: 'Sáb', nombreCompleto: 'Sábado' },
];

function normalizarTexto(txt = '') {
  return txt
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export default function DateSelector({
  diasActivos = [],
  diaSeleccionado = null,
  onSelectDia,
  style,
}) {
  const diasActivosNormalizados = diasActivos.map(normalizarTexto);

  return (
    <View style={[styles.contenedor, style]}>
      <View style={styles.encabezado}>
        <View style={styles.filaTitulo}>
          <Ionicons name="calendar-outline" size={18} color={COLORES.verdePino} style={{ marginRight: 6 }} />
          <Text style={styles.titulo}>Días de Encuentro Semanal</Text>
        </View>
        <Text style={styles.subtitulo}>
          Verifica que no colisione con tu horario de clases en Campus TdeA
        </Text>
      </View>

      <View style={styles.filaDias}>
        {DIAS_SEMANA.map((item) => {
          const claveNorm = normalizarTexto(item.clave);
          const tieneClase = diasActivosNormalizados.includes(claveNorm);
          const estaSeleccionado =
            diaSeleccionado && normalizarTexto(diaSeleccionado) === claveNorm;

          return (
            <TouchableOpacity
              key={item.clave}
              activeOpacity={0.7}
              onPress={() => {
                if (typeof onSelectDia === 'function') {
                  onSelectDia(item.clave);
                }
              }}
              style={[
                styles.cajaDia,
                tieneClase && styles.cajaDiaActivo,
                estaSeleccionado && styles.cajaDiaSeleccionado,
              ]}
            >
              <Text
                style={[
                  styles.textoAbreviatura,
                  tieneClase && styles.textoAbreviaturaActiva,
                  estaSeleccionado && styles.textoAbreviaturaSeleccionada,
                ]}
              >
                {item.abreviatura}
              </Text>

              {tieneClase ? (
                <View
                  style={[
                    styles.puntoSesion,
                    estaSeleccionado && styles.puntoSesionSeleccionado,
                  ]}
                />
              ) : (
                <Text style={styles.textoLibre}>—</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.leyenda}>
        <View style={styles.itemLeyenda}>
          <View style={[styles.circuloMuestra, styles.muestraActiva]} />
          <Text style={styles.textoLeyenda}>Sesión programada en Campus</Text>
        </View>
        <View style={styles.itemLeyenda}>
          <View style={[styles.circuloMuestra, styles.muestraInactiva]} />
          <Text style={styles.textoLeyenda}>Sin actividad</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    backgroundColor: COLORES.superficie,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.borde,
    marginVertical: 8,
    ...SOMBRAS.suave,
  },
  encabezado: {
    marginBottom: 14,
  },
  filaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORES.negroInstitucional,
  },
  subtitulo: {
    fontSize: 12,
    color: COLORES.grisNeutro,
    marginTop: 2,
  },
  filaDias: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  cajaDia: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORES.superficieGris,
    borderWidth: 1,
    borderColor: COLORES.borde,
  },
  cajaDiaActivo: {
    backgroundColor: COLORES.acentoClaro,
    borderColor: '#CBE58B',
  },
  cajaDiaSeleccionado: {
    backgroundColor: COLORES.verdePino,
    borderColor: COLORES.verdePino,
  },
  textoAbreviatura: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9E9E9E',
    marginBottom: 4,
  },
  textoAbreviaturaActiva: {
    color: COLORES.verdePino,
    fontWeight: '700',
  },
  textoAbreviaturaSeleccionada: {
    color: '#FFFFFF',
  },
  puntoSesion: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORES.verdeLima,
  },
  puntoSesionSeleccionado: {
    backgroundColor: '#FFFFFF',
  },
  textoLibre: {
    fontSize: 10,
    color: '#C5C5C5',
  },
  leyenda: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORES.borde,
  },
  itemLeyenda: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circuloMuestra: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  muestraActiva: {
    backgroundColor: COLORES.verdeLima,
  },
  muestraInactiva: {
    backgroundColor: '#C5C5C5',
  },
  textoLeyenda: {
    fontSize: 11,
    color: COLORES.grisNeutro,
  },
});

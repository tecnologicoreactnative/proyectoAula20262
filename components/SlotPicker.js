/**
 * @file SlotPicker.js
 * @description Componente visual interactivo para renderizar las franjas horarias fijas y recurrentes
 * de una cátedra ACUDE.
 * Permite al estudiante seleccionar interactivamente su franja horaria preferida,
 * resaltando visualmente la sesión elegida con la paleta de identidad oficial TdeA
 * (Verde Pino, Verde Lima, Gris Neutro, Negro Institucional).
 * @module components/SlotPicker
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORES, SOMBRAS } from '../constants/theme';

export default function SlotPicker({
  sesiones = [],
  diaFiltro = null,
  sesionSeleccionada = null,
  onSelectSesion,
  onLimpiarFiltroDia,
  style,
}) {
  const sesionesFiltradas = diaFiltro
    ? sesiones.filter(
        (s) => s.dia?.toLowerCase().trim() === diaFiltro.toLowerCase().trim()
      )
    : sesiones;

  const diasConClase = [...new Set(sesiones.map((s) => s.dia))].filter(Boolean);

  if (sesiones.length === 0) {
    return (
      <View style={[styles.contenedorVacio, style]}>
        <Ionicons name="time-outline" size={36} color={COLORES.grisNeutro} />
        <Text style={styles.textoVacio}>
          No hay franjas horarias configuradas para esta cátedra.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.contenedor, style]}>
      <View style={styles.filaTituloSeccion}>
        <Ionicons name="time-outline" size={18} color={COLORES.verdePino} style={{ marginRight: 6 }} />
        <Text style={styles.tituloSeccion}>Franjas y Sesiones Semanales</Text>
      </View>
      <Text style={styles.descripcionSeccion}>
        {diaFiltro
          ? `Mostrando sesiones programadas para los ${diaFiltro}:`
          : 'Selecciona la franja horaria fija en la que deseas matricularte:'}
      </Text>

      {/* Si se filtró por un día que no tiene clases */}
      {sesionesFiltradas.length === 0 ? (
        <View style={styles.cajaDiaSinSesion}>
          <Ionicons name="calendar-outline" size={24} color={COLORES.alerta} style={{ marginBottom: 6 }} />
          <Text style={styles.tituloDiaSinSesion}>
            Esta cátedra no sesiona los {diaFiltro}
          </Text>
          <Text style={styles.textoDiaSinSesion}>
            Días con clase programada: <Text style={{ fontWeight: '700' }}>{diasConClase.join(', ')}</Text>
          </Text>
          {typeof onLimpiarFiltroDia === 'function' && (
            <TouchableOpacity
              style={styles.botonMostrarTodas}
              onPress={onLimpiarFiltroDia}
              activeOpacity={0.8}
            >
              <Text style={styles.textoBotonMostrarTodas}>Ver todas las franjas semanales</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.listaSesiones}>
          {sesionesFiltradas.map((sesion, index) => {
            const rangoHora = `${sesion.horaInicio || '00:00'} a ${
              sesion.horaFin || '00:00'
            }`;

            const tieneCuposDefinidos = typeof sesion.cuposDisponibles === 'number';
            const cuposDisponibles = tieneCuposDefinidos ? sesion.cuposDisponibles : 1;
            const estaAgotada = tieneCuposDefinidos && cuposDisponibles <= 0;

            const esSeleccionada =
              sesionSeleccionada &&
              (sesionSeleccionada.id === sesion.id ||
                (sesionSeleccionada.dia === sesion.dia &&
                  sesionSeleccionada.horaInicio === sesion.horaInicio));

            return (
              <TouchableOpacity
                key={sesion.id || `sesion-${index}`}
                activeOpacity={0.85}
                onPress={() => onSelectSesion && onSelectSesion(sesion)}
                style={[
                  styles.tarjetaSesion,
                  esSeleccionada && styles.tarjetaSesionSeleccionada,
                  estaAgotada && !esSeleccionada && styles.tarjetaSesionAgotada,
                ]}
              >
                {/* Columna Izquierda: Día, Hora y Cupos individuales */}
                <View style={styles.columnaTiempo}>
                  <View
                    style={[
                      styles.badgeDia,
                      esSeleccionada && styles.badgeDiaSeleccionado,
                    ]}
                  >
                    <Text
                      style={[
                        styles.textoBadgeDia,
                        esSeleccionada && styles.textoBadgeDiaSeleccionado,
                      ]}
                    >
                      {sesion.dia}
                    </Text>
                  </View>
                  <Text style={styles.textoHora}>{rangoHora}</Text>

                  {/* Badge de Cupo de esta sesión */}
                  <View
                    style={[
                      styles.badgeCuposSesion,
                      estaAgotada && styles.badgeCuposAgotados,
                      esSeleccionada && !estaAgotada && styles.badgeCuposSeleccionado,
                    ]}
                  >
                    <Ionicons
                      name={estaAgotada ? 'alert-circle-outline' : 'people-outline'}
                      size={11}
                      color={
                        estaAgotada
                          ? '#B45309'
                          : esSeleccionada
                          ? COLORES.verdePino
                          : COLORES.verdePino
                      }
                      style={{ marginRight: 3 }}
                    />
                    <Text
                      style={[
                        styles.textoBadgeCupos,
                        estaAgotada && styles.textoBadgeCuposAgotados,
                        esSeleccionada && !estaAgotada && styles.textoBadgeCuposSeleccionado,
                      ]}
                    >
                      {estaAgotada
                        ? '0 cupos'
                        : `${cuposDisponibles} ${
                            cuposDisponibles === 1 ? 'cupo libre' : 'cupos libres'
                          }`}
                    </Text>
                  </View>
                </View>

                {/* Divisor vertical */}
                <View
                  style={[
                    styles.divisorVertical,
                    esSeleccionada && styles.divisorVerticalSeleccionado,
                  ]}
                />

                {/* Columna Derecha: Ubicación, Docente y Acción */}
                <View style={styles.columnaInfo}>
                  <View style={styles.filaInfo}>
                    <Ionicons name="location-outline" size={14} color={COLORES.grisNeutro} style={styles.iconoDetalle} />
                    <Text style={styles.textoLugar} numberOfLines={2}>
                      {sesion.lugar || 'Campus Robledo - Bloque 10'}
                    </Text>
                  </View>

                  {sesion.docente && (
                    <View style={styles.filaInfo}>
                      <Ionicons name="person-outline" size={14} color={COLORES.verdePino} style={styles.iconoDetalle} />
                      <Text style={styles.textoDocente} numberOfLines={1}>
                        {sesion.docente}
                      </Text>
                    </View>
                  )}

                  {/* Estado / Botón de Selección interactivo */}
                  {estaAgotada ? (
                    <View
                      style={[
                        styles.pildoraSeleccion,
                        styles.pildoraAgotada,
                        esSeleccionada && styles.pildoraAgotadaSeleccionada,
                      ]}
                    >
                      <Ionicons
                        name="alert-circle"
                        size={14}
                        color="#B45309"
                        style={{ marginRight: 5 }}
                      />
                      <Text style={[styles.textoPildoraSeleccion, { color: '#B45309', fontWeight: '700' }]}>
                        {esSeleccionada
                          ? 'Agotado (Sobrecupo en Bloque 10)'
                          : 'Agotado en app · Ver sobrecupo'}
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.pildoraSeleccion,
                        esSeleccionada && styles.pildoraSeleccionActiva,
                      ]}
                    >
                      <Ionicons
                        name={esSeleccionada ? 'checkmark-circle' : 'radio-button-off'}
                        size={14}
                        color={esSeleccionada ? COLORES.verdePino : COLORES.grisNeutro}
                        style={{ marginRight: 5 }}
                      />
                      <Text
                        style={[
                          styles.textoPildoraSeleccion,
                          esSeleccionada && styles.textoPildoraSeleccionActiva,
                        ]}
                      >
                        {esSeleccionada
                          ? 'Horario seleccionado'
                          : 'Toca para elegir esta franja'}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
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
  contenedorVacio: {
    backgroundColor: COLORES.superficie,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORES.borde,
    marginVertical: 8,
  },
  textoVacio: {
    fontSize: 13,
    color: COLORES.grisNeutro,
    textAlign: 'center',
    marginTop: 8,
  },
  filaTituloSeccion: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tituloSeccion: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORES.negroInstitucional,
  },
  descripcionSeccion: {
    fontSize: 12,
    color: COLORES.grisNeutro,
    marginTop: 3,
    marginBottom: 14,
  },
  cajaDiaSinSesion: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tituloDiaSinSesion: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
    textAlign: 'center',
  },
  textoDiaSinSesion: {
    fontSize: 12,
    color: '#78350F',
    textAlign: 'center',
    marginBottom: 10,
  },
  botonMostrarTodas: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D97706',
  },
  textoBotonMostrarTodas: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  listaSesiones: {
    gap: 10,
  },
  tarjetaSesion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.superficieGris,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: COLORES.borde,
  },
  tarjetaSesionSeleccionada: {
    backgroundColor: COLORES.acentoClaro,
    borderColor: COLORES.verdePino,
    ...SOMBRAS.suave,
  },
  columnaTiempo: {
    width: 105,
    alignItems: 'flex-start',
  },
  badgeDia: {
    backgroundColor: '#E5E9E5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: COLORES.borde,
  },
  badgeDiaSeleccionado: {
    backgroundColor: COLORES.verdePino,
    borderColor: COLORES.verdePino,
  },
  textoBadgeDia: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.negroInstitucional,
  },
  textoBadgeDiaSeleccionado: {
    color: '#FFFFFF',
  },
  textoHora: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.negroInstitucional,
  },
  divisorVertical: {
    width: 1,
    height: '85%',
    backgroundColor: COLORES.borde,
    marginHorizontal: 12,
  },
  divisorVerticalSeleccionado: {
    backgroundColor: '#CBE58B',
  },
  columnaInfo: {
    flex: 1,
  },
  filaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconoDetalle: {
    marginRight: 6,
  },
  textoLugar: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORES.negroInstitucional,
    flex: 1,
  },
  textoDocente: {
    fontSize: 12,
    color: COLORES.grisNeutro,
    flex: 1,
  },
  pildoraSeleccion: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORES.borde,
    marginTop: 4,
  },
  pildoraSeleccionActiva: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORES.verdePino,
  },
  pildoraAgotada: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  pildoraAgotadaSeleccionada: {
    borderColor: '#D97706',
    borderWidth: 1.5,
  },
  textoPildoraSeleccion: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORES.grisNeutro,
  },
  textoPildoraSeleccionActiva: {
    color: COLORES.verdePino,
    fontWeight: '700',
  },
  tarjetaSesionAgotada: {
    opacity: 0.85,
    backgroundColor: '#FAF5EF',
    borderColor: '#E2D9CF',
  },
  badgeCuposSesion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  badgeCuposAgotados: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  badgeCuposSeleccionado: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORES.verdePino,
  },
  textoBadgeCupos: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORES.verdePino,
  },
  textoBadgeCuposAgotados: {
    color: '#92400E',
  },
  textoBadgeCuposSeleccionado: {
    color: COLORES.verdePino,
  },
});

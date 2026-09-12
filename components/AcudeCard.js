/**
 * @file AcudeCard.js
 * @description Componente visual para renderizar la tarjeta de una Cátedra o Actividad ACUDE
 * (Bienestar Institucional TdeA).
 * Utiliza la paleta oficial institucional (Verde Pino, Verde Lima, Gris Neutro, Negro Institucional)
 * e iconografía vectorial profesional de Ionicons.
 * @module components/AcudeCard
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from './Badge';
import { COLORES, SOMBRAS } from '../constants/theme';

/**
 * Nombres de íconos Ionicons según disciplina.
 */
const ICONOS_IONICONS = {
  fútbol: 'football-outline',
  futbol: 'football-outline',
  danza: 'musical-notes-outline',
  teatro: 'color-palette-outline',
  fitness: 'fitness-outline',
  acondicionamiento: 'fitness-outline',
  voleibol: 'tennisball-outline',
  tenis: 'tennisball-outline',
  ajedrez: 'grid-outline',
  cultural: 'color-palette-outline',
  deportiva: 'trophy-outline',
};

function obtenerNombreIconoDisciplina(disciplina = '', categoria = '') {
  const texto = `${disciplina} ${categoria}`.toLowerCase();
  for (const [clave, icono] of Object.entries(ICONOS_IONICONS)) {
    if (texto.includes(clave)) return icono;
  }
  return categoria.toLowerCase() === 'cultural'
    ? 'color-palette-outline'
    : 'trophy-outline';
}

/**
 * Genera un resumen legible de los días y horas de las sesiones semanales.
 */
function formatearResumenHorario(horarios = []) {
  if (!horarios || horarios.length === 0) {
    return 'Horario por programar';
  }

  const dias = horarios.map((h) => (h.dia || '').slice(0, 3));
  const diasTexto = dias.join(' y ');
  const primeraSesion = horarios[0];
  const rango = `${primeraSesion.horaInicio || '00:00'} - ${primeraSesion.horaFin || '00:00'}`;

  return `${diasTexto} · ${rango}`;
}

export default function AcudeCard({ acude, onPress, style }) {
  const [errorImagen, setErrorImagen] = useState(false);

  const {
    id = '',
    nombre = 'Cátedra sin nombre',
    categoria = 'Deportiva',
    disciplina = 'General',
    ubicacion = 'Campus Robledo - Bloque 10',
    docente = 'Docente asignado',
    cupoTotal = 25,
    cuposDisponibles = 0,
    horarios = [],
    imagenUrl,
  } = acude || {};

  const nombreIcono = obtenerNombreIconoDisciplina(disciplina, categoria);
  const tieneImagenValida = Boolean(imagenUrl) && !errorImagen;
  const resumenHorario = formatearResumenHorario(horarios);
  const estadoCupo = cuposDisponibles > 0 ? 'disponible' : 'agotado';

  const handlePress = () => {
    if (typeof onPress === 'function') {
      onPress(acude);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={[styles.tarjeta, style]}
      accessibilityRole="button"
      accessibilityLabel={`Cátedra ACUDE: ${nombre}, Categoría: ${categoria}, Cupos disponibles: ${cuposDisponibles}`}
    >
      {/* Cabecera con Imagen / Placeholder */}
      <View style={styles.contenedorImagen}>
        {tieneImagenValida ? (
          <Image
            source={{ uri: imagenUrl }}
            style={styles.imagen}
            resizeMode="cover"
            onError={() => setErrorImagen(true)}
          />
        ) : (
          <View style={styles.placeholderImagen}>
            <View style={styles.circuloIconoPlaceholder}>
              <Ionicons name={nombreIcono} size={36} color={COLORES.verdePino} />
            </View>
            <Text style={styles.placeholderTexto}>{disciplina || categoria}</Text>
          </View>
        )}

        {/* Badge de Categoría flotante */}
        <View style={styles.badgeCategoriaFlotante}>
          <Badge
            estado={categoria === 'Cultural' ? 'cultural' : 'deportiva'}
            texto={categoria}
            tamano="pequeno"
          />
        </View>

        {/* Badge de Cupo flotante */}
        <View style={styles.badgeCupoFlotante}>
          <Badge
            estado={estadoCupo}
            texto={
              cuposDisponibles > 0
                ? `${cuposDisponibles} cupos disp.`
                : 'Agotado (Sobrecupo)'
            }
            tamano="pequeno"
          />
        </View>

        {/* Franja horaria sobre la imagen */}
        <View style={styles.franjaHorariaFlotante}>
          <Ionicons name="time-outline" size={13} color="#FFFFFF" style={styles.iconoReloj} />
          <Text style={styles.textoFranjaFlotante}>{resumenHorario}</Text>
        </View>
      </View>

      {/* Cuerpo Informativo */}
      <View style={styles.cuerpo}>
        {/* Título de la actividad */}
        <Text style={styles.nombre} numberOfLines={2}>
          {nombre}
        </Text>

        {/* Docente / Tutor */}
        <View style={styles.filaDetalle}>
          <Ionicons name="person-outline" size={14} color={COLORES.verdePino} style={styles.iconoDetalle} />
          <Text style={styles.textoDocente} numberOfLines={1}>
            {docente}
          </Text>
        </View>

        {/* Ubicación en Campus (Bloque 10) */}
        <View style={styles.filaDetalle}>
          <Ionicons name="location-outline" size={14} color={COLORES.grisNeutro} style={styles.iconoDetalle} />
          <Text style={styles.textoUbicacion} numberOfLines={1}>
            {ubicacion}
          </Text>
        </View>

        {/* Fila inferior: Indicador de aforo y enlace */}
        <View style={styles.filaInferior}>
          <View style={styles.contenedorCupos}>
            <Ionicons name="people-outline" size={15} color={COLORES.grisNeutro} style={{ marginRight: 5 }} />
            <Text style={styles.labelCupos}>
              Aforo: <Text style={styles.valorCupos}>{cuposDisponibles}</Text> / {cupoTotal}
            </Text>
            {horarios.length > 1 && (
              <Text style={styles.textoMultiplesHorarios}>
                · {horarios.length} horarios
              </Text>
            )}
          </View>

          <View style={styles.botonAccion}>
            <Text style={styles.textoBotonAccion}>Ver ficha</Text>
            <Ionicons name="arrow-forward" size={14} color={COLORES.verdePino} style={{ marginLeft: 4 }} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: COLORES.superficie,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORES.borde,
    ...SOMBRAS.suave,
  },
  contenedorImagen: {
    width: '100%',
    height: 160,
    backgroundColor: COLORES.superficieGris,
    position: 'relative',
  },
  imagen: {
    width: '100%',
    height: '100%',
  },
  placeholderImagen: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EAF5EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloIconoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#CBE58B',
  },
  placeholderTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.verdePino,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeCategoriaFlotante: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  badgeCupoFlotante: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  franjaHorariaFlotante: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    backgroundColor: 'rgba(33, 25, 21, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconoReloj: {
    marginRight: 5,
  },
  textoFranjaFlotante: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cuerpo: {
    padding: 16,
  },
  nombre: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORES.negroInstitucional,
    marginBottom: 8,
    lineHeight: 22,
  },
  filaDetalle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconoDetalle: {
    marginRight: 7,
  },
  textoDocente: {
    fontSize: 13,
    color: COLORES.negroInstitucional,
    fontWeight: '600',
    flex: 1,
  },
  textoUbicacion: {
    fontSize: 12,
    color: COLORES.grisNeutro,
    flex: 1,
  },
  filaInferior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORES.borde,
  },
  contenedorCupos: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelCupos: {
    fontSize: 12,
    color: COLORES.grisNeutro,
    fontWeight: '500',
  },
  valorCupos: {
    fontWeight: '800',
    color: COLORES.verdePino,
  },
  textoMultiplesHorarios: {
    fontSize: 11,
    color: COLORES.verdePino,
    fontWeight: '600',
    marginLeft: 4,
  },
  botonAccion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.acentoClaro,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBE58B',
  },
  textoBotonAccion: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.verdePino,
  },
});

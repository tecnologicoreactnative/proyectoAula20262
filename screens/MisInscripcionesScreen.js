/**
 * @file MisInscripcionesScreen.js
 * @description Pantalla para la gestión y consulta de Cátedras ACUDE matriculadas por el estudiante.
 * Permite visualizar el horario semanal de los talleres activos y cancelar atómicamente la inscripción
 * para liberar el cupo en Cloud Firestore.
 * Diseñado con la identidad visual institucional oficial TdeA (Verde Pino, Verde Lima, Gris Neutro y Negro Institucional)
 * e iconografía vectorial profesional de Ionicons.
 * @module screens/MisInscripcionesScreen
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../components/Badge';
import { useAuth } from '../contexts/AuthContexto';
import {
  getMisInscripciones,
  cancelarInscripcion,
} from '../services/inscripcionesService';
import { COLORES, SOMBRAS } from '../constants/theme';

export default function MisInscripcionesScreen({ navigation }) {
  const { user } = useAuth();
  const [inscripciones, setInscripciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [cancelandoId, setCancelandoId] = useState(null);

  const cargarInscripciones = useCallback(async () => {
    if (!user?.uid) {
      setCargando(false);
      setRefrescando(false);
      return;
    }

    try {
      const data = await getMisInscripciones(user.uid);
      setInscripciones(data);
    } catch (err) {
      console.error('Error al cargar mis inscripciones:', err);
      Alert.alert('Error', 'No se pudieron cargar tus cátedras inscritas.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    cargarInscripciones();
  }, [cargarInscripciones]);

  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      cargarInscripciones();
    });
    return unsubscribe;
  }, [navigation, cargarInscripciones]);

  const handleRefrescar = () => {
    setRefrescando(true);
    cargarInscripciones();
  };

  const handleConfirmarCancelacion = (item) => {
    Alert.alert(
      'Cancelar Inscripción',
      `¿Estás seguro de cancelar tu inscripción a "${item.nombreAcude}"?\n\nTu cupo quedará inmediatamente liberado para que otro estudiante pueda matricularse o solicitar sobrecupo presencial.`,
      [
        { text: 'No, Conservar mi cupo', style: 'cancel' },
        {
          text: 'Sí, Cancelar Inscripción',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelandoId(item.id);
              await cancelarInscripcion(item.id, item.idAcude || item.acudeId);

              setInscripciones((prev) => prev.filter((i) => i.id !== item.id));
              await cargarInscripciones();

              Alert.alert(
                'Inscripción Cancelada',
                'Tu cupo ha sido liberado exitosamente en el sistema.'
              );
            } catch (err) {
              Alert.alert('Error al cancelar', err.message);
            } finally {
              setCancelandoId(null);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const estaCancelando = cancelandoId === item.id;
    const horarios = item.horarios || [];
    const resumenHorarios =
      horarios.length > 0
        ? horarios
            .map((h) => `${h.dia || ''}: ${h.horaInicio || ''} - ${h.horaFin || ''}`)
            .join(' | ')
        : 'Horario según programación institucional';

    return (
      <View style={styles.tarjetaInscripcion}>
        {/* Cabecera de la tarjeta */}
        <View style={styles.cabeceraTarjeta}>
          <View style={styles.columnaTitulo}>
            <Badge
              estado={item.categoria === 'Cultural' ? 'cultural' : 'deportiva'}
              texto={item.categoria}
              tamano="pequeno"
            />
            <Text style={styles.nombreAcude}>{item.nombreAcude}</Text>
          </View>
          <Badge estado="inscrito" texto="Matriculado" tamano="pequeno" />
        </View>

        {/* Detalles operativos */}
        <View style={styles.cuerpoTarjeta}>
          <View style={styles.filaDetalle}>
            <Ionicons name="person-outline" size={14} color={COLORES.verdePino} style={styles.iconoDetalle} />
            <Text style={styles.textoDetalle}>Docente: {item.docente}</Text>
          </View>

          <View style={styles.filaDetalle}>
            <Ionicons name="location-outline" size={14} color={COLORES.grisNeutro} style={styles.iconoDetalle} />
            <Text style={styles.textoDetalle}>Lugar: {item.ubicacion}</Text>
          </View>

          {item.diaSeleccionado && item.franjaSeleccionada ? (
            <View style={styles.cajaFranjaMatriculada}>
              <View style={styles.filaFranjaMatriculada}>
                <Ionicons name="calendar" size={16} color={COLORES.verdePino} style={styles.iconoDetalle} />
                <Text style={styles.textoFranjaMatriculada}>
                  Franja Matriculada: <Text style={styles.textoFranjaResaltada}>{item.diaSeleccionado} · {item.franjaSeleccionada}</Text>
                </Text>
              </View>
              {item.lugarSesion ? (
                <View style={[styles.filaFranjaMatriculada, { marginTop: 3 }]}>
                  <Ionicons name="location-outline" size={14} color={COLORES.grisNeutro} style={styles.iconoDetalle} />
                  <Text style={styles.textoLugarSesion} numberOfLines={1}>{item.lugarSesion}</Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.filaDetalle}>
              <Ionicons name="time-outline" size={14} color={COLORES.verdePino} style={styles.iconoDetalle} />
              <Text style={styles.textoDetalleResaltado}>
                {resumenHorarios}
              </Text>
            </View>
          )}

          <View style={styles.cajaRecordatorio}>
            <Ionicons name="information-circle-outline" size={15} color={COLORES.verdePino} style={{ marginRight: 6 }} />
            <Text style={styles.textoRecordatorio}>
              Recuerda cumplir con el 80% de asistencia mínima para validar créditos de Bienestar.
            </Text>
          </View>
        </View>

        {/* Pie de tarjeta con botón de cancelación */}
        <View style={styles.pieTarjeta}>
          <Text style={styles.fechaInscripcion}>
            Inscrito: {item.fechaInscripcion?.slice(0, 10) || 'Semestre 2026-2'}
          </Text>

          <TouchableOpacity
            style={styles.botonCancelar}
            onPress={() => handleConfirmarCancelacion(item)}
            disabled={estaCancelando}
            activeOpacity={0.8}
          >
            {estaCancelando ? (
              <ActivityIndicator size="small" color={COLORES.error} />
            ) : (
              <Text style={styles.textoBotonCancelar}>Liberar Cupo</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.contenedor}>
      {cargando && !refrescando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={COLORES.verdePino} />
          <Text style={styles.textoCargando}>Cargando tus inscripciones...</Text>
        </View>
      ) : inscripciones.length === 0 ? (
        <View style={styles.centroVacio}>
          <View style={styles.iconoVacioContenedor}>
            <Ionicons name="calendar-outline" size={38} color={COLORES.verdePino} />
          </View>
          <Text style={styles.tituloVacio}>Sin Cátedras Inscritas</Text>
          <Text style={styles.descripcionVacio}>
            Aún no te has matriculado en ninguna Cátedra ACUDE para este semestre.
            Explora la oferta de bienestar y reserva tu cupo semanal.
          </Text>
          <TouchableOpacity
            style={styles.botonExplorar}
            onPress={() => navigation.navigate('InicioTab')}
            activeOpacity={0.85}
          >
            <Text style={styles.textoBotonExplorar}>
              Explorar Cátedras ACUDE
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.contenedorLista}>
          <FlatList
            data={inscripciones}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listaScroll}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refrescando}
                onRefresh={handleRefrescar}
                colors={[COLORES.verdePino]}
                tintColor={COLORES.verdePino}
              />
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  textoCargando: {
    marginTop: 12,
    fontSize: 14,
    color: COLORES.grisNeutro,
  },
  centroVacio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconoVacioContenedor: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORES.acentoClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CBE58B',
  },
  tituloVacio: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORES.negroInstitucional,
    marginBottom: 8,
  },
  descripcionVacio: {
    fontSize: 14,
    color: COLORES.grisNeutro,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  botonExplorar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.verdePino,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 12,
    ...SOMBRAS.boton,
  },
  textoBotonExplorar: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  contenedorLista: {
    flex: 1,
    padding: 16,
  },
  listaScroll: {
    paddingBottom: 24,
  },
  tarjetaInscripcion: {
    backgroundColor: COLORES.superficie,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.borde,
    marginBottom: 14,
    ...SOMBRAS.suave,
  },
  cabeceraTarjeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.borde,
  },
  columnaTitulo: {
    flex: 1,
    paddingRight: 8,
    gap: 4,
  },
  nombreAcude: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORES.negroInstitucional,
    marginTop: 2,
  },
  cuerpoTarjeta: {
    marginBottom: 12,
  },
  filaDetalle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconoDetalle: {
    marginRight: 8,
  },
  textoDetalle: {
    fontSize: 13,
    color: COLORES.negroInstitucional,
    fontWeight: '500',
    flex: 1,
  },
  textoDetalleResaltado: {
    fontSize: 13,
    color: COLORES.verdePino,
    fontWeight: '700',
    flex: 1,
  },
  cajaFranjaMatriculada: {
    backgroundColor: '#F0F7F2',
    borderWidth: 1,
    borderColor: '#CBE58B',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  filaFranjaMatriculada: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoFranjaMatriculada: {
    fontSize: 13,
    color: COLORES.negroInstitucional,
    fontWeight: '600',
    flex: 1,
  },
  textoFranjaResaltada: {
    color: COLORES.verdePino,
    fontWeight: '800',
  },
  textoLugarSesion: {
    fontSize: 11,
    color: COLORES.grisNeutro,
    flex: 1,
    marginLeft: 22,
  },
  cajaRecordatorio: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.superficieGris,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORES.borde,
    marginTop: 6,
  },
  textoRecordatorio: {
    fontSize: 11,
    color: COLORES.grisNeutro,
    lineHeight: 16,
    flex: 1,
  },
  pieTarjeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORES.borde,
  },
  fechaInscripcion: {
    fontSize: 11,
    color: '#9E9E9E',
  },
  botonCancelar: {
    backgroundColor: COLORES.errorFondo,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  textoBotonCancelar: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.error,
  },
});

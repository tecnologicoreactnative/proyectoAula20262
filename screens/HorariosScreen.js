/**
 * @file HorariosScreen.js
 * @description Pantalla para la consulta del cronograma semanal detallado y selección de franja
 * para la inscripción formal a una Cátedra ACUDE.
 * Integra:
 * - DateSelector: visualizador interactivo de días de clase para evitar cruces con Campus TdeA.
 * - SlotPicker: selección interactiva de sesiones fijas (día, franja horaria, espacio en Bloque 10 y docente).
 * - Matrícula directa con captura explícita de la franja horaria elegida por el estudiante.
 * - Módulo de Sobrecupo Presencial Directo: orientación al estudiante para presentarse
 *   físicamente en la primera sesión directamente con el profesor en el aula/escenario sin trámites de oficina.
 * @module screens/HorariosScreen
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../components/Badge';
import DateSelector from '../components/DateSelector';
import SlotPicker from '../components/SlotPicker';
import { getHorariosAcude } from '../services/disponibilidadService';
import {
  inscribirEstudiante,
  verificarInscripcionPrevia,
} from '../services/inscripcionesService';
import { useAuth } from '../contexts/AuthContexto';
import { COLORES, SOMBRAS } from '../constants/theme';

export default function HorariosScreen({ route, navigation }) {
  const { acude } = route.params || {};
  const { user } = useAuth();

  const [horariosData, setHorariosData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);
  const [estaInscrito, setEstaInscrito] = useState(false);
  const [inscribiendo, setInscribiendo] = useState(false);

  // Revisar si ya está inscrito
  const verificarEstado = useCallback(async () => {
    if (!acude?.id || !user?.uid) return;
    try {
      const inscripcion = await verificarInscripcionPrevia(acude.id, user.uid);
      setEstaInscrito(Boolean(inscripcion));
    } catch (err) {
      console.warn('Error al verificar inscripción:', err);
    }
  }, [acude?.id, user?.uid]);

  useEffect(() => {
    verificarEstado();
  }, [verificarEstado]);

  const cargarHorarios = useCallback(async () => {
    if (!acude?.id) {
      setCargando(false);
      return;
    }

    try {
      const data = await getHorariosAcude(acude.id);
      setHorariosData(data);
      if (Array.isArray(data.sesiones) && data.sesiones.length > 0) {
        setSesionSeleccionada((prev) => {
          if (prev) {
            const matching = data.sesiones.find(
              (s) =>
                (prev.id && s.id === prev.id) ||
                (s.dia === prev.dia && s.horaInicio === prev.horaInicio)
            );
            if (matching) return matching;
          }
          return data.sesiones.find((s) => s.hayCupo) || data.sesiones[0];
        });
      }
    } catch (err) {
      console.error('Error al cargar cronograma semanal:', err);
    } finally {
      setCargando(false);
    }
  }, [acude?.id]);

  useEffect(() => {
    cargarHorarios();
  }, [cargarHorarios]);

  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      verificarEstado();
      cargarHorarios();
    });
    return unsubscribe;
  }, [navigation, verificarEstado, cargarHorarios]);

  if (!acude) {
    return (
      <SafeAreaView style={styles.contenedor}>
        <View style={styles.centro}>
          <Text style={styles.textoError}>No se recibieron datos de la cátedra.</Text>
          <TouchableOpacity
            style={styles.botonVolver}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.textoBotonVolver}>Volver al Catálogo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const sesiones = horariosData?.sesiones || acude.horarios || [];
  const diasActivos = horariosData?.diasSemanales || sesiones.map((s) => s.dia);
  const cuposDisponibles = horariosData?.cuposDisponibles ?? acude.cuposDisponibles ?? 0;
  const hayCupos = cuposDisponibles > 0;

  // Al seleccionar un día en DateSelector, ajustar la sesión elegida si es relevante
  const handleSelectDia = (dia) => {
    if (diaSeleccionado === dia) {
      setDiaSeleccionado(null);
    } else {
      setDiaSeleccionado(dia);
      const sesionesDelDia = sesiones.filter(
        (s) => s.dia?.toLowerCase().trim() === dia.toLowerCase().trim()
      );
      if (sesionesDelDia.length > 0) {
        const conCupo = sesionesDelDia.find((s) => s.hayCupo);
        setSesionSeleccionada(conCupo || sesionesDelDia[0]);
      }
    }
  };

  // Manejador de Matrícula directa con la franja seleccionada
  const handleInscribirEnHorario = () => {
    if (!user) {
      Alert.alert(
        'Iniciar Sesión',
        'Debes iniciar sesión para inscribirte a una cátedra ACUDE.'
      );
      return;
    }

    if (!sesionSeleccionada) {
      Alert.alert('Selecciona un Horario', 'Toca una de las franjas horarias disponibles para elegir tu horario.');
      return;
    }

    const cuposSesion =
      typeof sesionSeleccionada.cuposDisponibles === 'number'
        ? sesionSeleccionada.cuposDisponibles
        : cuposDisponibles;

    if (cuposSesion <= 0) {
      Alert.alert(
        'Cupos Agotados en esta Franja',
        `Los cupos en la app para el horario de los ${sesionSeleccionada.dia} (${sesionSeleccionada.horaInicio} - ${sesionSeleccionada.horaFin}) están agotados.\n\nPor favor selecciona otro horario disponible o consulta con el docente para sobrecupo presencial en la primera sesión en Bloque 10.`,
        [{ text: 'Entendido', style: 'default' }]
      );
      return;
    }

    const diaTexto = sesionSeleccionada.dia;
    const rangoTexto = `${sesionSeleccionada.horaInicio || '00:00'} - ${sesionSeleccionada.horaFin || '00:00'}`;

    Alert.alert(
      'Confirmar Matrícula por Horario',
      `¿Deseas matricularte en "${acude.nombre}"?\n\n• Horario elegido: ${diaTexto} de ${rangoTexto}\n• Espacio: ${sesionSeleccionada.lugar || acude.ubicacion}\n• Docente: ${acude.docente}\n\n⚠️ Recuerda: 80% de asistencia mínima obligatoria para acreditar el taller.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, Confirmar Matrícula',
          onPress: async () => {
            try {
              setInscribiendo(true);
              const respuesta = await inscribirEstudiante(acude.id, user.uid, {
                email: user.email,
                nombre: user.displayName,
                horarioSeleccionado: sesionSeleccionada,
                diaSeleccionado: diaTexto,
                franjaSeleccionada: rangoTexto,
              });

              setEstaInscrito(true);
              await cargarHorarios();

              Alert.alert(
                '¡Matrícula Exitosa!',
                respuesta.mensaje || `Te has inscrito formalmente en los ${diaTexto} (${rangoTexto}).`,
                [
                  {
                    text: 'Ver Mis Cátedras',
                    onPress: () => navigation.navigate('MisInscripcionesTab'),
                  },
                  { text: 'Aceptar', style: 'default' },
                ]
              );
            } catch (err) {
              Alert.alert('No fue posible inscribirte', err.message);
            } finally {
              setInscribiendo(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Cabecera Informativa de la Cátedra */}
        <View style={styles.tarjetaCabecera}>
          <View style={styles.filaEncabezado}>
            <View style={styles.columnaTitulo}>
              <Text style={styles.subtituloCampus}>Campus Robledo · Bloque 10</Text>
              <Text style={styles.tituloCatedra}>{acude.nombre}</Text>
            </View>
            <Badge
              estado={hayCupos ? 'disponible' : 'agotado'}
              texto={hayCupos ? `${cuposDisponibles} cupos` : 'Agotado'}
              tamano="pequeno"
            />
          </View>

          <View style={styles.filaInfoCabecera}>
            <Ionicons name="person-outline" size={15} color={COLORES.verdePino} style={styles.iconoInfo} />
            <Text style={styles.textoDocente}>{acude.docente}</Text>
          </View>

          <View style={styles.filaInfoCabecera}>
            <Ionicons name="location-outline" size={15} color={COLORES.grisNeutro} style={styles.iconoInfo} />
            <Text style={styles.textoUbicacion}>{acude.ubicacion}</Text>
          </View>
        </View>

        {/* Componente DateSelector: Días semanales para validar contra Campus TdeA */}
        <DateSelector
          diasActivos={diasActivos}
          diaSeleccionado={diaSeleccionado}
          onSelectDia={handleSelectDia}
        />

        {/* Componente SlotPicker: Desglose interactivo con selección de franja */}
        {cargando ? (
          <View style={styles.centroCarga}>
            <ActivityIndicator size="small" color={COLORES.verdePino} />
            <Text style={styles.textoCargando}>Cargando franjas horarias...</Text>
          </View>
        ) : (
          <SlotPicker
            sesiones={sesiones}
            diaFiltro={diaSeleccionado}
            sesionSeleccionada={sesionSeleccionada}
            onSelectSesion={(sesion) => setSesionSeleccionada(sesion)}
            onLimpiarFiltroDia={() => setDiaSeleccionado(null)}
          />
        )}

        {/* Módulo de Acción: Matrícula Directa en el Horario Seleccionado */}
        {estaInscrito ? (
          <View style={styles.cajaYaInscrito}>
            <View style={styles.filaYaInscrito}>
              <Ionicons name="checkmark-circle" size={20} color={COLORES.verdePino} style={{ marginRight: 8 }} />
              <Text style={styles.textoYaInscrito}>
                Ya tienes una matrícula activa en esta cátedra ACUDE
              </Text>
            </View>
            <TouchableOpacity
              style={styles.botonVerInscripciones}
              onPress={() => navigation.navigate('MisInscripcionesTab')}
            >
              <Text style={styles.textoBotonVerInscripciones}>
                Ver mis cátedras matriculadas →
              </Text>
            </TouchableOpacity>
          </View>
        ) : hayCupos ? (
          (() => {
            const cuposSesion =
              sesionSeleccionada && typeof sesionSeleccionada.cuposDisponibles === 'number'
                ? sesionSeleccionada.cuposDisponibles
                : cuposDisponibles;
            const estaSesionAgotada = cuposSesion <= 0;

            return (
              <View style={styles.cajaAccionMatricula}>
                <View style={styles.filaResumenSeleccion}>
                  <Ionicons name="time" size={18} color={COLORES.verdePino} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.labelFranjaElegida}>Franja seleccionada para tu matrícula:</Text>
                    <Text style={styles.valorFranjaElegida}>
                      {sesionSeleccionada
                        ? `${sesionSeleccionada.dia} · ${sesionSeleccionada.horaInicio} a ${sesionSeleccionada.horaFin}`
                        : 'Toca una de las franjas arriba'}
                    </Text>
                    {sesionSeleccionada && typeof sesionSeleccionada.cuposDisponibles === 'number' && (
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '700',
                          color:
                            sesionSeleccionada.cuposDisponibles > 0
                              ? COLORES.verdePino
                              : '#B45309',
                          marginTop: 3,
                        }}
                      >
                        {sesionSeleccionada.cuposDisponibles > 0
                          ? `Disponibilidad: ${sesionSeleccionada.cuposDisponibles} ${
                              sesionSeleccionada.cuposDisponibles === 1
                                ? 'cupo libre'
                                : 'cupos libres'
                            }`
                          : '⚠️ Cupos oficiales agotados en esta franja (Consulta sobrecupo presencial)'}
                      </Text>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.botonConfirmarMatricula,
                    (!sesionSeleccionada || inscribiendo || estaSesionAgotada) &&
                      styles.botonDeshabilitado,
                  ]}
                  onPress={handleInscribirEnHorario}
                  disabled={!sesionSeleccionada || inscribiendo || estaSesionAgotada}
                  activeOpacity={0.85}
                >
                  {inscribiendo ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <View style={styles.filaBotonTexto}>
                      <Ionicons
                        name={
                          estaSesionAgotada
                            ? 'alert-circle-outline'
                            : 'checkmark-done-outline'
                        }
                        size={18}
                        color="#FFFFFF"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.textoBotonConfirmarMatricula}>
                        {estaSesionAgotada
                          ? 'Franja Horaria Agotada'
                          : 'Matricularme en esta Franja'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            );
          })()
        ) : null}

        {/* Banner de Sobrecupo Presencial Directo con el Docente */}
        <View style={styles.panelSobrecupo}>
          <View style={styles.filaTituloSobrecupo}>
            <Ionicons name="information-circle" size={20} color="#92400E" style={styles.iconoSobrecupo} />
            <Text style={styles.tituloSobrecupo}>
              Guía de Sobrecupo Presencial en Campus
            </Text>
          </View>

          <Text style={styles.parrafoSobrecupo}>
            <Text style={styles.textoNegrita}>¿No alcanzaste cupo en la app o en Campus TdeA? </Text>
            No tienes que ir a buscar oficinas administrativas de Bienestar ni realizar filas.
          </Text>

          <View style={styles.cajaPasoSobrecupo}>
            <Text style={styles.pasoSobrecupo}>
              1. <Text style={styles.textoNegrita}>Preséntate directamente en la primera sesión:</Text> Dirígete al espacio exacto de la clase en el <Text style={styles.textoResaltado}>{acude.ubicacion}</Text> en los horarios indicados arriba.
            </Text>
            <Text style={styles.pasoSobrecupo}>
              2. <Text style={styles.textoNegrita}>Habla en persona con el docente:</Text> Solicita autorización de sobrecupo directamente a <Text style={styles.textoResaltado}>{acude.docente}</Text>.
            </Text>
            <Text style={styles.pasoSobrecupo}>
              3. <Text style={styles.textoNegrita}>Ocupación de cupos liberados:</Text> Como las inasistencias reiteradas cancelan automáticamente el curso a estudiantes ausentes, el docente puede admitirte en sitio para cubrir esas vacantes.
            </Text>
          </View>
        </View>

        {/* Botones de Navegación Inferior */}
        <View style={styles.contenedorBotones}>
          <TouchableOpacity
            style={styles.botonVolver}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.textoBotonVolver}>Volver a Ficha Técnica</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  tarjetaCabecera: {
    backgroundColor: COLORES.superficie,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.borde,
    marginBottom: 10,
    ...SOMBRAS.suave,
  },
  filaEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  columnaTitulo: {
    flex: 1,
    paddingRight: 8,
  },
  subtituloCampus: {
    fontSize: 11,
    color: COLORES.verdePino,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  tituloCatedra: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORES.negroInstitucional,
    lineHeight: 23,
  },
  filaInfoCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  iconoInfo: {
    marginRight: 7,
  },
  textoDocente: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.negroInstitucional,
  },
  textoUbicacion: {
    fontSize: 12,
    color: COLORES.grisNeutro,
    flex: 1,
  },
  centroCarga: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoCargando: {
    fontSize: 13,
    color: COLORES.grisNeutro,
    marginTop: 6,
  },
  cajaAccionMatricula: {
    backgroundColor: COLORES.superficie,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#CBE58B',
    marginVertical: 10,
    ...SOMBRAS.suave,
  },
  filaResumenSeleccion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: COLORES.acentoClaro,
    padding: 10,
    borderRadius: 10,
  },
  labelFranjaElegida: {
    fontSize: 11,
    color: '#4F6C0C',
    fontWeight: '600',
  },
  valorFranjaElegida: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORES.verdePino,
    marginTop: 1,
  },
  botonConfirmarMatricula: {
    backgroundColor: COLORES.verdePino,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...SOMBRAS.boton,
  },
  botonDeshabilitado: {
    backgroundColor: '#9E9E9E',
  },
  filaBotonTexto: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoBotonConfirmarMatricula: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cajaYaInscrito: {
    backgroundColor: COLORES.exitoFondo,
    borderWidth: 1,
    borderColor: '#B8DECA',
    borderRadius: 14,
    padding: 14,
    marginVertical: 10,
    alignItems: 'center',
  },
  filaYaInscrito: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  textoYaInscrito: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.verdePino,
    flex: 1,
  },
  botonVerInscripciones: {
    paddingVertical: 4,
  },
  textoBotonVerInscripciones: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.verdePino,
  },
  panelSobrecupo: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginVertical: 10,
  },
  filaTituloSobrecupo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconoSobrecupo: {
    marginRight: 8,
  },
  tituloSobrecupo: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  parrafoSobrecupo: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 19,
    marginBottom: 10,
  },
  cajaPasoSobrecupo: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  pasoSobrecupo: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 18,
  },
  textoNegrita: {
    fontWeight: '700',
  },
  textoResaltado: {
    fontWeight: '800',
    color: '#92400E',
  },
  contenedorBotones: {
    marginTop: 10,
  },
  botonVolver: {
    flexDirection: 'row',
    backgroundColor: COLORES.verdePino,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...SOMBRAS.boton,
  },
  textoBotonVolver: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  textoError: {
    fontSize: 14,
    color: COLORES.grisNeutro,
    marginBottom: 16,
  },
});

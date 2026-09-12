/**
 * @file DetalleScreen.js
 * @description Ficha técnica completa de una Cátedra o Actividad ACUDE (Bienestar Institucional TdeA).
 * Presenta información formativa, aforo, regla del 80% de asistencia mínima,
 * enlace al cronograma semanal y matrícula atómica con runTransaction de Firestore.
 * Diseñado con la paleta de identidad oficial TdeA (Verde Pino, Verde Lima, Gris Neutro y Negro Institucional)
 * e iconografía vectorial profesional de Ionicons.
 * @module screens/DetalleScreen
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../components/Badge';
import { useAuth } from '../contexts/AuthContexto';
import {
  inscribirEstudiante,
  verificarInscripcionPrevia,
} from '../services/inscripcionesService';
import { getAcudeById, normalizarHorariosConAforo } from '../services/acudesService';
import { COLORES, SOMBRAS } from '../constants/theme';

export default function DetalleScreen({ route, navigation }) {
  const { acude: acudeParam } = route.params || {};
  const { user, perfil } = useAuth();

  const [acude, setAcude] = useState(() => {
    if (!acudeParam) return null;
    if (Array.isArray(acudeParam.horarios) && acudeParam.horarios.length > 0) {
      const hNorm = normalizarHorariosConAforo(
        acudeParam.horarios,
        acudeParam.cupoTotal,
        acudeParam.cuposDisponibles,
        acudeParam.id
      );
      const totalDisp = hNorm.reduce((acc, h) => acc + (h.cuposDisponibles || 0), 0);
      return {
        ...acudeParam,
        horarios: hNorm,
        cuposDisponibles: totalDisp,
      };
    }
    return acudeParam;
  });
  const [errorImagen, setErrorImagen] = useState(false);
  const [estaInscrito, setEstaInscrito] = useState(false);
  const [verificandoInscripcion, setVerificandoInscripcion] = useState(true);
  const [inscribiendo, setInscribiendo] = useState(false);

  const horarios = Array.isArray(acude?.horarios) ? acude.horarios : [];
  const primerHorarioConCupo =
    horarios.find((h) => (typeof h.cuposDisponibles === 'number' ? h.cuposDisponibles > 0 : true)) ||
    (horarios.length > 0 ? horarios[0] : null);

  const [horarioSeleccionado, setHorarioSeleccionado] = useState(primerHorarioConCupo);

  useEffect(() => {
    if (acude?.horarios && acude.horarios.length > 0) {
      setHorarioSeleccionado((actual) => {
        if (actual) {
          const coincidencia = acude.horarios.find(
            (h) =>
              (actual.id && h.id === actual.id) ||
              (h.dia === actual.dia && h.horaInicio === actual.horaInicio)
          );
          if (coincidencia) return coincidencia;
        }
        return (
          acude.horarios.find(
            (h) => (typeof h.cuposDisponibles === 'number' ? h.cuposDisponibles > 0 : true)
          ) || acude.horarios[0]
        );
      });
    }
  }, [acude?.horarios]);

  const revisarInscripcion = useCallback(async () => {
    if (!acude?.id || !user?.uid) {
      setVerificandoInscripcion(false);
      return;
    }

    try {
      const inscripcion = await verificarInscripcionPrevia(acude.id, user.uid);
      setEstaInscrito(Boolean(inscripcion));

      const acudeActualizado = await getAcudeById(acude.id);
      if (acudeActualizado) {
        setAcude(acudeActualizado);
      }
    } catch (err) {
      console.warn('Error al verificar estado de inscripción:', err);
    } finally {
      setVerificandoInscripcion(false);
    }
  }, [acude?.id, user?.uid]);

  useEffect(() => {
    revisarInscripcion();
  }, [revisarInscripcion]);

  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      revisarInscripcion();
    });
    return unsubscribe;
  }, [navigation, revisarInscripcion]);

  if (!acude) {
    return (
      <SafeAreaView style={styles.contenedor}>
        <View style={styles.centroMensaje}>
          <Text style={styles.textoNoEncontrado}>
            No se recibió información de la cátedra ACUDE.
          </Text>
          <TouchableOpacity
            style={styles.botonRegresar}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.textoBotonRegresar}>Volver al Catálogo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const {
    id = '',
    nombre = 'Cátedra ACUDE',
    categoria = 'Deportiva',
    disciplina = 'General',
    ubicacion = 'Campus Robledo - Bloque 10',
    docente = 'Docente asignado',
    cupoTotal = 25,
    cuposDisponibles = 0,
    descripcion = 'Sin descripción formativa disponible.',
    requisitos = 'Carné institucional TdeA y vestimenta deportiva adecuada.',
    imagenUrl,
  } = acude;

  const tieneImagenValida = Boolean(imagenUrl) && !errorImagen;
  const hayCupos = cuposDisponibles > 0;

  const handleIrAHorarios = () => {
    navigation.navigate('Horarios', { acude });
  };

  const handleInscribirse = () => {
    if (!user) {
      Alert.alert(
        'Iniciar Sesión',
        'Debes iniciar sesión para inscribirte a una cátedra ACUDE.'
      );
      return;
    }

    if (!hayCupos) {
      Alert.alert(
        'Cupos Oficiales Agotados',
        'Los cupos en la app están agotados. Puedes consultar el cronograma y lugar para solicitar sobrecupo presencial en la primera sesión directamente con el docente.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ver Horarios', onPress: handleIrAHorarios },
        ]
      );
      return;
    }

    // Validar cupos del horario específico seleccionado
    const cuposHorarioSeleccionado =
      horarioSeleccionado && typeof horarioSeleccionado.cuposDisponibles === 'number'
        ? horarioSeleccionado.cuposDisponibles
        : cuposDisponibles;

    if (cuposHorarioSeleccionado <= 0) {
      Alert.alert(
        'Cupos Agotados en este Horario',
        `Los cupos oficiales en la app para el horario de los ${
          horarioSeleccionado?.dia || 'seleccionado'
        } (${horarioSeleccionado?.horaInicio || ''} - ${
          horarioSeleccionado?.horaFin || ''
        }) están agotados.\n\nPuedes seleccionar otra franja con cupo disponible o consultar con el docente en Bloque 10 para sobrecupo presencial en la primera sesión.`,
        [
          { text: 'Elegir otro horario', style: 'cancel' },
          { text: 'Ver Cronograma y Sobrecupo', onPress: handleIrAHorarios },
        ]
      );
      return;
    }

    const franjaTexto = horarioSeleccionado
      ? `${horarioSeleccionado.dia} (${horarioSeleccionado.horaInicio} - ${horarioSeleccionado.horaFin})`
      : 'Horario según programación institucional';
    const aulaTexto = horarioSeleccionado?.lugar || ubicacion;
    const sedeEstudiante = perfil?.sede || 'Campus Robledo';
    const esItagui = sedeEstudiante.toLowerCase().includes('itag');
    const notaCampus = esItagui
      ? '\n\n📍 Validación de Sede: Tu sede activa es Campus Itagüí. Esta cátedra se realiza de forma presencial en Campus Robledo (Bloque 10).'
      : '';

    Alert.alert(
      'Confirmar Inscripción',
      `¿Deseas inscribirte a "${nombre}"?\n\n📅 Franja: ${franjaTexto}\n👤 Docente: ${docente}\n📍 Lugar: ${aulaTexto}${notaCampus}\n\nNota: Se requiere el 80% de asistencia mínima para acreditar el taller. Inasistencias reiteradas liberan el cupo para otro estudiante.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, Inscribirme',
          onPress: async () => {
            try {
              setInscribiendo(true);
              const respuesta = await inscribirEstudiante(id, user.uid, {
                email: user.email,
                nombre: user.displayName,
                horarioSeleccionado,
                diaSeleccionado: horarioSeleccionado?.dia,
                franjaSeleccionada: horarioSeleccionado
                  ? `${horarioSeleccionado.horaInicio} - ${horarioSeleccionado.horaFin}`
                  : undefined,
              });

              setEstaInscrito(true);
              setAcude((prev) => {
                if (!prev) return prev;
                const horariosBase = normalizarHorariosConAforo(
                  prev.horarios,
                  prev.cupoTotal,
                  prev.cuposDisponibles,
                  prev.id
                );
                const nuevosHorarios = horariosBase.map((h) => {
                  const esElMismo =
                    (horarioSeleccionado?.id && h.id === horarioSeleccionado.id) ||
                    (h.dia === horarioSeleccionado?.dia &&
                      h.horaInicio === horarioSeleccionado?.horaInicio);
                  if (esElMismo) {
                    return { ...h, cuposDisponibles: Math.max(0, (h.cuposDisponibles || 0) - 1) };
                  }
                  return h;
                });
                const sumaCupos = nuevosHorarios.reduce(
                  (acc, h) =>
                    acc + (typeof h.cuposDisponibles === 'number' ? h.cuposDisponibles : 0),
                  0
                );
                return {
                  ...prev,
                  horarios: nuevosHorarios,
                  cuposDisponibles: sumaCupos,
                  estado: sumaCupos > 0 ? 'disponible' : 'agotado',
                };
              });

              // Sincronizar inmediatamente con los datos consolidados en Firestore
              try {
                const acudeActualizado = await getAcudeById(id);
                if (acudeActualizado) {
                  setAcude(acudeActualizado);
                }
              } catch (refreshErr) {
                console.warn('Error refrescando cátedra post-inscripción:', refreshErr);
              }

              Alert.alert(
                '¡Inscripción Exitosa!',
                respuesta.mensaje || 'Te has inscrito formalmente en esta cátedra ACUDE.',
                [
                  {
                    text: 'Ver Mis Inscripciones',
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
        {/* Fotografía cabecera */}
        <View style={styles.contenedorImagen}>
          {tieneImagenValida ? (
            <Image
              source={{ uri: imagenUrl }}
              style={styles.imagen}
              resizeMode="cover"
              onError={() => setErrorImagen(true)}
            />
          ) : (
            <View style={styles.placeholder}>
              <View style={styles.circuloIconoPlaceholder}>
                <Ionicons
                  name={categoria === 'Cultural' ? 'color-palette-outline' : 'trophy-outline'}
                  size={42}
                  color={COLORES.verdePino}
                />
              </View>
              <Text style={styles.placeholderTexto}>{disciplina}</Text>
            </View>
          )}

          {/* Badge de Categoría */}
          <View style={styles.badgeFlotanteIzquierda}>
            <Badge
              estado={categoria === 'Cultural' ? 'cultural' : 'deportiva'}
              texto={categoria}
              tamano="mediano"
            />
          </View>

          {/* Badge de Estado de Cupos */}
          <View style={styles.badgeFlotanteDerecha}>
            <Badge
              estado={hayCupos ? 'disponible' : 'agotado'}
              texto={
                hayCupos
                  ? `${cuposDisponibles} cupos libres`
                  : 'Agotado (Ver sobrecupo)'
              }
              tamano="mediano"
            />
          </View>
        </View>

        {/* Cuerpo de la ficha técnica */}
        <View style={styles.cuerpo}>
          <Text style={styles.subtituloCategoria}>
            BIENESTAR INSTITUCIONAL · CÁTEDRA {categoria.toUpperCase()}
          </Text>
          <Text style={styles.titulo}>{nombre}</Text>

          {/* Tarjeta de Especificaciones (Docente, Ubicación, Aforo) */}
          <View style={styles.tarjetaFicha}>
            <View style={styles.filaFicha}>
              <Ionicons name="person-outline" size={20} color={COLORES.verdePino} style={styles.iconoFicha} />
              <View style={styles.infoFicha}>
                <Text style={styles.labelFicha}>Docente / Instructor</Text>
                <Text style={styles.valorFicha}>{docente}</Text>
              </View>
            </View>

            <View style={styles.divisor} />

            <View style={styles.filaFicha}>
              <Ionicons name="location-outline" size={20} color={COLORES.grisNeutro} style={styles.iconoFicha} />
              <View style={styles.infoFicha}>
                <Text style={styles.labelFicha}>Lugar en Campus Robledo</Text>
                <Text style={styles.valorFicha}>{ubicacion}</Text>
              </View>
            </View>

            <View style={styles.divisor} />

            <View style={styles.filaFicha}>
              <Ionicons name="people-outline" size={20} color={COLORES.verdePino} style={styles.iconoFicha} />
              <View style={styles.infoFicha}>
                <Text style={styles.labelFicha}>Aforo Institucional</Text>
                <Text style={styles.valorFicha}>
                  {cuposDisponibles} disponibles de {cupoTotal} plazas totales
                </Text>
                {horarios.length > 1 && (
                  <Text style={styles.subtextoAforoFicha}>
                    Distribuidos en {horarios.length} horarios con cupos independientes
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Selector interactivo de Franja Horaria de Asistencia */}
          {horarios.length > 0 && (
            <View style={styles.seccionHorarios}>
              <View style={styles.filaTituloSeccion}>
                <Ionicons name="time-outline" size={18} color={COLORES.verdePino} style={{ marginRight: 6 }} />
                <Text style={styles.seccionTituloPequeno}>
                  {horarios.length > 1
                    ? 'Selecciona tu Franja de Asistencia (Bloque 10):'
                    : 'Franja Horaria Oficial:'}
                </Text>
              </View>
              <View style={styles.contenedorPillsHorarios}>
                {horarios.map((h, idx) => {
                  const estaSeleccionado =
                    horarioSeleccionado &&
                    ((horarioSeleccionado.id && h.id && horarioSeleccionado.id === h.id) ||
                      (horarioSeleccionado.dia === h.dia &&
                        horarioSeleccionado.horaInicio === h.horaInicio));
                  const cuposH = typeof h.cuposDisponibles === 'number' ? h.cuposDisponibles : 1;
                  const estaAgotado = typeof h.cuposDisponibles === 'number' && cuposH <= 0;

                  return (
                    <TouchableOpacity
                      key={h.id || `${h.dia}-${h.horaInicio}-${idx}`}
                      style={[
                        styles.tarjetaSlotDetalle,
                        estaSeleccionado && styles.tarjetaSlotDetalleActiva,
                        estaAgotado && !estaSeleccionado && styles.tarjetaSlotDetalleAgotada,
                      ]}
                      onPress={() => setHorarioSeleccionado(h)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.filaSlotCabecera}>
                        <Ionicons
                          name={
                            estaSeleccionado
                              ? 'checkmark-circle'
                              : estaAgotado
                              ? 'alert-circle-outline'
                              : 'ellipse-outline'
                          }
                          size={18}
                          color={
                            estaSeleccionado
                              ? COLORES.verdePino
                              : estaAgotado
                              ? '#B45309'
                              : COLORES.grisNeutro
                          }
                          style={{ marginRight: 8 }}
                        />
                        <Text
                          style={[
                            styles.textoSesionDia,
                            estaSeleccionado && styles.textoSesionDiaActivo,
                          ]}
                        >
                          {h.dia}
                        </Text>
                        <Text
                          style={[
                            styles.textoSesionHora,
                            estaSeleccionado && styles.textoSesionHoraActivo,
                          ]}
                        >
                          {h.horaInicio} - {h.horaFin}
                        </Text>

                        {/* Badge individual de cupos de este horario */}
                        <View
                          style={[
                            styles.badgeCuposPill,
                            estaAgotado && styles.badgeCuposPillAgotado,
                            estaSeleccionado && !estaAgotado && styles.badgeCuposPillActivo,
                          ]}
                        >
                          <Text
                            style={[
                              styles.textoBadgeCuposPill,
                              estaAgotado && styles.textoBadgeCuposPillAgotado,
                              estaSeleccionado && !estaAgotado && styles.textoBadgeCuposPillActivo,
                            ]}
                          >
                            {estaAgotado
                              ? 'Agotado'
                              : `${cuposH} ${cuposH === 1 ? 'cupo libre' : 'cupos libres'}`}
                          </Text>
                        </View>
                      </View>
                      {h.lugar ? (
                        <Text
                          style={[
                            styles.textoSesionLugar,
                            estaSeleccionado && styles.textoSesionLugarActivo,
                          ]}
                          numberOfLines={1}
                        >
                          {h.lugar}
                        </Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Botón de Enlace a Cronograma y Horarios Semanales */}
          <TouchableOpacity
            style={styles.botonHorarios}
            onPress={handleIrAHorarios}
            activeOpacity={0.85}
          >
            <View style={styles.filaBotonHorarios}>
              <Ionicons name="calendar-outline" size={24} color={COLORES.verdePino} style={styles.iconoBotonHorarios} />
              <View style={styles.infoBotonHorarios}>
                <Text style={styles.tituloBotonHorarios}>
                  Ver Cronograma Semanal y Sobrecupo
                </Text>
                <Text style={styles.subtituloBotonHorarios}>
                  Consulta franjas fijas para evitar cruces con Campus TdeA
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORES.verdePino} />
            </View>
          </TouchableOpacity>

          {/* Descripción pedagógica del taller */}
          <Text style={styles.seccionTitulo}>Descripción del Taller</Text>
          <Text style={styles.seccionContenido}>{descripcion}</Text>

          {/* Requisitos y Materiales */}
          <Text style={styles.seccionTitulo}>Requisitos para la Clase</Text>
          <Text style={styles.seccionContenido}>{requisitos}</Text>

          {/* Regla Reglamentaria de Asistencia */}
          <Text style={styles.seccionTitulo}>Reglamento de Asistencia (TdeA)</Text>
          <View style={styles.cajaAsistencia}>
            <Text style={styles.itemAsistencia}>
              • <Text style={styles.textoDestacado}>80% de asistencia mínima:</Text> Obligatoria para acreditar horas de Bienestar Universitario.
            </Text>
            <Text style={styles.itemAsistencia}>
              • <Text style={styles.textoDestacado}>Liberación de cupos:</Text> Si un estudiante matriculado incurre en inasistencias reiteradas, su curso se cancela y el cupo queda liberado para otro compañero.
            </Text>
            <Text style={styles.itemAsistencia}>
              • <Text style={styles.textoDestacado}>Sobrecupo presencial:</Text> Si no alcanzaste cupo oficial, asiste a la primera sesión directamente con el docente en el Bloque 10 para solicitar sobrecupo si hay cupos liberados.
            </Text>
          </View>

          {/* Botón CTA de Acción */}
          {verificandoInscripcion ? (
            <View style={styles.contenedorCargaBoton}>
              <ActivityIndicator size="small" color={COLORES.verdePino} />
              <Text style={styles.textoCargandoBoton}>
                Comprobando estado de matrícula...
              </Text>
            </View>
          ) : estaInscrito ? (
            <View style={styles.cajaYaInscrito}>
              <View style={styles.filaYaInscrito}>
                <Ionicons name="checkmark-circle" size={20} color={COLORES.verdePino} style={{ marginRight: 8 }} />
                <Text style={styles.textoYaInscrito}>
                  Ya te encuentras formalmente inscrito en esta cátedra
                </Text>
              </View>
              <TouchableOpacity
                style={styles.botonVerMisInscripciones}
                onPress={() => navigation.navigate('MisInscripcionesTab')}
              >
                <Text style={styles.textoBotonVerMisInscripciones}>
                  Ir a Mis Cátedras →
                </Text>
              </TouchableOpacity>
            </View>
          ) : hayCupos ? (
            (() => {
              const cuposH =
                horarioSeleccionado && typeof horarioSeleccionado.cuposDisponibles === 'number'
                  ? horarioSeleccionado.cuposDisponibles
                  : cuposDisponibles;
              const estaHorarioAgotado = cuposH <= 0;

              return (
                <TouchableOpacity
                  style={[
                    styles.botonInscribirme,
                    estaHorarioAgotado && styles.botonHorarioAgotado,
                    inscribiendo && styles.botonDeshabilitado,
                  ]}
                  onPress={handleInscribirse}
                  disabled={inscribiendo}
                  activeOpacity={0.85}
                >
                  {inscribiendo ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <View style={styles.filaBotonTexto}>
                      <Ionicons
                        name={estaHorarioAgotado ? 'alert-circle-outline' : 'create-outline'}
                        size={18}
                        color="#FFFFFF"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.textoBotonInscribirme}>
                        {estaHorarioAgotado
                          ? 'Horario Agotado (Ver opciones)'
                          : 'Inscribirme en esta Cátedra'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })()
          ) : (
            <TouchableOpacity
              style={styles.botonSobrecupo}
              onPress={handleIrAHorarios}
              activeOpacity={0.85}
            >
              <View style={styles.filaBotonTexto}>
                <Ionicons name="information-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.textoBotonSobrecupo}>
                  Cupo Oficial Lleno · Ver Sobrecupo Presencial
                </Text>
              </View>
            </TouchableOpacity>
          )}
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
    paddingBottom: 40,
  },
  contenedorImagen: {
    width: '100%',
    height: 240,
    backgroundColor: COLORES.superficieGris,
    position: 'relative',
  },
  imagen: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF5EF',
  },
  circuloIconoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBE58B',
  },
  placeholderTexto: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
    color: COLORES.verdePino,
  },
  badgeFlotanteIzquierda: {
    position: 'absolute',
    top: 14,
    left: 14,
  },
  badgeFlotanteDerecha: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  cuerpo: {
    padding: 20,
  },
  subtituloCategoria: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORES.verdePino,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORES.negroInstitucional,
    marginBottom: 16,
    lineHeight: 30,
  },
  tarjetaFicha: {
    backgroundColor: COLORES.superficie,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.borde,
    marginBottom: 16,
    ...SOMBRAS.suave,
  },
  filaFicha: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconoFicha: {
    marginRight: 12,
  },
  infoFicha: {
    flex: 1,
  },
  labelFicha: {
    fontSize: 11,
    color: COLORES.grisNeutro,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  valorFicha: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORES.negroInstitucional,
    marginTop: 1,
  },
  divisor: {
    height: 1,
    backgroundColor: COLORES.borde,
    marginVertical: 12,
  },
  seccionHorarios: {
    marginBottom: 18,
  },
  filaTituloSeccion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  seccionTituloPequeno: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.verdePino,
  },
  contenedorPillsHorarios: {
    gap: 8,
  },
  tarjetaSlotDetalle: {
    backgroundColor: COLORES.superficie,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: COLORES.borde,
  },
  tarjetaSlotDetalleActiva: {
    borderColor: COLORES.verdePino,
    backgroundColor: '#F0F7F2',
  },
  filaSlotCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoSesionDia: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORES.negroInstitucional,
    marginRight: 8,
  },
  textoSesionDiaActivo: {
    color: COLORES.verdePino,
  },
  textoSesionHora: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.grisNeutro,
  },
  textoSesionHoraActivo: {
    color: COLORES.verdePino,
  },
  textoSesionLugar: {
    fontSize: 11,
    color: COLORES.grisNeutro,
    marginTop: 4,
    marginLeft: 26,
  },
  textoSesionLugarActivo: {
    color: '#004D22',
  },
  botonHorarios: {
    backgroundColor: COLORES.acentoClaro,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBE58B',
    padding: 14,
    marginBottom: 20,
  },
  filaBotonHorarios: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconoBotonHorarios: {
    marginRight: 12,
  },
  infoBotonHorarios: {
    flex: 1,
  },
  tituloBotonHorarios: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORES.verdePino,
  },
  subtituloBotonHorarios: {
    fontSize: 12,
    color: '#4F6C0C',
    marginTop: 2,
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORES.negroInstitucional,
    marginTop: 8,
    marginBottom: 8,
  },
  seccionContenido: {
    fontSize: 14,
    color: COLORES.grisNeutro,
    lineHeight: 22,
    marginBottom: 16,
  },
  cajaAsistencia: {
    backgroundColor: COLORES.superficie,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORES.borde,
    marginBottom: 24,
    ...SOMBRAS.suave,
  },
  itemAsistencia: {
    fontSize: 13,
    color: COLORES.grisNeutro,
    lineHeight: 20,
    marginBottom: 8,
  },
  textoDestacado: {
    fontWeight: '700',
    color: COLORES.negroInstitucional,
  },
  contenedorCargaBoton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoCargandoBoton: {
    fontSize: 13,
    color: COLORES.grisNeutro,
    marginTop: 6,
  },
  cajaYaInscrito: {
    backgroundColor: COLORES.exitoFondo,
    borderWidth: 1,
    borderColor: '#B8DECA',
    borderRadius: 14,
    padding: 16,
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
  botonVerMisInscripciones: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  textoBotonVerMisInscripciones: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.verdePino,
  },
  botonInscribirme: {
    backgroundColor: COLORES.verdePino,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    ...SOMBRAS.boton,
  },
  botonSobrecupo: {
    backgroundColor: '#B45309',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  botonDeshabilitado: {
    backgroundColor: '#9E9E9E',
  },
  filaBotonTexto: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoBotonInscribirme: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  textoBotonSobrecupo: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  centroMensaje: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  textoNoEncontrado: {
    fontSize: 14,
    color: COLORES.grisNeutro,
    marginBottom: 16,
  },
  botonRegresar: {
    backgroundColor: COLORES.verdePino,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  textoBotonRegresar: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  subtextoAforoFicha: {
    fontSize: 11,
    color: COLORES.verdePino,
    fontWeight: '600',
    marginTop: 2,
  },
  tarjetaSlotDetalleAgotada: {
    backgroundColor: '#FAF5EF',
    borderColor: '#E2D9CF',
    opacity: 0.85,
  },
  badgeCuposPill: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  badgeCuposPillAgotado: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  badgeCuposPillActivo: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORES.verdePino,
  },
  textoBadgeCuposPill: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORES.verdePino,
  },
  textoBadgeCuposPillAgotado: {
    color: '#92400E',
  },
  textoBadgeCuposPillActivo: {
    color: COLORES.verdePino,
  },
  botonHorarioAgotado: {
    backgroundColor: '#D97706',
    shadowColor: '#D97706',
  },
});

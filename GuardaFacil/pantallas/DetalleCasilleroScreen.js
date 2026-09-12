import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContexto } from '../contextos/AuthContexto';
import {
  obtenerCasillero,
  reservarCasillero,
  verificarDisponibilidadCasillero,
} from '../services/zonasService';

const franjasDisponibles = ['Mañana', 'Tarde', 'Noche'];

const formatearFecha = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DetalleCasilleroScreen({ route, navigation }) {
  const { zonaId, casilleroId, zonaNombre } = route.params;
  const { usuario } = useAuthContexto();
  const [casillero, setCasillero] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [fecha, setFecha] = useState('');
  const [mostrarListaFechas, setMostrarListaFechas] = useState(false);
  const [franjaSeleccionada, setFranjaSeleccionada] = useState('Mañana');
  const [guardando, setGuardando] = useState(false);
  const [disponibilidad, setDisponibilidad] = useState({ disponible: true, cargando: false });

  const opcionesFechas = React.useMemo(() => {
    const fechaBase = new Date();
    const lista = [];

    for (let index = 0; index < 10; index += 1) {
      const fechaActual = new Date(fechaBase);
      fechaActual.setDate(fechaBase.getDate() + index);

      lista.push({
        valor: formatearFecha(fechaActual),
        etiqueta: new Intl.DateTimeFormat('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(fechaActual),
      });
    }

    return lista;
  }, []);

  async function consultarDisponibilidad(fechaSeleccionada, franjaSeleccionadaActual) {
    if (!fechaSeleccionada || !franjaSeleccionadaActual) {
      setDisponibilidad({ disponible: true, cargando: false });
      return;
    }

    try {
      setDisponibilidad({ disponible: true, cargando: true });
      const disponible = await verificarDisponibilidadCasillero({
        casilleroId,
        fecha: fechaSeleccionada,
        franja: franjaSeleccionadaActual,
      });

      setDisponibilidad({ disponible, cargando: false });
    } catch {
      setDisponibilidad({ disponible: false, cargando: false });
    }
  }

  useEffect(() => {
    const cargarCasillero = async () => {
      try {
        const datos = await obtenerCasillero(zonaId, casilleroId);
        setCasillero(datos);
      } catch {
        setError('No se pudo cargar el casillero.');
      } finally {
        setCargando(false);
      }
    };

    cargarCasillero();
  }, [zonaId, casilleroId]);

  const manejarReserva = async () => {
    if (!usuario) {
      Alert.alert('Debes iniciar sesión para reservar un casillero.');
      return;
    }

    if (!fecha.trim()) {
      Alert.alert('Selecciona una fecha para la reserva.');
      return;
    }

    if (!franjaSeleccionada) {
      Alert.alert('Selecciona una franja de tiempo.');
      return;
    }

    try {
      setGuardando(true);

      const disponible = await verificarDisponibilidadCasillero({
        casilleroId,
        fecha: fecha.trim(),
        franja: franjaSeleccionada,
      });

      if (!disponible) {
        Alert.alert('Casillero no disponible', 'Ya existe una reserva para esa fecha y franja.');
        setGuardando(false);
        return;
      }

      const respuesta = await reservarCasillero({
        zonaId,
        casilleroId,
        usuarioId: usuario.uid,
        usuarioEmail: usuario.email,
        fecha: fecha.trim(),
        franja: franjaSeleccionada,
        zonaNombre,
        casilleroNumero: casillero.numero,
      });

      setCasillero((casilleroActual) => ({
        ...casilleroActual,
        disponible: false,
        estado: 'reservado',
        reservaFecha: respuesta.fecha,
        reservaFranja: respuesta.franja,
      }));

      Alert.alert(
        'Reserva guardada',
        `El casillero ${casillero.numero} quedó reservado para ${respuesta.fecha} en la franja ${respuesta.franja}.`,
        [
          {
            text: 'Aceptar',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err) {
      Alert.alert('No se pudo guardar la reserva', err.message || 'Inténtalo nuevamente.');
    } finally {
      setGuardando(false);
    }
  };

  const onSeleccionarFecha = (valorFecha) => {
    setFecha(valorFecha);
    setMostrarListaFechas(false);
    consultarDisponibilidad(valorFecha, franjaSeleccionada);
  };

  const onSeleccionarFranja = async (nuevaFranja) => {
    setFranjaSeleccionada(nuevaFranja);

    if (fecha) {
      await consultarDisponibilidad(fecha, nuevaFranja);
    }
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#273c9c" />
      </View>
    );
  }

  if (error || !casillero) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.errorTexto}>{error || 'Casillero no encontrado.'}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.numero}>{casillero.numero}</Text>

        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                disponibilidad.cargando
                  ? '#f39c12'
                  : disponibilidad.disponible
                    ? '#2ecc71'
                    : '#e74c3c',
            },
          ]}
        >
          <Text style={styles.badgeTexto}>
            {disponibilidad.cargando
              ? 'Comprobando...'
              : disponibilidad.disponible
                ? 'Disponible'
                : 'Ocupado'}
          </Text>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.etiqueta}>Ubicación</Text>
          <Text style={styles.valor}>{zonaNombre}</Text>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.etiqueta}>Tamaño</Text>
          <Text style={styles.valor}>{casillero.tamano}</Text>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.etiqueta}>Estado</Text>
          <Text style={styles.valor}>{casillero.estado || 'Disponible'}</Text>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.etiqueta}>Reglas de uso</Text>
          {Array.isArray(casillero.reglas) ? (
            casillero.reglas.map((regla, index) => (
              <Text key={index} style={styles.valor}>• {regla}</Text>
            ))
          ) : (
            <Text style={styles.valor}>{casillero.reglas}</Text>
          )}
        </View>

        <View style={styles.seccion}>
          <Text style={styles.etiqueta}>Reservar casillero</Text>

          <Pressable
            style={styles.input}
            onPress={() => setMostrarListaFechas((valorActual) => !valorActual)}
          >
            <View style={styles.inputContent}>
              <Text style={[styles.inputTexto, !fecha && styles.inputTextoPlaceholder]}>
                {fecha || 'Selecciona una fecha'}
              </Text>
              <Text style={styles.inputArrow}>{mostrarListaFechas ? '▲' : '▼'}</Text>
            </View>
          </Pressable>

          {mostrarListaFechas && (
            <View style={styles.dropdown}>
              {opcionesFechas.map((opcion) => (
                <Pressable
                  key={opcion.valor}
                  style={[
                    styles.dropdownItem,
                    fecha === opcion.valor && styles.dropdownItemActivo,
                  ]}
                  onPress={() => onSeleccionarFecha(opcion.valor)}
                >
                  <Text
                    style={[
                      styles.dropdownItemTexto,
                      fecha === opcion.valor && styles.dropdownItemTextoActivo,
                    ]}
                  >
                    {opcion.etiqueta}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.franjasContainer}>
            {franjasDisponibles.map((franja) => (
              <Pressable
                key={franja}
                style={[
                  styles.franjaBoton,
                  franjaSeleccionada === franja && styles.franjaBotonActivo,
                ]}
                onPress={() => onSeleccionarFranja(franja)}
              >
                <Text
                  style={[
                    styles.franjaBotonTexto,
                    franjaSeleccionada === franja && styles.franjaBotonTextoActivo,
                  ]}
                >
                  {franja}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[
              styles.primaryButton,
              Boolean(guardando || (fecha && !disponibilidad.disponible)) && styles.primaryButtonDisabled,
            ]}
            onPress={manejarReserva}
            disabled={Boolean(guardando || (fecha && !disponibilidad.disponible))}
          >
            <Text style={styles.primaryButtonText}>
              {guardando ? 'Guardando reserva...' : 'Reservar casillero'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f7ff' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  numero: { fontSize: 28, fontWeight: '800', color: '#172044', marginBottom: 8 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 20,
  },
  badgeTexto: { color: '#fff', fontWeight: '700', fontSize: 14 },
  seccion: { marginBottom: 18 },
  etiqueta: { fontSize: 14, color: '#273c9c', fontWeight: '600', marginBottom: 6 },
  valor: { fontSize: 16, color: '#172044' },
  input: {
    backgroundColor: '#fff',
    borderColor: '#d2d8ed',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    justifyContent: 'center',
    minHeight: 48,
  },
  inputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputTexto: {
    fontSize: 16,
    color: '#172044',
  },
  inputTextoPlaceholder: {
    color: '#69728e',
  },
  inputArrow: {
    fontSize: 16,
    color: '#273c9c',
    fontWeight: '700',
    marginLeft: 12,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#d2d8ed',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#edf1fb',
  },
  dropdownItemActivo: {
    backgroundColor: '#eef4ff',
  },
  dropdownItemTexto: {
    fontSize: 15,
    color: '#172044',
  },
  dropdownItemTextoActivo: {
    color: '#273c9c',
    fontWeight: '700',
  },
  franjasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  franjaBoton: {
    borderWidth: 1,
    borderColor: '#d2d8ed',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  franjaBotonActivo: {
    backgroundColor: '#273c9c',
    borderColor: '#273c9c',
  },
  franjaBotonTexto: { color: '#172044', fontWeight: '700' },
  franjaBotonTextoActivo: { color: '#fff' },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#273c9c',
    borderRadius: 12,
    minHeight: 54,
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#a5afd4',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorTexto: { fontSize: 16, color: '#e74c3c', fontWeight: '600' },
});

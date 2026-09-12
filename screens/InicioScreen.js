/**
 * @file InicioScreen.js
 * @description Pantalla principal del Catálogo de Cátedras y Actividades ACUDE
 * (Bienestar Institucional - Tecnológico de Antioquia).
 * Diseñado con la paleta de identidad oficial TdeA (Verde Pino, Verde Lima, Gris Neutro, Negro Institucional),
 * iconografía vectorial profesional de Ionicons y encabezado dinámico colapsable al hacer scroll:
 * el saludo con el logo y el nombre del estudiante se contrae suavemente dejando fija la zona esencial
 * (Barra de búsqueda, filtros de categorías y contador).
 * @module screens/InicioScreen
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  Animated,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AcudeCard from '../components/AcudeCard';
import Badge from '../components/Badge';
import LogoInstitucional from '../components/LogoInstitucional';
import { getAcudes } from '../services/acudesService';
import { ejecutarSeedAcudes } from '../services/seedAcudes';
import { actualizarPerfilUsuario } from '../services/userService';
import { useAuth } from '../contexts/AuthContexto';
import { COLORES, SOMBRAS } from '../constants/theme';

/**
 * Normaliza cadenas removiendo tildes, diacríticos y espacios para búsquedas robustas.
 */
function normalizarTexto(txt = '') {
  return String(txt || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

const CATEGORIAS_FILTRO = [
  { clave: 'Todos', label: 'Todas las Cátedras', icono: 'layers-outline' },
  { clave: 'Deportivas', label: 'Deportivas', icono: 'trophy-outline' },
  { clave: 'Culturales', label: 'Culturales', icono: 'color-palette-outline' },
];

export default function InicioScreen({ navigation }) {
  const { user, perfil, recargarPerfil } = useAuth();

  const [acudes, setAcudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [sembrando, setSembrando] = useState(false);
  const [error, setError] = useState(null);

  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');

  // Control de colapso con umbral e histéresis:
  // 1 = expandido (muestra saludo, nombre y logo)
  // 0 = colapsado (altura 0, sólo muestra barra de búsqueda y filtros esenciales)
  const animSaludo = useRef(new Animated.Value(1)).current;
  const colapsadoRef = useRef(false);

  const alturaSaludo = animSaludo.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 48],
  });

  const opacidadSaludo = animSaludo.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const margenSaludo = animSaludo.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  const handleScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    // Si baja más de 40px y está expandido, se encoge suavemente
    if (y > 40 && !colapsadoRef.current) {
      colapsadoRef.current = true;
      Animated.timing(animSaludo, {
        toValue: 0,
        duration: 220,
        useNativeDriver: false,
      }).start();
    } else if (y < 12 && colapsadoRef.current) {
      // Si regresa a la parte superior, se vuelve a desplegar suavemente
      colapsadoRef.current = false;
      Animated.timing(animSaludo, {
        toValue: 1,
        duration: 220,
        useNativeDriver: false,
      }).start();
    }
  };

  const cargarDatos = useCallback(async () => {
    try {
      setError(null);
      const datos = await getAcudes();
      setAcudes(datos);
    } catch (err) {
      console.error('Error al cargar actividades ACUDE en InicioScreen:', err);
      setError(err.message);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      cargarDatos();
    });
    return unsubscribe;
  }, [navigation, cargarDatos]);

  const handleRefrescar = () => {
    setRefrescando(true);
    cargarDatos();
  };

  const handleSembrarDatos = async () => {
    try {
      setSembrando(true);
      const res = await ejecutarSeedAcudes();
      Alert.alert('Datos Sincronizados', res.mensaje);
      await cargarDatos();
    } catch (err) {
      Alert.alert('Error al sincronizar', err.message);
    } finally {
      setSembrando(false);
    }
  };

  const acudesFiltrados = useMemo(() => {
    return acudes.filter((acude) => {
      // 1. Normalización diacrítica (ignora tildes como 'futbol' -> 'fútbol')
      const termino = normalizarTexto(busqueda);
      const coincideBusqueda =
        !termino ||
        normalizarTexto(acude.nombre).includes(termino) ||
        normalizarTexto(acude.docente).includes(termino) ||
        normalizarTexto(acude.disciplina).includes(termino) ||
        normalizarTexto(acude.ubicacion).includes(termino);

      // 2. Filtro de Categoría tolerante a variantes
      let coincideCategoria = true;
      const catNormalizada = normalizarTexto(acude.categoria || '');

      if (categoriaSeleccionada === 'Deportivas') {
        coincideCategoria = catNormalizada.includes('deport');
      } else if (categoriaSeleccionada === 'Culturales') {
        coincideCategoria = catNormalizada.includes('cultur');
      }

      return coincideBusqueda && coincideCategoria;
    });
  }, [acudes, busqueda, categoriaSeleccionada]);

  const handleSeleccionarAcude = (acude) => {
    navigation.navigate('Detalle', { acude });
  };

  const renderVacio = () => {
    if (acudes.length === 0) {
      return (
        <View style={styles.contenedorVacio}>
          <View style={styles.circuloIconoVacio}>
            <Ionicons name="server-outline" size={36} color={COLORES.verdePino} />
          </View>
          <Text style={styles.tituloVacio}>Base de datos lista para sincronizar</Text>
          <Text style={styles.textoVacio}>
            Aún no se encuentran registradas las cátedras ACUDE del TdeA en Firestore.
            Puedes cargar el catálogo oficial de Bienestar Institucional con un toque:
          </Text>
          <TouchableOpacity
            style={styles.botonSembrar}
            onPress={handleSembrarDatos}
            disabled={sembrando}
          >
            {sembrando ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.filaBotonSembrar}>
                <Ionicons name="cloud-download-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.textoBotonSembrar}>
                  Cargar Catálogo ACUDE TdeA
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.contenedorVacio}>
        <View style={styles.circuloIconoVacio}>
          <Ionicons name="search-outline" size={36} color={COLORES.grisNeutro} />
        </View>
        <Text style={styles.tituloVacio}>No encontramos cátedras coincidentes</Text>
        <Text style={styles.textoVacio}>
          No hay actividades para "{busqueda || categoriaSeleccionada}". Prueba con otros términos o restablece los filtros.
        </Text>
        <TouchableOpacity
          style={styles.botonLimpiarTodo}
          onPress={() => {
            setBusqueda('');
            setCategoriaSeleccionada('Todos');
          }}
        >
          <Text style={styles.textoBotonLimpiarTodo}>Mostrar todas las cátedras</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const nombreUsuario = perfil?.nombre || user?.displayName || 'Estudiante TdeA';
  const sedeUsuario = perfil?.sede?.toLowerCase().includes('itag')
    ? 'Campus Itagüí'
    : 'Campus Robledo';
  const esItagui = sedeUsuario === 'Campus Itagüí';

  const handleCambiarCampus = () => {
    Alert.alert(
      'Sedes Institucionales TdeA',
      `Sede actual seleccionada: ${sedeUsuario}\n\n• Campus Robledo: Sede principal donde se ubica el Bloque 10 con la totalidad de los escenarios deportivos y culturales ACUDE.\n• Campus Itagüí: Sede Aburrá Sur para formación académica descentralizada.\n\n¿Deseas alternar tu campus activo en tu perfil?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: esItagui ? 'Cambiar a Campus Robledo' : 'Cambiar a Campus Itagüí',
          onPress: async () => {
            if (!user?.uid) return;
            try {
              const nuevaSede = esItagui ? 'Campus Robledo' : 'Campus Itagüí';
              await actualizarPerfilUsuario(user.uid, { sede: nuevaSede });
              if (recargarPerfil) {
                await recargarPerfil();
              }
              Alert.alert('Sede Actualizada', `Tu campus activo ahora es ${nuevaSede}.`);
            } catch (err) {
              Alert.alert('Error', 'No se pudo cambiar el campus: ' + err.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.contenedor}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORES.fondo} />

      {/* Cabecera: Sección dinámica con saludo colapsable + filtros esenciales fijados */}
      <View style={styles.cabeceraContenedor}>
        {/* Fila superior que se contrae suavemente: Logo + Nombre + Badge de Campus */}
        <Animated.View
          style={[
            styles.filaSaludoAnimada,
            {
              height: alturaSaludo,
              opacity: opacidadSaludo,
              marginBottom: margenSaludo,
            },
          ]}
        >
          <View style={styles.columnaLogoYUsuario}>
            <LogoInstitucional size={42} redondeado conSombra style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.subtituloSaludo}>Campus TdeA · ACUDE</Text>
              <Text style={styles.tituloUsuario} numberOfLines={1}>
                {nombreUsuario}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleCambiarCampus}
            activeOpacity={0.7}
            accessibilityLabel="Cambiar sede institucional"
          >
            <Badge
              estado={esItagui ? 'inscrito' : 'info'}
              texto={sedeUsuario}
              tamano="pequeno"
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Validación de Campus para estudiantes de Itagüí */}
        {esItagui && (
          <TouchableOpacity
            style={styles.bannerValidacionCampus}
            onPress={handleCambiarCampus}
            activeOpacity={0.8}
          >
            <Ionicons name="information-circle-outline" size={15} color="#92400E" style={{ marginRight: 6 }} />
            <Text style={styles.textoBannerCampus}>
              <Text style={{ fontWeight: '700' }}>Campus Itagüí:</Text> Las cátedras presenciales ACUDE se desarrollan en Campus Robledo (Bloque 10).
            </Text>
          </TouchableOpacity>
        )}

        {/* Zona Esencial: Barra de búsqueda */}
        <View style={styles.contenedorBuscador}>
          <Ionicons name="search-outline" size={18} color={COLORES.grisNeutro} style={styles.iconoBuscador} />
          <TextInput
            style={styles.inputBuscador}
            placeholder="Buscar por taller, docente o espacio..."
            placeholderTextColor="#9E9E9E"
            value={busqueda}
            onChangeText={setBusqueda}
            autoCorrect={false}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity
              onPress={() => setBusqueda('')}
              style={styles.botonLimpiar}
            >
              <Ionicons name="close-circle" size={18} color={COLORES.grisNeutro} />
            </TouchableOpacity>
          )}
        </View>

        {/* Selector horizontal de clases y categorías (Chips) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollCategorias}
        >
          {CATEGORIAS_FILTRO.map((cat) => {
            const estaActiva = categoriaSeleccionada === cat.clave;
            return (
              <TouchableOpacity
                key={cat.clave}
                style={[
                  styles.chipCategoria,
                  estaActiva && styles.chipCategoriaActiva,
                ]}
                onPress={() => setCategoriaSeleccionada(cat.clave)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={cat.icono}
                  size={14}
                  color={estaActiva ? '#FFFFFF' : COLORES.grisNeutro}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.textoChip,
                    estaActiva && styles.textoChipActivo,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Contador de resultados */}
        <View style={styles.filaContador}>
          <Text style={styles.textoContador}>
            {acudesFiltrados.length === 1
              ? '1 cátedra disponible'
              : `${acudesFiltrados.length} cátedras disponibles`}
          </Text>
          {(categoriaSeleccionada !== 'Todos' || busqueda.length > 0) && (
            <TouchableOpacity
              onPress={() => {
                setCategoriaSeleccionada('Todos');
                setBusqueda('');
              }}
            >
              <Text style={styles.textoRestablecer}>Limpiar filtros</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Listado reactivo de Cátedras ACUDE con FlatList */}
      {cargando && !refrescando ? (
        <View style={styles.centroCarga}>
          <ActivityIndicator size="large" color={COLORES.verdePino} />
          <Text style={styles.textoCargando}>
            Consultando Cátedras ACUDE en Firestore...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.cajaError}>
          <Ionicons name="alert-circle-outline" size={36} color={COLORES.error} style={{ marginBottom: 8 }} />
          <Text style={styles.tituloError}>Error de conexión</Text>
          <Text style={styles.detalleError}>{error}</Text>
          <TouchableOpacity style={styles.botonReintentar} onPress={cargarDatos}>
            <Text style={styles.textoBotonReintentar}>Reintentar consulta</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={acudesFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AcudeCard acude={item} onPress={handleSeleccionarAcude} />
          )}
          ListEmptyComponent={renderVacio}
          contentContainerStyle={styles.listaContenedor}
          keyboardShouldPersistTaps="handled"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={handleRefrescar}
              colors={[COLORES.verdePino]}
              tintColor={COLORES.verdePino}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  listaContenedor: {
    paddingTop: 4,
    paddingBottom: 24,
  },
  cabeceraContenedor: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: COLORES.fondo,
  },
  bannerValidacionCampus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  textoBannerCampus: {
    fontSize: 11,
    color: '#92400E',
    flex: 1,
    lineHeight: 15,
  },
  filaSaludoAnimada: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  columnaLogoYUsuario: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  subtituloSaludo: {
    fontSize: 11,
    color: COLORES.grisNeutro,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tituloUsuario: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORES.negroInstitucional,
    letterSpacing: -0.5,
    marginTop: 1,
  },
  contenedorBuscador: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.superficie,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 4,
    borderWidth: 1,
    borderColor: COLORES.borde,
    marginBottom: 10,
    ...SOMBRAS.suave,
  },
  iconoBuscador: {
    marginRight: 8,
  },
  inputBuscador: {
    flex: 1,
    fontSize: 14,
    color: COLORES.negroInstitucional,
  },
  botonLimpiar: {
    padding: 4,
  },
  scrollCategorias: {
    paddingBottom: 6,
    gap: 8,
  },
  chipCategoria: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.superficie,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORES.borde,
    marginRight: 6,
  },
  chipCategoriaActiva: {
    backgroundColor: COLORES.verdePino,
    borderColor: COLORES.verdePino,
  },
  textoChip: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.grisNeutro,
  },
  textoChipActivo: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filaContador: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  textoContador: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORES.grisNeutro,
  },
  textoRestablecer: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORES.verdePino,
  },
  centroCarga: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoCargando: {
    marginTop: 12,
    fontSize: 14,
    color: COLORES.grisNeutro,
  },
  cajaError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  tituloError: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORES.error,
    marginBottom: 6,
  },
  detalleError: {
    fontSize: 13,
    color: COLORES.grisNeutro,
    textAlign: 'center',
    marginBottom: 16,
  },
  botonReintentar: {
    backgroundColor: COLORES.verdePino,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    ...SOMBRAS.boton,
  },
  textoBotonReintentar: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  contenedorVacio: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloIconoVacio: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORES.acentoClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#CBE58B',
  },
  tituloVacio: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORES.negroInstitucional,
    marginBottom: 6,
    textAlign: 'center',
  },
  textoVacio: {
    fontSize: 13,
    color: COLORES.grisNeutro,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  botonLimpiarTodo: {
    backgroundColor: COLORES.superficie,
    borderWidth: 1,
    borderColor: COLORES.borde,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  textoBotonLimpiarTodo: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.verdePino,
  },
  botonSembrar: {
    backgroundColor: COLORES.verdePino,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    ...SOMBRAS.boton,
  },
  filaBotonSembrar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoBotonSembrar: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

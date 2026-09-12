/**
 * @file PerfilScreen.js
 * @description Pantalla de perfil de usuario en CanchaYa.
 * Muestra información del estudiante autenticado, datos institucionales de Bienestar Institucional (TdeA)
 * y permite cerrar sesión en Firebase Auth con persistencia nativa en AsyncStorage.
 * Diseñado bajo la identidad oficial TdeA (Verde Pino, Verde Lima, Gris Neutro y Negro Institucional)
 * e iconografía vectorial profesional de Ionicons.
 * @module screens/PerfilScreen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContexto';
import Badge from '../components/Badge';
import { ejecutarSeedAcudes } from '../services/seedAcudes';
import { actualizarPerfilUsuario } from '../services/userService';
import { COLORES, SOMBRAS } from '../constants/theme';

export default function PerfilScreen() {
  const { user, perfil, logout, recargarPerfil } = useAuth();
  const [saliendo, setSaliendo] = useState(false);
  const [sembrando, setSembrando] = useState(false);

  const nombreMostrado = perfil?.nombre || user?.displayName || 'Estudiante TdeA';
  const rolMostrado = perfil?.rol ? perfil.rol.toUpperCase() : 'ESTUDIANTE';
  const sedeActual = perfil?.sede?.toLowerCase().includes('itag')
    ? 'Campus Itagüí'
    : 'Campus Robledo';
  const esItagui = sedeActual === 'Campus Itagüí';

  const handleCambiarCampus = () => {
    Alert.alert(
      'Cambiar Sede Institucional',
      `Sede actual: ${sedeActual}\n\nSelecciona el campus donde estudias habitualmente:`,
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
              Alert.alert('Sede Actualizada', `Tu campus ahora es ${nuevaSede}.`);
            } catch (err) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  const handleCerrarSesion = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir de tu cuenta en CanchaYa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, Salir',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaliendo(true);
              await logout();
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setSaliendo(false);
            }
          },
        },
      ]
    );
  };

  const handleSincronizarCatalogo = async () => {
    try {
      setSembrando(true);
      const res = await ejecutarSeedAcudes();
      Alert.alert('Sincronización Exitosa', res.mensaje);
    } catch (err) {
      Alert.alert('Error al sincronizar', err.message);
    } finally {
      setSembrando(false);
    }
  };

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.contenido}>
          {/* Avatar representativo */}
          <View style={styles.avatar}>
            <Text style={styles.textoAvatar}>
              {(nombreMostrado?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </Text>
          </View>

          <Text style={styles.nombre}>{nombreMostrado}</Text>
          <Text style={styles.correo}>{user?.email}</Text>

          <View style={styles.badgeRol}>
            <Badge estado="inscrito" texto={`Comunidad TdeA · ${rolMostrado}`} />
          </View>

          {/* Tarjeta de detalles de cuenta */}
          <View style={styles.tarjetaDetalles}>
            <View style={styles.filaDetalle}>
              <View style={styles.filaLabel}>
                <Ionicons name="school-outline" size={16} color={COLORES.verdePino} style={{ marginRight: 8 }} />
                <Text style={styles.labelDetalle}>Institución:</Text>
              </View>
              <Text style={styles.valorDetalle}>{perfil?.institucion || 'Tecnológico de Antioquia'}</Text>
            </View>

            <View style={styles.separador} />

            <TouchableOpacity
              style={styles.filaDetalle}
              onPress={handleCambiarCampus}
              activeOpacity={0.7}
            >
              <View style={styles.filaLabel}>
                <Ionicons name="location-outline" size={16} color={COLORES.verdePino} style={{ marginRight: 8 }} />
                <Text style={styles.labelDetalle}>Sede Asignada:</Text>
              </View>
              <View style={styles.filaValorConBoton}>
                <Text style={styles.valorDetalle}>{sedeActual}</Text>
                <Ionicons name="swap-horizontal" size={16} color={COLORES.verdePino} style={{ marginLeft: 6 }} />
              </View>
            </TouchableOpacity>

            <View style={styles.separador} />

            <View style={styles.filaDetalle}>
              <View style={styles.filaLabel}>
                <Ionicons name="shield-checkmark-outline" size={16} color={COLORES.verdePino} style={{ marginRight: 8 }} />
                <Text style={styles.labelDetalle}>Rol en Plataforma:</Text>
              </View>
              <Text style={styles.valorDetalle}>{rolMostrado}</Text>
            </View>

            <View style={styles.separador} />

            <View style={styles.filaDetalle}>
              <View style={styles.filaLabel}>
                <Ionicons name="fitness-outline" size={16} color={COLORES.verdePino} style={{ marginRight: 8 }} />
                <Text style={styles.labelDetalle}>Espacio ACUDE:</Text>
              </View>
              <Text style={styles.valorDetalle}>Bloque 10 (Bienestar)</Text>
            </View>

            <View style={styles.separador} />

            <View style={styles.filaDetalle}>
              <View style={styles.filaLabel}>
                <Ionicons name="globe-outline" size={16} color={COLORES.verdePino} style={{ marginRight: 8 }} />
                <Text style={styles.labelDetalle}>Plataforma Base:</Text>
              </View>
              <Text style={styles.valorDetalle}>Campus TdeA (Web)</Text>
            </View>

            <View style={styles.separador} />

            <View style={styles.filaDetalle}>
              <View style={styles.filaLabel}>
                <Ionicons name="key-outline" size={16} color={COLORES.verdePino} style={{ marginRight: 8 }} />
                <Text style={styles.labelDetalle}>Identificador (UID):</Text>
              </View>
              <Text style={styles.valorUid} numberOfLines={1} ellipsizeMode="middle">
                {user?.uid}
              </Text>
            </View>
          </View>

          {/* Botón de Cerrar Sesión */}
          <TouchableOpacity
            style={styles.botonSalir}
            onPress={handleCerrarSesion}
            disabled={saliendo}
            activeOpacity={0.8}
          >
            {saliendo ? (
              <ActivityIndicator color={COLORES.error} size="small" />
            ) : (
              <View style={styles.filaBotonSalir}>
                <Ionicons name="log-out-outline" size={18} color={COLORES.error} style={{ marginRight: 8 }} />
                <Text style={styles.textoBotonSalir}>Cerrar Sesión</Text>
              </View>
            )}
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
    paddingBottom: 32,
  },
  contenido: {
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORES.verdePino,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORES.verdeLima,
    ...SOMBRAS.boton,
  },
  textoAvatar: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  nombre: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORES.negroInstitucional,
  },
  correo: {
    fontSize: 14,
    color: COLORES.grisNeutro,
    marginTop: 4,
  },
  badgeRol: {
    marginTop: 10,
    marginBottom: 20,
  },
  tarjetaDetalles: {
    width: '100%',
    backgroundColor: COLORES.superficie,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.borde,
    marginBottom: 20,
    ...SOMBRAS.suave,
  },
  filaDetalle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  filaLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filaValorConBoton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelDetalle: {
    fontSize: 13,
    color: COLORES.grisNeutro,
    fontWeight: '500',
  },
  valorDetalle: {
    fontSize: 13,
    color: COLORES.negroInstitucional,
    fontWeight: '700',
  },
  valorUid: {
    fontSize: 12,
    color: COLORES.grisNeutro,
    fontFamily: 'monospace',
    maxWidth: 150,
  },
  separador: {
    height: 1,
    backgroundColor: COLORES.borde,
  },
  botonSincronizar: {
    width: '100%',
    backgroundColor: COLORES.acentoClaro,
    borderWidth: 1,
    borderColor: '#CBE58B',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  columnaBotonSincronizar: {
    alignItems: 'center',
  },
  filaBotonSincronizar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoBotonSincronizar: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.verdePino,
  },
  subtextoBotonSincronizar: {
    fontSize: 11,
    color: '#4F6C0C',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 15,
  },
  botonSalir: {
    width: '100%',
    backgroundColor: COLORES.errorFondo,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filaBotonSalir: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoBotonSalir: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORES.error,
  },
});

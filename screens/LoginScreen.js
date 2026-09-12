/**
 * @file LoginScreen.js
 * @description Pantalla de inicio de sesión de CanchaYa (TdeA).
 * Gestiona el acceso de estudiantes con la identidad visual institucional oficial
 * (Verde Pino, Verde Lima, Gris Neutro y Negro Institucional) e iconografía profesional de Ionicons.
 * @module screens/LoginScreen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContexto';
import LogoInstitucional from '../components/LogoInstitucional';
import { COLORES, SOMBRAS } from '../constants/theme';

export default function LoginScreen({ navigation, onIrARegistro }) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorLocal, setErrorLocal] = useState('');

  const mostrarAlertaError = (titulo, mensaje) => {
    setErrorLocal(mensaje);
    Alert.alert(titulo, mensaje, [{ text: 'Entendido', style: 'default' }]);
  };

  const validarFormulario = () => {
    setErrorLocal('');

    if (!email.trim()) {
      mostrarAlertaError(
        'Correo Requerido',
        'Por favor ingresa tu correo institucional o personal para iniciar sesión.'
      );
      return false;
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email.trim())) {
      mostrarAlertaError(
        'Correo Inválido',
        'El formato del correo electrónico no es válido. Ejemplo: usuario@tdea.edu.co'
      );
      return false;
    }

    if (!password) {
      mostrarAlertaError(
        'Contraseña Requerida',
        'Por favor ingresa tu contraseña para acceder a tu cuenta.'
      );
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validarFormulario()) return;

    try {
      setCargando(true);
      setErrorLocal('');
      await login(email, password);
    } catch (error) {
      const mensaje = error.message || 'Credenciales inválidas. Verifica tu correo y contraseña.';
      setErrorLocal(mensaje);
      Alert.alert(
        'Error de Inicio de Sesión',
        mensaje,
        [{ text: 'Reintentar', style: 'default' }]
      );
    } finally {
      setCargando(false);
    }
  };

  const handleNavegarARegistro = () => {
    if (navigation?.navigate) {
      navigation.navigate('Registro');
    } else if (onIrARegistro) {
      onIrARegistro();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.contenedorPrincipal}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollInterno}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cabecera / Branding con Logo Oficial */}
        <View style={styles.cabecera}>
          <LogoInstitucional size={84} redondeado conSombra style={{ marginBottom: 14 }} />
          <Text style={styles.titulo}>CanchaYa</Text>
          <Text style={styles.subtitulo}>
            Extensión Móvil de Campus TdeA · Cátedras ACUDE
          </Text>
          <View style={styles.badgeInstitucional}>
            <Text style={styles.insigniaTdeA}>Tecnológico de Antioquia</Text>
          </View>
        </View>

        {/* Tarjeta del Formulario */}
        <View style={styles.tarjetaFormulario}>
          <Text style={styles.tituloFormulario}>Iniciar Sesión</Text>

          {/* Mensaje de Error en pantalla */}
          {errorLocal ? (
            <View style={styles.cajaError}>
              <Ionicons name="alert-circle-outline" size={18} color={COLORES.error} style={{ marginRight: 6 }} />
              <Text style={styles.textoError}>{errorLocal}</Text>
            </View>
          ) : null}

          {/* Campo Correo */}
          <Text style={styles.label}>Correo Electrónico</Text>
          <View style={styles.contenedorInput}>
            <Ionicons name="mail-outline" size={18} color={COLORES.grisNeutro} style={styles.iconoInput} />
            <TextInput
              style={styles.input}
              placeholder="usuario@tdea.edu.co"
              placeholderTextColor="#9E9E9E"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={(texto) => {
                setEmail(texto);
                if (errorLocal) setErrorLocal('');
              }}
            />
          </View>

          {/* Campo Contraseña */}
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.contenedorPassword}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORES.grisNeutro} style={styles.iconoInput} />
            <TextInput
              style={styles.inputPassword}
              placeholder="••••••••"
              placeholderTextColor="#9E9E9E"
              secureTextEntry={!mostrarPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={(texto) => {
                setPassword(texto);
                if (errorLocal) setErrorLocal('');
              }}
            />
            <TouchableOpacity
              style={styles.botonOjo}
              onPress={() => setMostrarPassword(!mostrarPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={mostrarPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={COLORES.grisNeutro}
              />
            </TouchableOpacity>
          </View>

          {/* Botón de Ingreso */}
          <TouchableOpacity
            style={[styles.botonIngreso, cargando && styles.botonDeshabilitado]}
            onPress={handleLogin}
            disabled={cargando}
            activeOpacity={0.85}
          >
            {cargando ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.textoBotonIngreso}>Ingresar a CanchaYa</Text>
            )}
          </TouchableOpacity>

          {/* Enlace hacia Registro */}
          <View style={styles.filaRegistro}>
            <Text style={styles.textoPregunta}>¿No tienes una cuenta? </Text>
            <TouchableOpacity onPress={handleNavegarARegistro}>
              <Text style={styles.textoEnlaceRegistro}>Regístrate aquí</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedorPrincipal: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  scrollInterno: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  cabecera: {
    alignItems: 'center',
    marginBottom: 28,
  },
  circuloLogo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORES.verdePino,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: COLORES.verdeLima,
    ...SOMBRAS.boton,
  },
  titulo: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORES.negroInstitucional,
    letterSpacing: -0.5,
  },
  subtitulo: {
    fontSize: 14,
    color: COLORES.grisNeutro,
    textAlign: 'center',
    marginTop: 4,
  },
  badgeInstitucional: {
    backgroundColor: COLORES.acentoClaro,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#CBE58B',
  },
  insigniaTdeA: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORES.verdePino,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tarjetaFormulario: {
    backgroundColor: COLORES.superficie,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORES.borde,
    ...SOMBRAS.media,
  },
  tituloFormulario: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORES.negroInstitucional,
    marginBottom: 16,
  },
  cajaError: {
    backgroundColor: COLORES.errorFondo,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoError: {
    color: COLORES.error,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.negroInstitucional,
    marginBottom: 6,
  },
  contenedorInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.superficieGris,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  iconoInput: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORES.negroInstitucional,
  },
  contenedorPassword: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.superficieGris,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  inputPassword: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORES.negroInstitucional,
  },
  botonOjo: {
    paddingHorizontal: 8,
  },
  botonIngreso: {
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
  textoBotonIngreso: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  filaRegistro: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  textoPregunta: {
    fontSize: 13,
    color: COLORES.grisNeutro,
  },
  textoEnlaceRegistro: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.verdePino,
  },
});

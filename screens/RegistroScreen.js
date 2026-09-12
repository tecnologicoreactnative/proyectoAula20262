/**
 * @file RegistroScreen.js
 * @description Pantalla de registro de nuevos usuarios en CanchaYa.
 * Diseñada bajo la línea gráfica oficial TdeA (Verde Pino, Verde Lima, Gris Neutro y Negro Institucional)
 * e iconografía vectorial profesional de Ionicons.
 * @module screens/RegistroScreen
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContexto';
import { COLORES, SOMBRAS } from '../constants/theme';

export default function RegistroScreen({ navigation, onIrALogin }) {
  const { register } = useAuth();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorLocal, setErrorLocal] = useState('');

  const validarFormulario = () => {
    setErrorLocal('');

    if (!nombre.trim()) {
      setErrorLocal('Ingresa tu nombre completo.');
      return false;
    }

    if (!email.trim()) {
      setErrorLocal('Ingresa tu correo institucional o personal.');
      return false;
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email.trim())) {
      setErrorLocal('El formato del correo electrónico no es válido.');
      return false;
    }

    if (password.length < 6) {
      setErrorLocal('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }

    if (password !== confirmarPassword) {
      setErrorLocal('Las contraseñas no coinciden. Verifícalas.');
      return false;
    }

    return true;
  };

  const handleRegistro = async () => {
    if (!validarFormulario()) return;

    try {
      setCargando(true);
      setErrorLocal('');
      await register(email, password, nombre);
    } catch (error) {
      setErrorLocal(error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleRegresarALogin = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    } else if (navigation?.navigate) {
      navigation.navigate('Login');
    } else if (onIrALogin) {
      onIrALogin();
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
        {/* Cabecera */}
        <View style={styles.cabecera}>
          <Text style={styles.titulo}>Crear Cuenta</Text>
          <Text style={styles.subtitulo}>
            Únete a CanchaYa para consultar e inscribirte a Cátedras ACUDE de Bienestar TdeA
          </Text>
        </View>

        {/* Tarjeta del Formulario */}
        <View style={styles.tarjetaFormulario}>
          {/* Alerta de Error */}
          {errorLocal ? (
            <View style={styles.cajaError}>
              <Ionicons name="alert-circle-outline" size={18} color={COLORES.error} style={{ marginRight: 6 }} />
              <Text style={styles.textoError}>{errorLocal}</Text>
            </View>
          ) : null}

          {/* Nombre Completo */}
          <Text style={styles.label}>Nombre Completo</Text>
          <View style={styles.contenedorInput}>
            <Ionicons name="person-outline" size={18} color={COLORES.grisNeutro} style={styles.iconoInput} />
            <TextInput
              style={styles.input}
              placeholder="Ej. Juan Pérez"
              placeholderTextColor="#9E9E9E"
              autoCapitalize="words"
              value={nombre}
              onChangeText={(texto) => {
                setNombre(texto);
                if (errorLocal) setErrorLocal('');
              }}
            />
          </View>

          {/* Correo Electrónico */}
          <Text style={styles.label}>Correo Electrónico</Text>
          <View style={styles.contenedorInput}>
            <Ionicons name="mail-outline" size={18} color={COLORES.grisNeutro} style={styles.iconoInput} />
            <TextInput
              style={styles.input}
              placeholder="juan.perez@tdea.edu.co"
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

          {/* Contraseña */}
          <Text style={styles.label}>Contraseña (mínimo 6 caracteres)</Text>
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
            >
              <Ionicons
                name={mostrarPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={COLORES.grisNeutro}
              />
            </TouchableOpacity>
          </View>

          {/* Confirmar Contraseña */}
          <Text style={styles.label}>Confirmar Contraseña</Text>
          <View style={styles.contenedorPassword}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORES.grisNeutro} style={styles.iconoInput} />
            <TextInput
              style={styles.inputPassword}
              placeholder="••••••••"
              placeholderTextColor="#9E9E9E"
              secureTextEntry={!mostrarPassword}
              autoCapitalize="none"
              value={confirmarPassword}
              onChangeText={(texto) => {
                setConfirmarPassword(texto);
                if (errorLocal) setErrorLocal('');
              }}
            />
          </View>

          {/* Botón de Registro */}
          <TouchableOpacity
            style={[styles.botonRegistro, cargando && styles.botonDeshabilitado]}
            onPress={handleRegistro}
            disabled={cargando}
            activeOpacity={0.85}
          >
            {cargando ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.textoBotonRegistro}>Completar Registro</Text>
            )}
          </TouchableOpacity>

          {/* Enlace para volver a Iniciar Sesión */}
          <View style={styles.filaLogin}>
            <Text style={styles.textoPregunta}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity onPress={handleRegresarALogin}>
              <Text style={styles.textoEnlaceLogin}>Inicia sesión</Text>
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
    marginBottom: 24,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORES.negroInstitucional,
    letterSpacing: -0.5,
  },
  subtitulo: {
    fontSize: 14,
    color: COLORES.grisNeutro,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 12,
  },
  tarjetaFormulario: {
    backgroundColor: COLORES.superficie,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORES.borde,
    ...SOMBRAS.media,
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
    marginBottom: 14,
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
  botonRegistro: {
    backgroundColor: COLORES.verdePino,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...SOMBRAS.boton,
  },
  botonDeshabilitado: {
    backgroundColor: '#9E9E9E',
  },
  textoBotonRegistro: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  filaLogin: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  textoPregunta: {
    fontSize: 13,
    color: COLORES.grisNeutro,
  },
  textoEnlaceLogin: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.verdePino,
  },
});

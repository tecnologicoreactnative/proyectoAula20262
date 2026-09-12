import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuthContexto } from '../contextos/AuthContexto';
import { validarCorreo } from './validacionesAuth';

export default function LoginScreen({ navigation }) {
  const { iniciarSesion } = useAuthContexto();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const autenticar = async () => {
    if (!validarCorreo(correo)) {
      setError('Escribe un correo electrónico válido.');
      return;
    }
    if (!contrasena) {
      setError('Escribe tu contraseña.');
      return;
    }

    try {
      setError('');
      setCargando(true);
      await iniciarSesion(correo, contrasena);
    } catch (errorFirebase) {
      setError(
        ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found'].includes(
          errorFirebase.code
        )
          ? 'El correo o la contraseña no son correctos.'
          : 'No se pudo iniciar sesión. Inténtalo de nuevo.'
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View>
        <Text style={styles.brand}>GuardaFácil</Text>
        <Text style={styles.title}>Bienvenido de nuevo</Text>
        <Text style={styles.subtitle}>Accede a tus casilleros de forma segura.</Text>

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setCorreo}
          placeholder="tu@correo.com"
          style={styles.input}
          value={correo}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          onChangeText={setContrasena}
          placeholder="Tu contraseña"
          secureTextEntry
          style={styles.input}
          value={contrasena}
        />

        {!!error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          disabled={cargando}
          onPress={autenticar}
          style={[styles.button, cargando && styles.disabledButton]}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Iniciar sesión</Text>
          )}
        </Pressable>

        <Pressable
          disabled={cargando}
          onPress={() => navigation.navigate('Registro')}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>¿No tienes una cuenta? Regístrate</Text>
        </Pressable>

        <Pressable
          disabled={cargando}
          onPress={() => navigation.navigate('Home')}
          style={styles.backButton}
        >
          <Text style={styles.backText}>Volver</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f7ff',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brand: {
    color: '#273c9c',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 28,
  },
  title: {
    color: '#172044',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#69728e',
    fontSize: 15,
    marginBottom: 30,
  },
  label: {
    color: '#2e385b',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 7,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#d2d8ed',
    borderRadius: 12,
    borderWidth: 1,
    color: '#172044',
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 15,
  },
  error: {
    color: '#b52f43',
    fontSize: 14,
    marginTop: 12,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#273c9c',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 54,
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 22,
  },
  linkText: {
    color: '#273c9c',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 18,
  },
  backText: {
    color: '#69728e',
    fontSize: 14,
  },
});

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuthContexto } from '../contextos/AuthContexto';
import { validarRegistro } from './validacionesAuth';

const camposIniciales = {
  nombreCompleto: '',
  cedula: '',
  telefono: '',
  correo: '',
  direccion: '',
  contrasena: '',
  confirmarContrasena: '',
};

const etiquetas = {
  nombreCompleto: 'Nombre completo',
  cedula: 'Número de cédula',
  telefono: 'Número de teléfono',
  correo: 'Correo electrónico',
  direccion: 'Dirección',
  contrasena: 'Contraseña',
  confirmarContrasena: 'Confirmar contraseña',
};

export default function RegistroScreen({ navigation }) {
  const { registrarUsuario } = useAuthContexto();

  const [datos, setDatos] = useState(camposIniciales);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [cargando, setCargando] = useState(false);

  const actualizarCampo = (campo, valor) => {
    setDatos((actuales) => ({ ...actuales, [campo]: valor }));
    setErrores((actuales) => ({ ...actuales, [campo]: '' }));
    setErrorGeneral('');
  };

  const registrar = async () => {
    const erroresValidacion = validarRegistro(datos);

    if (Object.keys(erroresValidacion).length) {
      setErrores(erroresValidacion);
      return;
    }

    try {
      setCargando(true);
      setErrorGeneral('');
      await registrarUsuario(datos);
      Alert.alert('Cuenta creada', 'Tu cuenta se creó correctamente.');
    } catch (error) {
      setErrorGeneral(
        error.code === 'auth/email-already-in-use'
          ? 'Ya existe una cuenta con este correo.'
          : 'No pudimos crear tu cuenta. Revisa tus datos e inténtalo de nuevo.'
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
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.brand}>GuardaFácil</Text>
        <Text style={styles.title}>Crea tu cuenta</Text>
        <Text style={styles.subtitle}>Tu espacio seguro, cuando lo necesites.</Text>

        {Object.keys(etiquetas).map((campo) => (
          <View key={campo} style={styles.field}>
            <Text style={styles.label}>{etiquetas[campo]}</Text>
            <TextInput
              autoCapitalize={
                campo === 'correo' || campo.includes('contrasena')
                  ? 'none'
                  : 'words'
              }
              keyboardType={
                campo === 'cedula' || campo === 'telefono'
                  ? 'phone-pad'
                  : campo === 'correo'
                  ? 'email-address'
                  : 'default'
              }
              onChangeText={(valor) => actualizarCampo(campo, valor)}
              secureTextEntry={campo.includes('contrasena')}
              style={[styles.input, errores[campo] && styles.inputError]}
              value={datos[campo]}
            />
            {!!errores[campo] && <Text style={styles.error}>{errores[campo]}</Text>}
          </View>
        ))}

        {!!errorGeneral && <Text style={styles.generalError}>{errorGeneral}</Text>}

        <Pressable
          disabled={cargando}
          onPress={registrar}
          style={[styles.button, cargando && styles.disabledButton]}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Crear cuenta</Text>
          )}
        </Pressable>

        <Pressable
          disabled={cargando}
          onPress={() => navigation.navigate('Login')}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>¿Ya tienes una cuenta? Inicia sesión</Text>
        </Pressable>

        <Pressable
          disabled={cargando}
          onPress={() => navigation.navigate('Home')}
          style={styles.backButton}
        >
          <Text style={styles.backText}>Volver</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f7ff',
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  brand: {
    color: '#273c9c',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 22,
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
    marginBottom: 26,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: '#2e385b',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 7,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#d2d8ed',
    borderRadius: 12,
    borderWidth: 1,
    color: '#172044',
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 15,
  },
  inputError: {
    borderColor: '#c64051',
  },
  error: {
    color: '#b52f43',
    fontSize: 13,
    marginTop: 5,
  },
  generalError: {
    color: '#b52f43',
    fontSize: 14,
    marginBottom: 14,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#273c9c',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 54,
    marginTop: 8,
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

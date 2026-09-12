// ============================================================================
// CAPA: VISTA — Pantalla de registro de usuario
// ----------------------------------------------------------------------------
// Igual que loginScreen.js, esta Vista solo gestiona estado local del
// formulario (nombre, apellido, teléfono, correo, contraseña) y delega la
// creación real de la cuenta al servicio `registerUser` (Modelo/servicio),
// que a su vez habla con Firebase Auth. El VistaModelo (`userContext.js`)
// detecta automáticamente la nueva sesión y App.js navega a `MainStack`.
// ============================================================================
import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { registerUser } from '../services/authService';

export default function RegisterScreen({ navigation }) {
  // Estado local de la Vista para cada campo del formulario de registro.
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Valida que todos los campos requeridos estén completos y delega el
  // registro al servicio de autenticación.
  const handleSignUp = async () => {
    if (!name || !lastName || !phone || !email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const result = await registerUser(email, password, name, lastName, phone);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  // JSX presentacional: formulario controlado enlazado al estado local.
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Register
      </Text>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>
            Nombre
          </Text>
          <TextInput
            mode="outlined"
            placeholder="Tu nombre"
            value={name}
            onChangeText={setName}
            left={<TextInput.Icon icon="account" />}
            style={styles.input}
            outlineColor="#6E7A71"
            activeOutlineColor="#256B42"
            theme={{ roundness: 16 }}
          />
          
          <Text style={styles.label}>
            Apellido
          </Text>
          <TextInput
            mode="outlined"
            placeholder="Tu apellido"
            value={lastName}
            onChangeText={setLastName}
            left={<TextInput.Icon icon="account" />}
            style={styles.input}
            outlineColor="#6E7A71"
            activeOutlineColor="#256B42"
            theme={{ roundness: 16 }}
          />
          
          <Text style={styles.label}>
            Teléfono
          </Text>
          <TextInput
            mode="outlined"
            placeholder="Tu teléfono"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            left={<TextInput.Icon icon="phone" />}
            style={styles.input}
            outlineColor="#6E7A71"
            activeOutlineColor="#256B42"
            theme={{ roundness: 16 }}
          />
          
          <Text style={styles.label}>
            Correo
          </Text>
          <TextInput
            mode="outlined"
            placeholder="correo@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon="email" />}
            style={styles.input}
            outlineColor="#6E7A71"
            activeOutlineColor="#256B42"
            theme={{ roundness: 16 }}
          />
          
          <Text style={styles.label}>
            Contraseña
          </Text>
          <TextInput
            mode="outlined"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye' : 'eye-off'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
            outlineColor="#6E7A71"
            activeOutlineColor="#256B42"
            theme={{ roundness: 16 }}
          />
          
          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}
          
          <Button
            mode="contained"
            onPress={handleSignUp}
            disabled={loading}
            style={[styles.button, { backgroundColor: '#256B42' }]}
            labelStyle={[styles.buttonLabel, { color: '#FEFFFE' }]}
            contentStyle={styles.buttonContent}
            theme={{ roundness: 28 }}
          >
            {loading ? (
              <ActivityIndicator color="#FEFFFE" />
            ) : (
              'Registrarse'
            )}
          </Button>
        </View>
      </ScrollView>
      
      <TouchableOpacity
        onPress={() => navigation.navigate('Login')}
        style={styles.loginLink}
      >
        <Text style={styles.loginText}>
          ¿Ya tienes cuenta? Iniciar Sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Estilos puramente visuales de esta Vista.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    backgroundColor: '#F5FBF6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#181C1A',
    marginBottom: 24,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  formContainer: {
    width: 336,
    height: 584,
    borderRadius: 28,
    padding: 24,
    backgroundColor: '#E4EAE5',
  },
  label: {
    fontSize: 19,
    color: '#181C1A',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  error: {
    fontSize: 12,
    color: '#B3261E',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    height: 56,
    justifyContent: 'center',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContent: {
    height: 56,
  },
  loginLink: {
    marginTop: 24,
  },
  loginText: {
    fontSize: 16,
    color: '#256B42',
  },
});

import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>GF</Text>
          </View>

          <Text style={styles.brand}>GuardaFácil</Text>
          <Text style={styles.title}>
            Guarda fácil, seguro y siempre contigo.
          </Text>
          <Text style={styles.description}>
            Casilleros inteligentes para guardar y recibir tus pertenencias de forma segura.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Registro')}
          >
            <Text style={styles.secondaryButtonText}>Registrarse</Text>
          </Pressable>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f5f7ff',
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 28,
    paddingTop: 48,
    paddingBottom: 36,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: '#273c9c',
    borderRadius: 18,
    height: 72,
    justifyContent: 'center',
    marginBottom: 24,
    width: 72,
  },
  badgeText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  brand: {
    color: '#273c9c',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 22,
  },
  title: {
    color: '#172044',
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 46,
    marginBottom: 18,
  },
  description: {
    color: '#5f6885',
    fontSize: 17,
    lineHeight: 26,
    maxWidth: 430,
  },
  actions: {
    gap: 14,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#273c9c',
    borderRadius: 14,
    minHeight: 56,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#c7cee8',
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 56,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#273c9c',
    fontSize: 16,
    fontWeight: '700',
  },
});

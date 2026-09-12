/**
 * @file AppNavigator.js
 * @description Enrutador raíz de la aplicación CanchaYa.
 * Evalúa el estado reactivo del usuario en AuthContexto para aplicar
 * enrutamiento condicional:
 * - Si no hay sesión: renderiza AuthStack (Login / Registro).
 * - Si hay sesión activa: renderiza Tabs (Cátedras ACUDE, Mis Cátedras, Perfil).
 * Incluye pantalla de carga institucional con el logo oficial y paleta TdeA.
 * @module navigation/AppNavigator
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContexto';
import AuthStack from './AuthStack';
import Tabs from './Tabs';
import LogoInstitucional from '../components/LogoInstitucional';
import { COLORES } from '../constants/theme';

export default function AppNavigator() {
  const { user, loading } = useAuth();

  // Pantalla de carga inicial mientras se resuelve la persistencia en AsyncStorage
  if (loading) {
    return (
      <View style={styles.pantallaCarga}>
        <LogoInstitucional size={96} redondeado conSombra />
        <Text style={styles.tituloApp}>CanchaYa</Text>
        <Text style={styles.subtituloApp}>Tecnológico de Antioquia</Text>
        <ActivityIndicator size="large" color={COLORES.verdePino} style={styles.spinner} />
        <Text style={styles.textoCargando}>Cargando plataforma...</Text>
      </View>
    );
  }

  // Enrutamiento condicional
  return user ? <Tabs /> : <AuthStack />;
}

const styles = StyleSheet.create({
  pantallaCarga: {
    flex: 1,
    backgroundColor: COLORES.fondo,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  tituloApp: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORES.negroInstitucional,
    marginTop: 18,
    letterSpacing: -0.5,
  },
  subtituloApp: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.verdePino,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 24,
  },
  spinner: {
    marginBottom: 10,
  },
  textoCargando: {
    fontSize: 13,
    color: COLORES.grisNeutro,
    fontWeight: '500',
  },
});

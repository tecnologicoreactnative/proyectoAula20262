/**
 * @file App.js
 * @description Punto de entrada principal de la aplicación CanchaYa (Tecnológico de Antioquia).
 * [CICLO 4 - T05]: Envoltorio raíz con AuthProvider (Context API) y NavigationContainer (React Navigation v7).
 * Integra el enrutamiento condicional centralizado en AppNavigator.
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './contexts/AuthContexto';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

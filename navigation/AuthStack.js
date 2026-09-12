/**
 * @file AuthStack.js
 * @description Pila de navegación (Stack) para el flujo de autenticación (usuarios no autenticados).
 * Agrupa las pantallas de inicio de sesión y registro de cuenta.
 * @module navigation/AuthStack
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegistroScreen from '../screens/RegistroScreen';

const Stack = createStackNavigator();

/**
 * Enrutador de autenticación.
 * @returns {React.JSX.Element}
 */
export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="Registro"
        component={RegistroScreen}
        options={{
          headerShown: true,
          title: 'Registro de Cuenta',
          headerBackTitle: 'Atrás',
          headerTintColor: '#0284C7',
          headerStyle: {
            backgroundColor: '#FFFFFF',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#E2E8F0',
          },
          headerTitleStyle: {
            fontWeight: '700',
            color: '#0F172A',
          },
        }}
      />
    </Stack.Navigator>
  );
}

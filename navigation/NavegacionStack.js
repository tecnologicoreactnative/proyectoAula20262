/**
 * @file NavegacionStack.js
 * @description Pila de navegación principal (Stack) para el flujo operativo de Cátedras ACUDE.
 * Conecta: Inicio (Catálogo) -> Detalle (Ficha técnica e inscripción) -> Horarios (Agenda semanal y sobrecupo).
 * Alineado con la paleta de colores institucional TdeA y tipografía profesional.
 * @module navigation/NavegacionStack
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import InicioScreen from '../screens/InicioScreen';
import DetalleScreen from '../screens/DetalleScreen';
import HorariosScreen from '../screens/HorariosScreen';
import { COLORES } from '../constants/theme';

const Stack = createStackNavigator();

export default function NavegacionStack() {
  return (
    <Stack.Navigator
      initialRouteName="Inicio"
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORES.superficie,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: COLORES.borde,
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: COLORES.negroInstitucional,
          fontSize: 17,
        },
        headerTintColor: COLORES.verdePino,
        headerBackTitle: 'Atrás',
        cardStyle: { backgroundColor: COLORES.fondo },
      }}
    >
      <Stack.Screen
        name="Inicio"
        component={InicioScreen}
        options={{
          title: 'CanchaYa · Cátedras ACUDE',
        }}
      />
      <Stack.Screen
        name="Detalle"
        component={DetalleScreen}
        options={({ route }) => ({
          title: route.params?.acude?.nombre || 'Detalle de la Cátedra',
        })}
      />
      <Stack.Screen
        name="Horarios"
        component={HorariosScreen}
        options={{
          title: 'Cronograma y Sobrecupo',
        }}
      />
    </Stack.Navigator>
  );
}
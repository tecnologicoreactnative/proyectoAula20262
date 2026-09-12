/**
 * @file Tabs.js
 * @description Navegación inferior persistente (Bottom Tabs) para usuarios autenticados en CanchaYa.
 * Conecta las 3 áreas maestras del sistema con iconografía vectorial (Ionicons) y paleta institucional TdeA:
 * - Cátedras ACUDE (Catálogo y ficha vía NavegacionStack)
 * - Mis Cátedras (Mis talleres matriculados y liberación de cupo)
 * - Perfil (Cuenta de usuario, datos institucionales y cierre de sesión)
 * @module navigation/Tabs
 */

import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import NavegacionStack from './NavegacionStack';
import MisInscripcionesScreen from '../screens/MisInscripcionesScreen';
import PerfilScreen from '../screens/PerfilScreen';
import { COLORES } from '../constants/theme';

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator
      initialRouteName="InicioTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORES.verdePino,
        tabBarInactiveTintColor: COLORES.grisNeutro,
        tabBarStyle: {
          backgroundColor: COLORES.superficie,
          borderTopWidth: 1,
          borderTopColor: COLORES.borde,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 6,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'school-outline';
          if (route.name === 'InicioTab') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'MisInscripcionesTab') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'PerfilTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="InicioTab"
        component={NavegacionStack}
        options={{
          tabBarLabel: 'Cátedras ACUDE',
        }}
      />
      <Tab.Screen
        name="MisInscripcionesTab"
        component={MisInscripcionesScreen}
        options={{
          tabBarLabel: 'Mis Cátedras',
          headerShown: true,
          headerTitle: 'Mis Cátedras ACUDE',
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
        }}
      />
      <Tab.Screen
        name="PerfilTab"
        component={PerfilScreen}
        options={{
          tabBarLabel: 'Perfil',
          headerShown: true,
          headerTitle: 'Mi Perfil TdeA',
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
        }}
      />
    </Tab.Navigator>
  );
}

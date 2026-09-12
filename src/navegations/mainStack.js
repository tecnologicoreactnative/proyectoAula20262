// ============================================================================
// CAPA: VISTA (navegación) — Pila de pantallas de la app AUTENTICADA
// ----------------------------------------------------------------------------
// Se muestra cuando el VistaModelo (`userContext.js`) confirma que hay un
// usuario con sesión activa (ver App.js). Combina un Tab Navigator (menú
// inferior: Inicio, Buscar, Mis Préstamos, Perfil) con un Stack Navigator
// que además permite navegar a pantallas de detalle (`ArticleDetail`,
// `LoanRequest`) por encima de las tabs.
// ============================================================================
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import HomeScreen from "../screens/homeScreen";
import ProfileScreen from "../screens/profileScreen";
import ArticulosScreen from "../screens/articulosScreen";
import ArticleDetailScreen from "../screens/articleDetailScreen";
import LoanRequestScreen from "../screens/loanRequestScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Opciones visuales compartidas por las pantallas del Stack principal.
const screenOptions = {
  headerShown: false,
  animation: "slide_from_right",
};

// Menú inferior (tabs) con las secciones principales de la app ya
// autenticada. Cada pantalla (View) obtiene sus propios datos consultando
// los servicios (Modelo) o el VistaModelo (`useUser`), no recibe datos por
// props desde aquí.
function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#256B42",
        tabBarInactiveTintColor: "#3E4941",
        tabBarStyle: {
          backgroundColor: "#EAEFEB",
          borderTopColor: "#BDCAC0",
          height: 80,
          paddingBottom: 20,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Buscar"
        component={ArticulosScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="magnify" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Mis Prestamos"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Stack raíz de la app autenticada: envuelve las tabs y agrega pantallas de
// detalle/flujo (detalle de artículo, solicitud de préstamo) que se abren
// "por encima" del menú inferior.
export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="MainTabs" component={HomeTabs} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
      <Stack.Screen name="LoanRequest" component={LoanRequestScreen} />
    </Stack.Navigator>
  );
}

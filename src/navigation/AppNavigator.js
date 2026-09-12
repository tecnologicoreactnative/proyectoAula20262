// src/navigation/AppNavigator.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";

import LoginScreen from "../screens/LoginScreen";
import RegistroScreen from "../screens/RegistroScreen";
import CatalogoScreen from "../screens/CatalogoScreen";
import DetalleProductoScreen from "../screens/DetalleProductoScreen";
import CarritoScreen from "../screens/CarritoScreen";

const Stack = createNativeStackNavigator();

function PilaAutenticacion() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Registro" component={RegistroScreen} />
    </Stack.Navigator>
  );
}

function PilaPrincipal() {
  return (
    <CartProvider>
      <Stack.Navigator>
        <Stack.Screen
          name="Catalogo"
          component={CatalogoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DetalleProducto"
          component={DetalleProductoScreen}
          options={{ title: "Detalle del producto" }}
        />
        <Stack.Screen
          name="Carrito"
          component={CarritoScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </CartProvider>
  );
}

export default function AppNavigator() {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {usuario ? <PilaPrincipal /> : <PilaAutenticacion />}
    </NavigationContainer>
  );
}

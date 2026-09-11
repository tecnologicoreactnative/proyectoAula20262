// ============================================================================
// CAPA: VISTA (navegación) — Pila de pantallas NO autenticadas
// ----------------------------------------------------------------------------
// Define la estructura de navegación que se muestra cuando el VistaModelo
// (`userContext.js`) determina que no hay un usuario con sesión activa
// (ver App.js). Es puramente "cableado de Vistas": no contiene lógica de
// negocio, solo declara qué pantallas existen y en qué orden se navega entre
// ellas.
// ============================================================================
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/loginScreen";
import RegisterScreen from "../screens/registerScreen";

const Stack = createNativeStackNavigator();

// Opciones visuales compartidas por todas las pantallas de esta pila.
const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: '#F5FBF6' },
  animation: 'slide_from_right',
};

export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={screenOptions}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: "Login",
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: "Register",
        }}
      />
    </Stack.Navigator>
  );
}

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Detalle from "../screens/Detalle";
import Inicio from "../screens/Inicio";
import Login from "../screens/Login";
import Registro from "../screens/Registro";
import Solicitud from "../screens/Solicitud";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Registro"
          component={Registro}
          options={{ title: "Registro Nuevo Usuario" }}
        />
        <Stack.Screen
          name="Inicio"
          component={Inicio}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Detalle"
          component={Detalle}
          options={{ title: "Detalle del Objeto" }}
        />
        <Stack.Screen
          name="Solicitud"
          component={Solicitud}
          options={{ title: "Hacer Solicitud" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

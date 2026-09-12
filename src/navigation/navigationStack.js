import { ActivityIndicator, View } from "react-native";
// NavigationContainer: contenedor raíz de React Navigation.
// Debe existir uno solo en toda la app y envolver a los navegadores.
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../context/authContext";
import AuthStack from "./authStack";
import AppTabs from "./navigationTabs";

export default function navigationStack() {
  // Datos que expone AuthProvider
  const { user, loading } = useAuth();

  // Mientras Firebase revisa si hay sesión guardada, mostramos un spinner.
  // Evita el parpadeo del login al abrir la app estando ya autenticado.
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* EL CORAZÓN DE LA NAVEGACIÓN:
          si hay usuario se monta AppTabs, si no AuthStack.
          No hacemos navigation.navigate() después del login: el estado manda.
          Ventaja de seguridad: sin sesión, las pantallas privadas ni siquiera
          existen en el árbol, así que es imposible llegar a ellas. */}
      {user ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
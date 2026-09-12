import { StatusBar } from "expo-status-bar";
// Calcula los márgenes seguros: muesca, cámara, barra de gestos.
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/authContext";
import NavigationStack from "./src/navigation/navigationStack";

// Punto de entrada de la aplicación.
export default function App() {
  return (
    // EL ORDEN IMPORTA: AuthProvider debe envolver a RootNavigator, porque
    // RootNavigator usa useAuth(). Al revés, el contexto llega nulo y falla.
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationStack />
        {/* Barra de estado del sistema (hora, batería) */}
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
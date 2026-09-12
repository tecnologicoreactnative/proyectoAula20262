// ============================================================================
// PUNTO DE ENTRADA DE LA APP — Ensambla Modelo, VistaModelo y Vista
// ----------------------------------------------------------------------------
// Este archivo no contiene lógica de negocio ni de datos: su rol en MVVM es
// "cablear" las capas entre sí:
//   1. Envuelve la app en `UserProvider` (el VistaModelo de sesión), para que
//      cualquier pantalla descendiente pueda leer `user`/`loading` con
//      `useUser()`.
//   2. Lee ese estado del VistaModelo (`AppContent`) y decide, de forma
//      puramente declarativa, qué Vista raíz mostrar: la pila de
//      autenticación (`AuthStack`) o la pila principal (`MainStack`).
//   3. Configura el tema visual global (react-native-paper) que consumirán
//      todas las Vistas.
// ============================================================================
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider, ActivityIndicator as PaperActivityIndicator, MD3LightTheme } from "react-native-paper";
import { UserProvider, useUser } from "./src/contexts/userContext";
import AuthStack from "./src/navegations/authStack";
import MainStack from "./src/navegations/mainStack";

// Tema visual (colores) compartido por todos los componentes de
// react-native-paper en la Vista. Vive en App.js para aplicarse antes de
// renderizar cualquier pantalla.
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#256B42',
    onPrimary: '#FEFFFE',
    primaryContainer: '#ABF2C1',
    onPrimaryContainer: '#02210E',
    secondary: '#4F6355',
    secondaryContainer: '#D1E8D7',
    onSecondaryContainer: '#0E1F14',
    tertiaryContainer: '#B6ECF4',
    onTertiaryContainer: '#031F23',
    surface: '#F5FBF6',
    surfaceContainerLow: '#EFF5F1',
    surfaceContainer: '#EAEFEB',
    surfaceContainerHigh: '#E4EAE5',
    surfaceContainerHighest: '#DEE4E0',
    onSurface: '#181C1A',
    onSurfaceVariant: '#3E4941',
    outline: '#6E7A71',
    outlineVariant: '#BDCAC0',
    error: '#B3261E',
    onError: '#FFFFFF',
    errorContainer: '#F9DEDC',
    onErrorContainer: '#410E0B',
  },
};

// Componente de Vista que consume el VistaModelo (`useUser`) para decidir
// qué navegación mostrar. Es el ejemplo más directo de "Vista reactiva al
// VistaModelo": no conoce Firebase, solo lee `user` y `loading`.
function AppContent() {
  const { user, loading } = useUser();

  // Mientras el VistaModelo aún determina si hay sesión activa (restaurando
  // la persistencia de Firebase Auth), se muestra un indicador de carga en
  // vez de parpadear entre pantallas.
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#F5FBF6' }]}>
        <PaperActivityIndicator size="large" color="#256B42" />
      </View>
    );
  }

  // Navegación condicional basada en el estado del VistaModelo:
  // con sesión -> MainStack (app autenticada), sin sesión -> AuthStack
  // (login/registro). Esta es la regla de negocio de "ruteo" más importante
  // de la app.
  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

// Componente raíz exportado: define el orden de los proveedores de contexto.
// `PaperProvider` (tema visual) envuelve a `UserProvider` (VistaModelo de
// sesión), que a su vez envuelve a `AppContent` (Vista raíz).
export default function App() {
  return (
    <PaperProvider theme={theme}>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

import { View, Text, Button, StyleSheet } from "react-native";
import { useAuth } from "../context/authContext";
import { cerrarSesion } from "../services/authServices";

/**
 * Pantalla de perfil: muestra el correo de la sesion actual
 * y permite cerrar sesion. La navegacion vuelve sola al AuthStack
 * cuando onAuthStateChanged deja user en null.
 */
export default function ProfileScreen() {
  const { user } = useAuth();
  const correo = user?.email ?? user?.correo ?? "Sin correo";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sesion iniciada como</Text>
      <Text style={styles.email}>{correo}</Text>

      <View style={styles.actions}>
        <Button title="Cerrar sesion" onPress={cerrarSesion} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  email: {
    fontSize: 17,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 24,
    textAlign: "center",
  },
  actions: {
    minWidth: 180,
  },
});
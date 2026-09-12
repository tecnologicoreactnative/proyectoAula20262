// src/screens/LoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { iniciarSesion } from "../services/authService";

export default function LoginScreen({ navigation }) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarLogin() {
    if (!correo || !contrasena) {
      Alert.alert("Datos incompletos", "Ingresa tu correo y contraseña.");
      return;
    }
    setCargando(true);
    try {
      await iniciarSesion({ correo, contrasena });
      // La navegación al catálogo ocurre automáticamente vía AuthContext
    } catch (error) {
      Alert.alert("No se pudo iniciar sesión", traducirError(error.code));
    } finally {
      setCargando(false);
    }
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>MercaVerde</Text>
      <Text style={styles.subtitulo}>Mercado campesino y cafetería del TdeA</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo institucional"
        autoCapitalize="none"
        keyboardType="default"
        value={correo}
        onChangeText={setCorreo}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={contrasena}
        onChangeText={setContrasena}
      />

      <TouchableOpacity style={styles.boton} onPress={manejarLogin} disabled={cargando}>
        {cargando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botonTexto}>Iniciar sesión</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Registro")}>
        <Text style={styles.enlace}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}

function traducirError(codigo) {
  switch (codigo) {
    case "auth/invalid-email":
      return "El correo no es válido.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Correo o contraseña incorrectos.";
    default:
      return "Ocurrió un error. Intenta de nuevo.";
  }
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#F4F7F1" },
  titulo: { fontSize: 32, fontWeight: "700", color: "#2E5A2E", textAlign: "center" },
  subtitulo: { fontSize: 14, color: "#5A6B57", textAlign: "center", marginBottom: 32 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#DDE3D8",
  },
  boton: {
    backgroundColor: "#2E7D32",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  botonTexto: { color: "#fff", fontWeight: "600", fontSize: 16 },
  enlace: { textAlign: "center", marginTop: 18, color: "#2E7D32" },
});

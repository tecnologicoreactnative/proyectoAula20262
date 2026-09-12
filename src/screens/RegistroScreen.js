// src/screens/RegistroScreen.js
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
import { registrarUsuario } from "../services/authService";

export default function RegistroScreen({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarRegistro() {
    if (!nombre || !correo || !contrasena) {
      Alert.alert("Datos incompletos", "Completa todos los campos.");
      return;
    }
    if (contrasena.length < 6) {
      Alert.alert("Contraseña muy corta", "Debe tener al menos 6 caracteres.");
      return;
    }
    setCargando(true);
    try {
      await registrarUsuario({ nombre, correo, contrasena });
      // AuthContext detecta la sesión y navega automáticamente
    } catch (error) {
      Alert.alert("No se pudo registrar", traducirError(error.code));
    } finally {
      setCargando(false);
    }
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Crear cuenta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={nombre}
        onChangeText={setNombre}
      />
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
        placeholder="Contraseña (mínimo 6 caracteres)"
        secureTextEntry
        value={contrasena}
        onChangeText={setContrasena}
      />

      <TouchableOpacity style={styles.boton} onPress={manejarRegistro} disabled={cargando}>
        {cargando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botonTexto}>Registrarme</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.enlace}>Ya tengo cuenta, iniciar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

function traducirError(codigo) {
  switch (codigo) {
    case "auth/email-already-in-use":
      return "Ese correo ya está registrado.";
    case "auth/invalid-email":
      return "El correo no es válido.";
    case "auth/weak-password":
      return "La contraseña es muy débil.";
    default:
      return "Ocurrió un error. Intenta de nuevo.";
  }
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#F4F7F1" },
  titulo: { fontSize: 26, fontWeight: "700", color: "#2E5A2E", textAlign: "center", marginBottom: 24 },
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

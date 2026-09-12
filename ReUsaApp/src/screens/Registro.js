import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth } from "../services/firebase";

export default function Registro({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegistro = () => {
    if (email === "" || password === "") {
      Alert.alert("Error", "Por favor llena todos los campos.");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        Alert.alert("Éxito", "Cuenta creada correctamente.", [
          { text: "OK", onPress: () => navigation.replace("Inicio") },
        ]);
      })
      .catch((error) => {
        Alert.alert(
          "Error",
          "No se pudo crear la cuenta. Intenta con otro correo o una contraseña más larga.",
        );
        console.log(error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Crear Cuenta</Text>
      <Text style={styles.subtitulo}>Regístrate para solicitar objetos</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo Institucional"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

      <TouchableOpacity style={styles.boton} onPress={handleRegistro}>
        <Text style={styles.textoBoton}>Registrarme</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#0066cc",
  },
  subtitulo: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  boton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  textoBoton: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

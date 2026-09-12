import { signInWithEmailAndPassword } from "firebase/auth";
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

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (email === "" || password === "") {
      Alert.alert("Error", "Por favor ingresa correo y contraseña.");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Si el login es exitoso, lo mandamos a la pantalla de Inicio
        navigation.replace("Inicio");
      })
      .catch((error) => {
        Alert.alert(
          "Error de Autenticación",
          "Correo o contraseña incorrectos.",
        );
        console.log(error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Bienvenido a ReUsaApp</Text>
      <Text style={styles.subtitulo}>Inicia sesión para continuar</Text>

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

      <TouchableOpacity style={styles.boton} onPress={handleLogin}>
        <Text style={styles.textoBoton}>Ingresar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Registro")}>
        <Text style={styles.textoEnlace}>
          ¿No tienes cuenta? Regístrate aquí
        </Text>
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
    backgroundColor: "#0066cc",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  textoBoton: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  textoEnlace: { color: "#0066cc", textAlign: "center", fontWeight: "bold" },
});

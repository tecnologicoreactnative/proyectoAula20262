import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
// Agregamos query, where y getDocs para poder hacer la validación antes de guardar
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

import { auth, db } from "../services/firebase";

export default function Solicitud({ route, navigation }) {
  const { objeto } = route.params;

  // Estados para los tres campos
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviarSolicitud = async () => {
    // 1. Validación de campos obligatorios
    if (
      nombreCompleto.trim() === "" ||
      telefono.trim() === "" ||
      mensaje.trim() === ""
    ) {
      Alert.alert("Error", "Por favor llena todos los campos del formulario.");
      return;
    }

    setEnviando(true);

    try {
      // 2. Validación de solicitudes duplicadas
      const q = query(
        collection(db, "solicitudes"),
        where("objetoId", "==", objeto.id),
        where("correoSolicitante", "==", auth.currentUser.email),
        where("estado", "==", "pendiente"),
      );

      const querySnapshot = await getDocs(q);

      // Si la consulta no está vacía, significa que ya hay una solicitud activa
      if (!querySnapshot.empty) {
        Alert.alert(
          "Aviso",
          "Ya tienes una solicitud activa para este objeto. Espera a que el dueño te contacte.",
        );
        setEnviando(false);
        return;
      }

      // 3. Guardar en Firestore con todos los datos nuevos
      await addDoc(collection(db, "solicitudes"), {
        objetoId: objeto.id,
        nombreObjeto: objeto.nombre,
        correoSolicitante: auth.currentUser.email,
        nombreSolicitante: nombreCompleto,
        telefono: telefono,
        mensaje: mensaje,
        estado: "pendiente",
        fecha: new Date().toISOString(),
      });

      Alert.alert(
        "¡Éxito!",
        "Tu solicitud ha sido enviada. El dueño se pondrá en contacto contigo.",
        [{ text: "OK", onPress: () => navigation.navigate("Inicio") }],
      );
    } catch (error) {
      console.log("Error guardando solicitud: ", error);
      Alert.alert("Error", "Hubo un problema al enviar tu solicitud.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Solicitar: {objeto.nombre}</Text>
      <Text style={styles.subtitulo}>
        Llena este formulario para que el dueño sepa que te interesa y puedan
        coordinar la entrega en el TdeA.
      </Text>

      {/* 1. Campo de Nombre Completo */}
      <Text style={styles.label}>Nombre completo</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Ana Vasquez"
        value={nombreCompleto}
        onChangeText={setNombreCompleto}
      />

      {/* 2. Campo de Teléfono */}
      <Text style={styles.label}>Teléfono de contacto (WhatsApp)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 3001234567"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />

      {/* 3. Campo de Mensaje */}
      <Text style={styles.label}>¿Por qué lo necesitas?</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Ej: Lo necesito para mis clases de este semestre..."
        value={mensaje}
        onChangeText={setMensaje}
        multiline={true}
        numberOfLines={4}
      />

      <TouchableOpacity
        style={styles.boton}
        onPress={enviarSolicitud}
        disabled={enviando}
      >
        {enviando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botonTexto}>Enviar Solicitud</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#0066cc",
  },
  subtitulo: { fontSize: 15, color: "#555", marginBottom: 25, lineHeight: 22 },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 8, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 15,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  boton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
  },
  botonTexto: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

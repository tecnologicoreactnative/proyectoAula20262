import { signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "../services/firebase";

export default function Inicio({ navigation }) {
  const [objetos, setObjetos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Esta función va a Firestore y trae los documentos de la colección 'objetos'
  const cargarObjetos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "objetos"));
      const listaObjetos = [];
      querySnapshot.forEach((doc) => {
        // Guardamos el ID del documento junto con los datos
        listaObjetos.push({ id: doc.id, ...doc.data() });
      });
      setObjetos(listaObjetos);
    } catch (error) {
      console.log("Error de Firestore:", error);
      Alert.alert("Error", error.message);
    } finally {
      setCargando(false);
    }
  };

  // useEffect hace que la función se ejecute apenas carga la pantalla
  useEffect(() => {
    cargarObjetos();
  }, []);

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      navigation.replace("Login");
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al cerrar sesión");
    }
  };

  // Así se ve cada cuadrito de la lista
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imagen }} style={styles.imagen} />
      <View style={styles.infoContainer}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <Text style={styles.textoSecundario}>Categoría: {item.categoria}</Text>
        <Text style={styles.textoSecundario}>Estado: {item.estado}</Text>
        <Text style={styles.puntoEntrega}>📍 {item.puntoEntrega}</Text>

        {/* Aquí está el botón para ir al Detalle */}
        <TouchableOpacity
          style={styles.btnDetalles}
          onPress={() => navigation.navigate("Detalle", { objeto: item })}
        >
          <Text style={styles.btnDetallesTexto}>Ver detalles</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Catálogo ReUsa</Text>
        <TouchableOpacity style={styles.btnCerrar} onPress={cerrarSesion}>
          <Text style={styles.btnCerrarText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {cargando ? (
        <ActivityIndicator
          size="large"
          color="#0066cc"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={objetos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <Text style={styles.vacio}>
              No hay objetos disponibles en este momento.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    justifyস্থিত: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    marginTop: 30,
  },
  title: { fontSize: 22, fontWeight: "bold" },
  btnCerrar: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  btnCerrarText: { color: "#fff", fontWeight: "bold" },
  lista: { padding: 15 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imagen: { width: 80, height: 80, borderRadius: 5, backgroundColor: "#eee" },
  infoContainer: { marginLeft: 15, flex: 1, justifyContent: "center" },
  nombre: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  textoSecundario: { color: "#555", fontSize: 14, marginBottom: 2 },
  puntoEntrega: {
    color: "#0066cc",
    fontSize: 13,
    marginTop: 5,
    fontWeight: "500",
  },
  vacio: { textAlign: "center", marginTop: 50, color: "#666", fontSize: 16 },
  /* Estilos del nuevo botón */
  btnDetalles: {
    backgroundColor: "#0066cc",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  btnDetallesTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
});

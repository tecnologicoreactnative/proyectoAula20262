import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Detalle({ route, navigation }) {
  // Recibimos los datos del objeto elegido
  const { objeto } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: objeto.imagen }} style={styles.imagen} />

      <View style={styles.infoContainer}>
        <Text style={styles.nombre}>{objeto.nombre}</Text>
        <Text style={styles.textoSecundario}>
          Categoría: {objeto.categoria}
        </Text>
        <Text style={styles.textoSecundario}>Estado: {objeto.estado}</Text>
        <Text style={styles.puntoEntrega}>
          📍 Punto de entrega: {objeto.puntoEntrega}
        </Text>

        <View style={styles.separador} />

        <Text style={styles.subtitulo}>Descripción</Text>
        <Text style={styles.descripcion}>{objeto.descripcion}</Text>
      </View>

      <TouchableOpacity
        style={styles.boton}
        // Navegamos a la pantalla de Solicitud pasando el objeto como parámetro
        onPress={() => navigation.navigate("Solicitud", { objeto: objeto })}
      >
        <Text style={styles.botonTexto}>Me interesa</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#fff", paddingBottom: 20 },
  imagen: {
    width: "100%",
    height: 250,
    backgroundColor: "#eee",
    resizeMode: "cover",
  },
  infoContainer: { padding: 20 },
  nombre: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  textoSecundario: { fontSize: 16, color: "#555", marginBottom: 5 },
  puntoEntrega: {
    fontSize: 16,
    color: "#0066cc",
    fontWeight: "bold",
    marginTop: 10,
  },
  separador: { height: 1, backgroundColor: "#ddd", marginVertical: 20 },
  subtitulo: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  descripcion: { fontSize: 16, color: "#444", lineHeight: 24 },
  boton: {
    backgroundColor: "#28a745",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  botonTexto: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
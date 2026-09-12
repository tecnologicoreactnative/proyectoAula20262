// src/screens/DetalleProductoScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { obtenerProducto } from "../services/catalogoService";
import { useCart } from "../context/CartContext";

export default function DetalleProductoScreen({ route, navigation }) {
  const { productoId } = route.params;
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(true);
  const { agregarProducto } = useCart();

  useEffect(() => {
    (async () => {
      try {
        const data = await obtenerProducto(productoId);
        setProducto(data);
      } catch (error) {
        Alert.alert("Producto no disponible", error.message);
        navigation.goBack();
      } finally {
        setCargando(false);
      }
    })();
  }, [productoId]);

  function manejarAgregar() {
    if (!producto || producto.disponibilidad <= 0) {
      Alert.alert("Sin existencias", "Este producto está agotado por ahora.");
      return;
    }
    if (cantidad > producto.disponibilidad) {
      Alert.alert(
        "Cantidad no disponible",
        `Solo quedan ${producto.disponibilidad} ${producto.unidad}.`
      );
      return;
    }
    agregarProducto(producto, cantidad);
    Alert.alert("Agregado", `${producto.nombre} se agregó al pedido.`);
    navigation.goBack();
  }

  if (cargando || !producto) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      {producto.imagenUrl ? (
        <Image source={{ uri: producto.imagenUrl }} style={styles.imagen} />
      ) : (
        <View style={[styles.imagen, styles.imagenPlaceholder]}>
          <Text style={{ color: "#9AA79A" }}>Sin imagen</Text>
        </View>
      )}

      <Text style={styles.nombre}>{producto.nombre}</Text>
      <Text style={styles.categoria}>{producto.categoria}</Text>
      <Text style={styles.precio}>
        ${producto.precio?.toLocaleString("es-CO")} / {producto.unidad}
      </Text>
      <Text style={styles.descripcion}>{producto.descripcion}</Text>
      <Text style={styles.productor}>Productor: {producto.productor}</Text>
      <Text
        style={[
          styles.disponibilidad,
          { color: producto.disponibilidad > 0 ? "#2E7D32" : "#C62828" },
        ]}
      >
        {producto.disponibilidad > 0
          ? `${producto.disponibilidad} ${producto.unidad} disponibles`
          : "Agotado"}
      </Text>

      <View style={styles.selectorCantidad}>
        <TouchableOpacity
          style={styles.botonCantidad}
          onPress={() => setCantidad((c) => Math.max(1, c - 1))}
        >
          <Text style={styles.botonCantidadTexto}>−</Text>
        </TouchableOpacity>
        <Text style={styles.cantidad}>{cantidad}</Text>
        <TouchableOpacity
          style={styles.botonCantidad}
          onPress={() => setCantidad((c) => c + 1)}
        >
          <Text style={styles.botonCantidadTexto}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.boton} onPress={manejarAgregar}>
        <Text style={styles.botonTexto}>Agregar al pedido</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#F4F7F1", padding: 20 },
  centrado: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4F7F1" },
  imagen: { width: "100%", height: 220, borderRadius: 14, marginBottom: 16 },
  imagenPlaceholder: { backgroundColor: "#E9EEE6", justifyContent: "center", alignItems: "center" },
  nombre: { fontSize: 24, fontWeight: "700", color: "#2B2F2B" },
  categoria: { color: "#7A867A", marginTop: 2, marginBottom: 8 },
  precio: { fontSize: 20, fontWeight: "600", color: "#2E7D32", marginBottom: 10 },
  descripcion: { color: "#4A554A", lineHeight: 20, marginBottom: 10 },
  productor: { color: "#5A6B57", marginBottom: 6 },
  disponibilidad: { fontWeight: "600", marginBottom: 20 },
  selectorCantidad: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  botonCantidad: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#DDE3D8",
    justifyContent: "center",
    alignItems: "center",
  },
  botonCantidadTexto: { fontSize: 20, fontWeight: "700", color: "#2E5A2E" },
  cantidad: { fontSize: 18, fontWeight: "600", marginHorizontal: 20 },
  boton: { backgroundColor: "#2E7D32", borderRadius: 12, padding: 16, alignItems: "center" },
  botonTexto: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

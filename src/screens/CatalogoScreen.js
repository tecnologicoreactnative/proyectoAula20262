// src/screens/CatalogoScreen.js
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { obtenerCatalogo } from "../services/catalogoService";
import { cerrarSesion } from "../services/authService";
import { useCart } from "../context/CartContext";

export default function CatalogoScreen({ navigation }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const { items } = useCart();

  const cargarCatalogo = useCallback(async () => {
    try {
      const lista = await obtenerCatalogo();
      setProductos(lista);
    } catch (error) {
      console.warn("Error cargando catálogo:", error.message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setCargando(true);
      await cargarCatalogo();
      setCargando(false);
    })();
  }, [cargarCatalogo]);

  async function manejarRefresh() {
    setRefrescando(true);
    await cargarCatalogo();
    setRefrescando(false);
  }

  const totalItemsCarrito = items.reduce((acc, i) => acc + i.cantidad, 0);

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Catálogo de la semana</Text>
        <TouchableOpacity onPress={cerrarSesion}>
          <Text style={styles.salir}>Salir</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={manejarRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 90 }}
        ListEmptyComponent={
          <Text style={styles.vacio}>
            No hay productos activos en el catálogo todavía.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.tarjeta}
            onPress={() => navigation.navigate("DetalleProducto", { productoId: item.id })}
          >
            {item.imagenUrl ? (
              <Image source={{ uri: item.imagenUrl }} style={styles.imagen} />
            ) : (
              <View style={[styles.imagen, styles.imagenPlaceholder]}>
                <Text style={{ color: "#9AA79A" }}>Sin imagen</Text>
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.detalle}>
                ${item.precio?.toLocaleString("es-CO")} / {item.unidad}
              </Text>
              <Text
                style={[
                  styles.disponibilidad,
                  { color: item.disponibilidad > 0 ? "#2E7D32" : "#C62828" },
                ]}
              >
                {item.disponibilidad > 0
                  ? `${item.disponibilidad} disponibles`
                  : "Agotado"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.botonCarrito}
        onPress={() => navigation.navigate("Carrito")}
      >
        <Text style={styles.botonCarritoTexto}>
          Ver pedido {totalItemsCarrito > 0 ? `(${totalItemsCarrito})` : ""}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#F4F7F1", paddingTop: 50, paddingHorizontal: 16 },
  centrado: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4F7F1" },
  encabezado: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  titulo: { fontSize: 22, fontWeight: "700", color: "#2E5A2E" },
  salir: { color: "#C62828", fontWeight: "600" },
  vacio: { textAlign: "center", marginTop: 40, color: "#7A867A" },
  tarjeta: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
    elevation: 1,
  },
  imagen: { width: 64, height: 64, borderRadius: 8, marginRight: 12 },
  imagenPlaceholder: { backgroundColor: "#E9EEE6", justifyContent: "center", alignItems: "center" },
  info: { flex: 1 },
  nombre: { fontSize: 16, fontWeight: "600", color: "#2B2F2B" },
  detalle: { color: "#5A6B57", marginTop: 2 },
  disponibilidad: { marginTop: 2, fontSize: 12, fontWeight: "600" },
  botonCarrito: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#2E7D32",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  botonCarritoTexto: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

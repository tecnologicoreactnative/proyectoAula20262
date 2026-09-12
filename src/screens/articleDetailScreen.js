// ============================================================================
// CAPA: VISTA — Detalle de un artículo
// ----------------------------------------------------------------------------
// A diferencia de otras pantallas, esta Vista no vuelve a consultar el
// Modelo: recibe el artículo completo a través de los parámetros de
// navegación (`route.params.article`), que fue seleccionado previamente en
// `articulosScreen.js`. Es un ejemplo de "paso de datos entre Vistas" sin
// pasar por el VistaModelo/servicio nuevamente, útil cuando los datos ya
// están disponibles y no cambian con frecuencia.
// ============================================================================
import React from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ArticleDetailScreen({ navigation, route }) {
  const { article } = route.params || {};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{article?.nombre || "Detalle"}</Text>

      <View style={styles.card}>
        <View style={styles.cardHandle} />

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Serial</Text>
          <Text style={styles.fieldValue}>{article?.serial || "—"}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Nombre</Text>
          <Text style={styles.fieldValue}>{article?.nombre || "—"}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Stock</Text>
          <Text style={styles.fieldValue}>{article?.stock ?? "—"}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Descripción</Text>
          <Text style={styles.fieldValue}>{article?.descripcion || "—"}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Imagen</Text>
          <View style={styles.imagePlaceholder}>
            <MaterialCommunityIcons name="image" size={48} color="#6E7A71" />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#FEFFFE" />
      </TouchableOpacity>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

// Estilos puramente visuales de esta Vista.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FBF6",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#181C1A",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: "#E4EAE5",
    borderRadius: 28,
    padding: 24,
  },
  cardHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#6E7A71",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 24,
  },
  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#181C1A",
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 14,
    color: "#3E4941",
    lineHeight: 20,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: "#DEE4E0",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  backButton: {
    position: "absolute",
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#256B42",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  bottomSpacing: {
    height: 120,
  },
});

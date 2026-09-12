import { View, Text, StyleSheet } from "react-native";

/**
 * Pantalla provisional de categorias.
 * Se reemplaza cuando se implemente RF-CAT-01.
 */
export default function CategoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categorias</Text>
      <Text style={styles.subtitle}>
        Aqui vas a ver y organizar tus categorias de gastos e ingresos.
      </Text>
      <Text style={styles.hint}>Proximamente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#555",
    textAlign: "center",
    marginBottom: 16,
  },
  hint: {
    fontSize: 13,
    color: "#888",
  },
});
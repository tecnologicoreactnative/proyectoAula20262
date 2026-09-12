// ============================================================================
// CAPA: VISTA — Pantalla de inicio (dashboard de préstamos activos)
// ----------------------------------------------------------------------------
// Esta Vista combina dos fuentes de estado:
//  1. El VistaModelo de sesión (`useUser`) para saber qué usuario está
//     autenticado y así filtrar sus préstamos.
//  2. Una suscripción directa al servicio (`subscribeToLoans`) para obtener
//     los préstamos en tiempo real. En apps más grandes esto normalmente se
//     movería a un VistaModelo dedicado, pero aquí la propia pantalla asume
//     ese rol combinando `useState` + `useEffect` como "mini VistaModelo"
//     local a la Vista.
// ============================================================================
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Card, ProgressBar } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useUser } from "../contexts/userContext";
import { subscribeToLoans } from "../services/firestoreService";

export default function HomeScreen({ navigation }) {
  const { user } = useUser();
  // Estado local que refleja los préstamos activos del usuario. Se actualiza
  // automáticamente cada vez que cambian los datos en Firestore.
  const [activeLoans, setActiveLoans] = useState([]);

  useEffect(() => {
    // Se suscribe (Modelo -> Vista) a los préstamos del usuario actual y
    // filtra solo los que están en estado "activo". La función retornada
    // por `subscribeToLoans` se usa para cancelar la suscripción al
    // desmontar la pantalla o cambiar de usuario, evitando fugas de memoria.
    const unsubscribe = subscribeToLoans(user?.uid, (loans) => {
      setActiveLoans(loans.filter((loan) => loan.estado === "activo"));
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Calcula cuántos días faltan para el vencimiento de un préstamo.
  // Lógica de presentación derivada de los datos, no de negocio.
  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calcula el progreso (0 a 1) transcurrido entre el inicio y fin de un
  // préstamo, usado para dibujar la barra de progreso visual.
  const getProgress = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(Math.max(elapsed / total, 0), 1);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>PrestaLab</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={24}
              color="#FEFFFE"
            />
          </TouchableOpacity>
        </View>
      </View>

      {activeLoans.length > 0 && (
        <View style={styles.alertCard}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={20}
            color="#0E1F14"
          />
          <Text style={styles.alertText}>
            Tu préstamo de {activeLoans[0]?.articuloNombre} vence en{" "}
            {getDaysRemaining(activeLoans[0]?.fechaFin)} días
          </Text>
        </View>
      )}

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: "#256B42" }]}
          onPress={() => navigation.navigate("Buscar")}
        >
          <MaterialCommunityIcons
            name="plus-circle-outline"
            size={32}
            color="#FEFFFE"
          />
          <Text style={[styles.actionText, { color: "#FEFFFE" }]}>Prestar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: "#E4EAE5" }]}
          onPress={() => navigation.navigate("Mis Prestamos")}
        >
          <MaterialCommunityIcons
            name="keyboard-return"
            size={32}
            color="#181C1A"
          />
          <Text style={[styles.actionText, { color: "#181C1A" }]}>
            Devolver
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Mis préstamos activos</Text>

      {activeLoans.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <MaterialCommunityIcons
              name="package-variant"
              size={48}
              color="#3E4941"
            />
            <Text style={styles.emptyText}>No tienes préstamos activos</Text>
          </Card.Content>
        </Card>
      ) : (
        activeLoans.map((loan) => (
          <Card key={loan.id} style={styles.loanCard}>
            <Card.Content style={styles.loanContent}>
              <View style={styles.loanHeader}>
                <Text style={styles.loanName}>{loan.articuloNombre}</Text>
                <View style={styles.daysBadge}>
                  <Text style={styles.daysText}>
                    {getDaysRemaining(loan.fechaFin)} días
                  </Text>
                </View>
              </View>
              <Text style={styles.loanDate}>Vence: {loan.fechaFin}</Text>
              <ProgressBar
                progress={getProgress(loan.fechaInicio, loan.fechaFin)}
                color="#FEFFFE"
                style={styles.progressBar}
              />
            </Card.Content>
          </Card>
        ))
      )}

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
    height: 220,
    backgroundColor: "#256B42",
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FEFFFE",
  },
  notificationButton: {
    padding: 8,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 28,
    backgroundColor: "#D1E8D7",
  },
  alertText: {
    marginLeft: 12,
    fontSize: 12,
    color: "#0E1F14",
    flex: 1,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    gap: 16,
  },
  actionCard: {
    width: 168,
    height: 160,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  actionText: {
    fontSize: 36,
    fontWeight: "500",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#181C1A",
    marginLeft: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  emptyCard: {
    marginHorizontal: 16,
    borderRadius: 28,
    backgroundColor: "#E4EAE5",
  },
  emptyContent: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: "#3E4941",
    marginTop: 12,
  },
  loanCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 28,
    backgroundColor: "#256B42",
  },
  loanContent: {
    paddingVertical: 18,
  },
  loanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  loanName: {
    fontSize: 18,
    fontWeight: "500",
    color: "#FEFFFE",
    flex: 1,
  },
  daysBadge: {
    backgroundColor: "#ABF2C1",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 28,
  },
  daysText: {
    fontSize: 13,
    color: "#02210E",
  },
  loanDate: {
    fontSize: 14,
    color: "#FEFFFE",
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  bottomSpacing: {
    height: 100,
  },
});

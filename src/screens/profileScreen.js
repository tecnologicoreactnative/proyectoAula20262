// ============================================================================
// CAPA: VISTA — Pantalla de perfil del usuario
// ----------------------------------------------------------------------------
// Combina el VistaModelo de sesión (`useUser`, para mostrar datos del
// usuario y ofrecer `logoutUser`) con una suscripción propia a los
// préstamos del usuario para calcular estadísticas (total, activos,
// sanciones) en tiempo real.
// ============================================================================
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '../contexts/userContext';
import { subscribeToLoans } from '../services/firestoreService';
import { logoutUser } from '../services/authService';

export default function ProfileScreen({ navigation }) {
  const { user } = useUser();
  // Estadísticas derivadas de los préstamos del usuario, recalculadas cada
  // vez que llega una actualización en tiempo real desde Firestore.
  const [stats, setStats] = useState({
    totalLoans: 0,
    activeLoans: 0,
    sanctions: 0,
  });

  useEffect(() => {
    // Suscripción reactiva (Modelo -> Vista): cada cambio en los préstamos
    // del usuario recalcula automáticamente las estadísticas mostradas.
    const unsubscribe = subscribeToLoans(user?.uid, (loans) => {
      setStats({
        totalLoans: loans.length,
        activeLoans: loans.filter(loan => loan.estado === 'activo').length,
        sanctions: loans.filter(loan => loan.estado === 'sancionado').length,
      });
    });
    
    return () => unsubscribe();
  }, [user?.uid]);

  // Delega el cierre de sesión al servicio de autenticación; el VistaModelo
  // de sesión detectará el cambio y App.js redirigirá automáticamente al
  // AuthStack.
  const handleSignOut = async () => {
    const result = await logoutUser();
    if (!result.success) {
      console.error('Error signing out:', result.error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>
            Mi Perfil
          </Text>
          <TouchableOpacity onPress={handleSignOut}>
            <Text style={styles.logoutText}>
              Cerrar Sesión
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.avatarContainer}>
        {user?.photoURL ? (
          <Avatar.Image 
            size={200} 
            source={{ uri: user?.photoURL }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatarPlaceholder, styles.avatar]}>
            <MaterialCommunityIcons name="account" size={80} color="#3E4941" />
          </View>
        )}
        <TouchableOpacity style={styles.editButton}>
          <MaterialCommunityIcons name="pencil" size={20} color="#FEFFFE" />
        </TouchableOpacity>
      </View>

      <Text style={styles.userName}>
        {user?.displayName || 'Usuario'}
      </Text>

      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>
              Préstamos
            </Text>
            <Text style={styles.statValue}>
              {stats.totalLoans}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>
              Activos
            </Text>
            <Text style={styles.statValue}>
              {stats.activeLoans}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>
              Sanciones
            </Text>
            <Text style={styles.statValue}>
              {stats.sanctions}
            </Text>
          </View>
        </View>
      </View>

      <Card style={styles.menuCard}>
        <Card.Content style={styles.menuContent}>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons 
              name="history" 
              size={24} 
              color="#181C1A" 
            />
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>
                Historial de préstamos
              </Text>
              <Text style={styles.menuSubtitle}>
                Ver todos tus préstamos anteriores
              </Text>
            </View>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color="#3E4941" 
            />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      <Card style={styles.menuCard}>
        <Card.Content style={styles.menuContent}>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons 
              name="chart-line" 
              size={24} 
              color="#181C1A" 
            />
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>
                Estadísticas
              </Text>
              <Text style={styles.menuSubtitle}>
                Consumos y frecuencias de uso
              </Text>
            </View>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color="#3E4941" 
            />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

// Estilos puramente visuales de esta Vista.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FBF6',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#181C1A',
  },
  logoutText: {
    fontSize: 14,
    color: '#B3261E',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    marginBottom: 8,
    backgroundColor: '#DEE4E0',
  },
  avatarPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    right: 100,
    bottom: 0,
    width: 48,
    height: 48,
    borderRadius: 28,
    backgroundColor: '#256B42',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#181C1A',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsCard: {
    marginHorizontal: 16,
    borderRadius: 28,
    marginBottom: 24,
    backgroundColor: '#E4EAE5',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 16,
    color: '#3E4941',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#181C1A',
  },
  menuCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: '#DEE4E0',
  },
  menuContent: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#181C1A',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#3E4941',
    marginTop: 2,
  },
  bottomSpacing: {
    height: 100,
  },
});

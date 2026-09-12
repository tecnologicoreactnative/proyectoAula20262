import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { obtenerCasilleros } from '../services/zonasService';

export default function CasillerosScreen({ route, navigation }) {
  const { zonaId, zonaNombre } = route.params;
  const [casilleros, setCasilleros] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarCasilleros = async () => {
      try {
        const datos = await obtenerCasilleros(zonaId);
        setCasilleros(datos);
      } catch (error) {
        console.error('Error cargando casilleros:', error);
      } finally {
        setCargando(false);
      }
    };
    cargarCasilleros();
  }, [zonaId]);

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#273c9c" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>{zonaNombre}</Text>

      <FlatList
        data={casilleros}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate('DetalleCasillero', {
                zonaId,
                casilleroId: item.id,
                zonaNombre,
              })
            }
          >
            <View>
              <Text style={styles.numero}>{item.numero}</Text>
              <Text style={styles.tamano}>Tamaño: {item.tamano}</Text>
            </View>

            <View
              style={[
                styles.badge,
                { backgroundColor: item.disponible ? '#2ecc71' : '#e74c3c' },
              ]}
            >
              <Text style={styles.badgeTexto}>
                {item.disponible ? 'Disponible' : 'Ocupado'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f5f7ff',
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#273c9c',
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderColor: '#d2d8ed',
    borderWidth: 1,
    borderRadius: 12,
  },
  numero: {
    fontSize: 16,
    fontWeight: '700',
    color: '#172044',
  },
  tamano: {
    fontSize: 14,
    color: '#69728e',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeTexto: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});

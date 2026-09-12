import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuthContexto } from '../contextos/AuthContexto';
import { obtenerZonas } from '../services/zonasService';

export default function ListaScreen({ navigation }) {
  const { usuario, cerrarSesion } = useAuthContexto();
  const [zonas, setZonas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarZonas = async () => {
      try {
        const datos = await obtenerZonas();
        setZonas(datos);
      } catch (error) {
        console.error('Error cargando zonas:', error);
      } finally {
        setCargando(false);
      }
    };
    cargarZonas();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a GuardaFácil</Text>
      <Text style={styles.email}>{usuario?.email}</Text>
      <Text style={styles.description}>Zonas disponibles:</Text>

      {cargando ? (
        <ActivityIndicator size="large" color="#273c9c" />
      ) : (
        <FlatList
          data={zonas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() =>
                navigation.navigate('Casilleros', {
                  zonaId: item.id,
                  zonaNombre: item.nombre,
                })
              }
            >
              <Text style={styles.nombreZona}>{item.nombre}</Text>
              <Text style={styles.ubicacion}>{item.ubicacion}</Text>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <View style={styles.footer}>
              <Pressable style={styles.primaryButton} onPress={cerrarSesion}>
                <Text style={styles.primaryButtonText}>Cerrar sesión</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16, padding: 24, backgroundColor: '#f5f7ff' },
  title: { fontSize: 28, fontWeight: '800', color: '#172044' },
  email: { color: '#273c9c', fontSize: 16, fontWeight: '600' },
  description: { color: '#69728e', fontSize: 16 },
  item: {
    padding: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderColor: '#d2d8ed',
    borderWidth: 1,
    borderRadius: 12,
  },
  nombreZona: { fontSize: 16, fontWeight: '700', color: '#172044' },
  ubicacion: { fontSize: 14, color: '#69728e' },
  footer: { marginTop: 20, marginBottom: 40 },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#273c9c',
    borderRadius: 12,
    minHeight: 54,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

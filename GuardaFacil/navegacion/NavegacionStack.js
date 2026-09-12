import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthContexto } from '../contextos/AuthContexto';
import HomeScreen from '../pantallas/HomeScreen';
import LoginScreen from '../pantallas/LoginScreen';
import RegistroScreen from '../pantallas/RegistroScreen';
import ListaScreen from '../pantallas/ListaScreen';
import CasillerosScreen from '../pantallas/CasillerosScreen';
import DetalleCasilleroScreen from '../pantallas/DetalleCasilleroScreen';

const Stack = createNativeStackNavigator();

export default function NavegacionStack() {
  const { usuario, cargando } = useAuthContexto();

  if (cargando) {
    return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" /></View>;
  }

  return (
    <Stack.Navigator>
      {usuario ? (
        <>
          <Stack.Screen name="Lista" component={ListaScreen} options={{ title: 'Inicio' }} />
          <Stack.Screen name="Casilleros" component={CasillerosScreen} options={{ title: 'Casilleros' }} />
          <Stack.Screen name="DetalleCasillero" component={DetalleCasilleroScreen} options={{ title: 'Detalle del casillero' }} />
        </>
      ) : (
        <Stack.Group>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar sesión' }} />
          <Stack.Screen name="Registro" component={RegistroScreen} options={{ title: 'Crear cuenta' }} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
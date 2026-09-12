/**
 * @file firebaseConfig.js
 * @description Inicialización centralizada de Firebase SDK modular (v10/v11/v12) para Expo.
 * Configura la persistencia de autenticación en AsyncStorage y exporta la instancia de Firestore.
 * Satisface la infraestructura base de Persistencia (T01) y desbloquea el seed de escenarios (T02).
 * @module services/firebaseConfig
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Credenciales del proyecto Firebase CanchaYa cargadas exclusivamente desde variables de entorno (EXPO_PUBLIC_*)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

if (__DEV__ && !firebaseConfig.apiKey) {
  console.warn(
    '[firebaseConfig] Advertencia: EXPO_PUBLIC_FIREBASE_API_KEY no está definida. ' +
    'Verifica que tu archivo .env contenga las variables requeridas (revisa .env.example).'
  );
}

// 1. Inicialización idempotente de Firebase App para evitar duplicaciones en recargas de desarrollo
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Inicialización idempotente de Autenticación con persistencia en AsyncStorage
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  auth = getAuth(app);
}

// 3. Inicialización del cliente de Cloud Firestore
const db = getFirestore(app);

export { app, auth, db };
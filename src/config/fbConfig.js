// ============================================================================
// CAPA: MODELO (configuración de acceso a datos)
// ----------------------------------------------------------------------------
// En el patrón MVVM, el "Modelo" no solo son las entidades de datos (artículo,
// préstamo, usuario), sino también la infraestructura que permite obtenerlos
// y persistirlos. Este archivo es el punto único de inicialización de Firebase
// y expone las instancias (`auth`, `db`) que usarán los servicios (services/)
// para construir la capa de acceso a datos. Ninguna Vista debe importar
// directamente este archivo: siempre pasa primero por un servicio o por el
// VistaModelo (contexto), lo que mantiene la Vista desacoplada de Firebase.
// ============================================================================

// Funciones del SDK de Firebase necesarias para inicializar la app,
// la autenticación (con persistencia en el dispositivo) y Firestore.
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// AsyncStorage permite que la sesión del usuario persista entre reinicios
// de la app, evitando pedir login cada vez que se abre.
import AsyncStorage from "@react-native-async-storage/async-storage";

// Variables de entorno con las credenciales del proyecto Firebase.
// Se leen desde `.env` (ver `.env.example`) y nunca deben quedar hardcodeadas
// en el código fuente, para poder cambiarlas por entorno (dev/prod) sin tocar
// el Modelo.
const requiredEnvVars = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Validación temprana: si falta alguna credencial, la app falla al arrancar
// con un mensaje claro en lugar de fallar más adelante con errores confusos
// de Firebase dentro de un servicio o pantalla.
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => `EXPO_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, "_$1").toUpperCase()}`);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Faltan variables de entorno de Firebase: ${missingEnvVars.join(", ")}. ` +
      "Copia .env.example a .env y completa los valores de tu proyecto Firebase."
  );
}

// Configuración web de Firebase que identifica a qué proyecto se conecta la app.
const firebaseConfig = {
  ...requiredEnvVars,
};

// Se inicializa la app de Firebase una sola vez (Singleton) para todo el ciclo
// de vida de la aplicación.
const app = initializeApp(firebaseConfig);

// `auth` es la puerta de entrada al Modelo de autenticación: lo consumen los
// servicios (authService.js) y el VistaModelo (userContext.js), nunca las
// Vistas directamente.
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// `db` es la puerta de entrada al Modelo de datos de negocio (artículos,
// préstamos, usuarios) almacenado en Firestore. Lo consume
// firestoreService.js, que traduce las operaciones CRUD en funciones simples
// para el VistaModelo/Vista.
const db = getFirestore(app);

// Se exportan las instancias ya configuradas para que el resto de la app
// (capa de servicios) las reutilice sin volver a inicializar Firebase.
export { auth, app, db };

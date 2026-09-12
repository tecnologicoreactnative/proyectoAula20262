// ============================================================================
// CAPA: VISTA-MODELO (ViewModel) — Estado global de sesión del usuario
// ----------------------------------------------------------------------------
// Este archivo es el VistaModelo central de autenticación de la app. Usa el
// Context API de React para exponer el estado del usuario (`user`, `loading`)
// y las acciones disponibles (`signUp`, `signIn`, `signOut`) a cualquier
// Vista (pantalla) que lo necesite, sin que esas Vistas tengan que conocer
// los detalles de Firebase.
//
// Responsabilidades de un VistaModelo que se cumplen aquí:
//  1. Mantiene el estado observable (`user`, `loading`) que las Vistas leen
//     mediante el hook `useUser()`.
//  2. Se suscribe al Modelo (Firebase Auth) y traduce sus eventos en cambios
//     de estado de React (`onAuthStateChanged`).
//  3. Expone comandos (`signUp`, `signIn`, `signOut`) que la Vista invoca en
//     respuesta a interacciones del usuario (por ejemplo, tocar un botón).
//  4. Aísla a la Vista de la implementación concreta del Modelo: si mañana
//     se cambia Firebase por otro proveedor, solo este archivo cambia.
// ============================================================================
import React, { createContext, useContext, useEffect } from "react";
import { auth } from "../config/fbConfig";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";

// Contexto de React que transportará el estado y las acciones del
// VistaModelo hacia el árbol de componentes (Vistas).
const UserContext = createContext();

// Proveedor que envuelve toda la app (ver App.js) y da acceso al VistaModelo
// de usuario a cualquier pantalla descendiente.
export function UserProvider({ children }) {
  // Estado reactivo: cuando cambia, React vuelve a renderizar automáticamente
  // las Vistas que lo consumen (por ejemplo, App.js decide mostrar
  // AuthStack o MainStack según `user`).
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    // Escucha en tiempo real los cambios de sesión del Modelo (Firebase):
    // login, logout o restauración automática de sesión al abrir la app.
    // Esto conecta el Modelo con el VistaModelo de forma reactiva, igual
    // que `onSnapshot` conecta Firestore con las pantallas de datos.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Limpieza de la suscripción al desmontar el proveedor, evitando fugas
    // de memoria o actualizaciones de estado sobre un componente ya cerrado.
    return unsubscribe;
  }, []);

  // Comando expuesto a la Vista para registrar un nuevo usuario. Delegar en
  // el SDK de Firebase directamente aquí (en vez de en authService.js) es una
  // alternativa cuando el propio VistaModelo necesita el resultado crudo
  // (por ejemplo, para actualizar el perfil recién creado).
  const signUp = async (email, password, name, lastName, phone) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    await updateProfile(userCredential.user, {
      displayName: `${name} ${lastName}`,
      phoneNumber: phone,
    });
    return userCredential;
  };

  // Comando expuesto a la Vista para iniciar sesión.
  const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Comando expuesto a la Vista para cerrar sesión.
  const signOut = () => {
    return firebaseSignOut(auth);
  };

  // El `value` del Provider es exactamente la "interfaz" del VistaModelo que
  // las Vistas pueden consumir: estado + comandos.
  return (
    <UserContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

// Hook de conveniencia que las Vistas usan para acceder al VistaModelo
// (ej. `const { user } = useUser();`), evitando que cada pantalla tenga que
// importar `useContext` y `UserContext` por separado.
export function useUser() {
  return useContext(UserContext);
}

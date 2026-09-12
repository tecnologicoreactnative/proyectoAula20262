// src/services/authService.js
// Funciones de autenticación con Firebase Authentication.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

/**
 * Registra un nuevo usuario y crea su documento en la colección "usuarios".
 */
export async function registrarUsuario({ nombre, correo, contrasena }) {
  const credenciales = await createUserWithEmailAndPassword(auth, correo, contrasena);
  const usuario = credenciales.user;

  await updateProfile(usuario, { displayName: nombre });

  await setDoc(doc(db, "usuarios", usuario.uid), {
    nombre,
    correo,
    rol: "cliente",
    creadoEn: serverTimestamp(),
  });

  return usuario;
}

/**
 * Inicia sesión con correo y contraseña.
 */
export async function iniciarSesion({ correo, contrasena }) {
  const credenciales = await signInWithEmailAndPassword(auth, correo, contrasena);
  return credenciales.user;
}

/**
 * Cierra la sesión del usuario actual.
 */
export async function cerrarSesion() {
  await signOut(auth);
}

/**
 * @file authService.js
 * @description Capa de servicios para la autenticación de usuarios mediante Firebase Authentication (SDK modular).
 * Encapsula la lógica de creación de cuenta, inicio de sesión, cierre de sesión y traducción
 * de códigos de error de Firebase a mensajes legibles en español.
 * @module services/authService
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from './firebaseConfig';

/**
 * Mapea códigos de error técnicos de Firebase Auth a mensajes descriptivos en español.
 * @param {string} codigoError - Código de error de Firebase (ej. 'auth/wrong-password').
 * @returns {string} Mensaje entendible para el usuario final.
 */
export function formatearErrorAuth(codigoError) {
  switch (codigoError) {
    case 'auth/invalid-email':
      return 'El correo electrónico no tiene un formato válido.';
    case 'auth/user-not-found':
      return 'No existe ninguna cuenta con este correo electrónico.';
    case 'auth/wrong-password':
      return 'La contraseña ingresada es incorrecta.';
    case 'auth/invalid-credential':
      return 'Credenciales inválidas. Verifica tu correo y contraseña.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta registrada con este correo electrónico.';
    case 'auth/weak-password':
      return 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
    case 'auth/network-request-failed':
      return 'Error de red. Verifica tu conexión a internet.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Intenta más tarde o restablece tu contraseña.';
    case 'auth/configuration-not-found':
      return 'Firebase Authentication no está habilitado en este proyecto. Actívalo en la consola de Firebase.';
    default:
      return 'Ocurrió un error inesperado al autenticar. Intenta nuevamente.';
  }
}

/**
 * Registra un nuevo usuario con correo, contraseña y nombre en Firebase Authentication.
 *
 * @async
 * @function registrarUsuario
 * @param {string} email - Correo institucional o personal del usuario.
 * @param {string} password - Contraseña (mínimo 6 caracteres).
 * @param {string} [nombre] - Nombre completo del usuario para actualizar el perfil.
 * @returns {Promise<import('firebase/auth').User>} Objeto del usuario creado.
 * @throws {Error} Con mensaje amigable si falla la operación.
 */
export async function registrarUsuario(email, password, nombre = '') {
  try {
    if (!email || !password) {
      throw new Error('Debes ingresar un correo y una contraseña.');
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    // Si se especificó nombre, se actualiza el perfil en Firebase Auth
    if (nombre.trim() && userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: nombre.trim(),
      });
    }

    return userCredential.user;
  } catch (error) {
    console.error('Error en registrarUsuario:', error.code, error.message);
    const mensajeAmigable = formatearErrorAuth(error.code);
    throw new Error(mensajeAmigable);
  }
}

/**
 * Inicia sesión con correo y contraseña.
 *
 * @async
 * @function iniciarSesion
 * @param {string} email - Correo registrado.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise<import('firebase/auth').User>} Objeto del usuario autenticado.
 * @throws {Error} Con mensaje amigable si las credenciales son inválidas.
 */
export async function iniciarSesion(email, password) {
  try {
    if (!email || !password) {
      throw new Error('Debes ingresar tu correo y contraseña.');
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    return userCredential.user;
  } catch (error) {
    console.error('Error en iniciarSesion:', error.code, error.message);
    const mensajeAmigable = formatearErrorAuth(error.code);
    throw new Error(mensajeAmigable);
  }
}

/**
 * Cierra la sesión activa del usuario en Firebase.
 *
 * @async
 * @function cerrarSesion
 * @returns {Promise<void>}
 * @throws {Error} Si ocurre un error al desconectar la sesión.
 */
export async function cerrarSesion() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error en cerrarSesion:', error);
    throw new Error('No se pudo cerrar la sesión. Intenta nuevamente.');
  }
}

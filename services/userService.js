/**
 * @file userService.js
 * @description Capa de servicios para la gestión de la colección 'users' en Cloud Firestore.
 * Implementa sincronización transparente (Lazy Migration / Auto-provisioning): si un usuario
 * ya existía en Firebase Authentication pero no tiene documento en Firestore, se genera
 * automáticamente al autenticarse o detectar su sesión.
 *
 * Cumplimiento de seguridad institucional:
 * - NUNCA almacena contraseñas (delegadas a los algoritmos con sal y hash de Firebase Auth).
 * - Centraliza los atributos institucionales del estudiante (rol, sede, institución).
 * @module services/userService
 */

import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

const COLECCION_USUARIOS = 'users';

/**
 * Obtiene el | de un usuario en Firestore o lo crea de manera automática si aún no existe
 * (estrategia para usuarios existentes previamente en Firebase Auth).
 *
 * @async
 * @function obtenerOCrearUsuario
 * @param {import('firebase/auth').User} firebaseUser - Objeto de usuario autenticado de Firebase Auth.
 * @param {Object} [datosIniciales={}] - Atributos opcionales iniciales (ej. nombre proveniente del formulario).
 * @returns {Promise<Object>} Datos normalizados del perfil en Firestore.
 */
export async function obtenerOCrearUsuario(firebaseUser, datosIniciales = {}) {
  if (!firebaseUser?.uid) {
    throw new Error('Se requiere un usuario autenticado válido con UID.');
  }

  const userDocRef = doc(db, COLECCION_USUARIOS, firebaseUser.uid);

  try {
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return {
        id: userDocSnap.id,
        ...userDocSnap.data(),
      };
    }

    // Si el documento no existe en Firestore (usuario actual o recién registrado), se crea automáticamente
    const nombreDefecto =
      datosIniciales.nombre?.trim() ||
      firebaseUser.displayName?.trim() ||
      firebaseUser.email?.split('@')[0] ||
      'Estudiante TdeA';

    const nuevoPerfil = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      nombre: nombreDefecto,
      rol: datosIniciales.rol || 'estudiante',
      institucion: 'Tecnológico de Antioquia',
      sede: 'Campus Robledo',
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    };

    await setDoc(userDocRef, nuevoPerfil);

    return {
      id: firebaseUser.uid,
      ...nuevoPerfil,
    };
  } catch (error) {
    console.error(`Error en obtenerOCrearUsuario para ${firebaseUser.uid}:`, error);
    // Retornamos un fallback en memoria para no romper la experiencia si hay problemas de red o reglas
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      nombre: firebaseUser.displayName || 'Estudiante TdeA',
      rol: 'estudiante',
      institucion: 'Tecnológico de Antioquia',
      sede: 'Campus Robledo',
    };
  }
}

/**
 * Consulta el perfil de un usuario en Firestore por su UID.
 *
 * @async
 * @function getUsuarioById
 * @param {string} uid - Identificador único de Firebase Auth.
 * @returns {Promise<Object|null>} Perfil del usuario o null si no existe.
 */
export async function getUsuarioById(uid) {
  if (!uid) return null;

  try {
    const userDocRef = doc(db, COLECCION_USUARIOS, uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return null;
    }

    return {
      id: userDocSnap.id,
      ...userDocSnap.data(),
    };
  } catch (error) {
    console.error(`Error al consultar perfil del usuario con UID ${uid}:`, error);
    return null;
  }
}

/**
 * Actualiza los datos del perfil de un usuario en Firestore.
 *
 * @async
 * @function actualizarPerfilUsuario
 * @param {string} uid - UID del usuario.
 * @param {Object} datosActualizados - Campos a actualizar.
 * @returns {Promise<void>}
 */
export async function actualizarPerfilUsuario(uid, datosActualizados) {
  if (!uid || !datosActualizados) return;

  try {
    const userDocRef = doc(db, COLECCION_USUARIOS, uid);
    await updateDoc(userDocRef, {
      ...datosActualizados,
      actualizadoEn: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error al actualizar perfil del usuario con UID ${uid}:`, error);
    throw new Error('No se pudo actualizar el perfil del usuario.');
  }
}

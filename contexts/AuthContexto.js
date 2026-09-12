/**
 * @file AuthContexto.js
 * @description Contexto global de React (Context API) para la gestión del estado de autenticación.
 * Escucha en tiempo real los cambios de sesión con onAuthStateChanged y expone los métodos
 * login, register, logout y el objeto user a cualquier componente o pantalla.
 * @module contexts/AuthContexto
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import {
  iniciarSesion,
  registrarUsuario,
  cerrarSesion,
} from '../services/authService';
import { obtenerOCrearUsuario } from '../services/userService';

/**
 * Contexto de autenticación.
 */
export const AuthContexto = createContext({
  user: null,
  perfil: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  recargarPerfil: async () => {},
});

/**
 * Hook personalizado para consumir el contexto de autenticación en cualquier parte del árbol de componentes.
 * @returns {{ user: import('firebase/auth').User|null, perfil: Object|null, loading: boolean, login: Function, register: Function, logout: Function, recargarPerfil: Function }}
 */
export function useAuth() {
  const context = useContext(AuthContexto);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}

/**
 * Proveedor del contexto de autenticación.
 * Envuelve la aplicación para mantener el estado de sesión persistente con AsyncStorage.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos.
 * @returns {React.JSX.Element}
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sincroniza el documento en Firestore para usuarios existentes o nuevos (Forma A)
  const sincronizarPerfil = async (usuarioAuth, datosExtra = {}) => {
    if (!usuarioAuth) {
      setPerfil(null);
      return null;
    }
    try {
      const perfilObtenido = await obtenerOCrearUsuario(usuarioAuth, datosExtra);
      setPerfil(perfilObtenido);
      return perfilObtenido;
    } catch (err) {
      console.error('Error sincronizando perfil en AuthProvider:', err);
      return null;
    }
  };

  // Escuchar cambios de estado en Firebase Auth (Login, Logout, Persistencia en AsyncStorage)
  useEffect(() => {
    const desuscribir = onAuthStateChanged(auth, async (usuarioActual) => {
      setUser(usuarioActual);
      if (usuarioActual) {
        await sincronizarPerfil(usuarioActual);
      } else {
        setPerfil(null);
      }
      setLoading(false);
    });

    // Limpieza de suscripción al desmontar
    return () => desuscribir();
  }, []);

  /**
   * Inicia sesión y actualiza el estado global sincronizando su perfil.
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const usuario = await iniciarSesion(email, password);
      setUser(usuario);
      await sincronizarPerfil(usuario);
      return usuario;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registra un nuevo usuario y sincroniza su perfil inicial en Firestore.
   */
  const register = async (email, password, nombre) => {
    setLoading(true);
    try {
      const nuevoUsuario = await registrarUsuario(email, password, nombre);
      setUser(nuevoUsuario);
      await sincronizarPerfil(nuevoUsuario, { nombre });
      return nuevoUsuario;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cierra la sesión activa y limpia los estados.
   */
  const logout = async () => {
    setLoading(true);
    try {
      await cerrarSesion();
      setUser(null);
      setPerfil(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Permite forzar la recarga del perfil desde Firestore.
   */
  const recargarPerfil = async () => {
    if (user) {
      return await sincronizarPerfil(user);
    }
    return null;
  };

  const valor = {
    user,
    perfil,
    loading,
    login,
    register,
    logout,
    recargarPerfil,
  };

  return (
    <AuthContexto.Provider value={valor}>
      {children}
    </AuthContexto.Provider>
  );
}


// ============================================================================
// CAPA: SERVICIO (puente entre el Modelo/Firebase y el VistaModelo)
// ----------------------------------------------------------------------------
// Este archivo encapsula todas las operaciones de autenticación contra
// Firebase. Es intencionalmente "tonto": no maneja estado de React ni sabe
// nada de pantallas. Su única responsabilidad es traducir las llamadas al
// SDK de Firebase en funciones simples con una respuesta uniforme
// `{ success, ... }`, y traducir los códigos de error técnicos de Firebase a
// mensajes en español entendibles por el usuario final.
//
// En MVVM, este servicio es consumido por el VistaModelo (userContext.js),
// que expone sus resultados como estado reactivo a las Vistas (pantallas).
// Las Vistas nunca deberían importar este archivo directamente sin pasar por
// el contexto, salvo casos puntuales como loginScreen/registerScreen que lo
// usan para mantener su propio estado local de carga/error de formulario.
// ============================================================================
import { auth } from '../config/fbConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';

// Diccionario que traduce los códigos de error internos de Firebase Auth
// a mensajes legibles para el usuario. Mantenerlo centralizado evita repetir
// esta lógica en cada pantalla que use autenticación.
const errorMessages = {
  'auth/user-not-found': 'No existe una cuenta con este correo.',
  'auth/wrong-password': 'Contraseña incorrecta.',
  'auth/invalid-email': 'El correo electrónico no es válido.',
  'auth/email-already-in-use': 'Ya existe una cuenta con este correo.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
  'auth/network-request-failed': 'Error de conexión. Verifica tu internet.',
  'auth/invalid-credential': 'Credenciales inválidas. Verifica tus datos.',
};

// Obtiene el mensaje amigable correspondiente a un código de error de
// Firebase; si no existe una traducción específica, retorna un mensaje
// genérico para no dejar a la Vista sin feedback.
const getErrorMessage = (errorCode) => {
  return errorMessages[errorCode] || 'Ocurrió un error. Intenta de nuevo.';
};

// Registra un nuevo usuario en Firebase Auth y completa su perfil
// (nombre completo y teléfono). Devuelve un objeto uniforme para que el
// VistaModelo/Vista no tenga que manejar excepciones try/catch propias.
export const registerUser = async (email, password, name, lastName, phone) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    
    await updateProfile(userCredential.user, {
      displayName: `${name} ${lastName}`,
      phoneNumber: phone,
    });
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { 
      success: false, 
      error: getErrorMessage(error.code) 
    };
  }
};

// Inicia sesión con correo y contraseña. El cambio de sesión resultante es
// detectado automáticamente por el listener `onAuthStateChanged` en
// userContext.js, que actualizará el estado global del usuario.
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { 
      success: false, 
      error: getErrorMessage(error.code) 
    };
  }
};

// Cierra la sesión activa. Al igual que el login, el cambio se propaga
// automáticamente al VistaModelo mediante el listener de Firebase Auth.
export const logoutUser = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: getErrorMessage(error.code) 
    };
  }
};

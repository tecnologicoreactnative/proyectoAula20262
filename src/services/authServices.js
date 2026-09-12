import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { auth,// auth: servicio de autenticación (registro, login, logout)
    db } // db: instancia de Firestore (lectura y escritura de documentos)
    from "../config/firebaseConfig";

import { doc, // doc: apunta a un documento concreto
    setDoc, //setDoc: lo escribe
    serverTimestamp } //serverTimestamp: la hora la pone el servidor, no el celular
    from "firebase/firestore";

// Registra un usuario en Firebase Authentication y guarda sus datos en Firestore.
export async function registrar(name, email, password) {
    // Crea la cuenta usando el correo y la contraseña recibidos.
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Crea un documento en la colección "users" usando el UID como identificador.
    await setDoc(doc(db, "users", userCredential.user.uid), {
        // Guarda el UID para identificar al usuario dentro de la aplicación.
        uid: userCredential.user.uid,
        // Guarda el nombre asociado a la cuenta.
        name: name,
        // Guarda el correo electrónico del usuario.
        email: email,
        // Genera la fecha de creación desde el servidor de Firestore.
        createdAt: serverTimestamp(),
    });

    // Devuelve el usuario recién registrado.
    return userCredential.user;
}

// Inicia sesión con el correo y la contraseña proporcionados.
export function iniciarSesion(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

// Cierra la sesión del usuario actualmente autenticado.
export function cerrarSesion() {
    return signOut(auth);
}

// Convierte códigos de error de Firebase en mensajes comprensibles para el usuario.
export function mensajeError(error) {
    const mensajeError={
        "auth/email-already-in-use": "El correo ya está en uso",
        "auth/invalid-email": "El correo no es válido",
        "auth/weak-password": "La contraseña es muy débil",
        "auth/user-not-found": "El usuario no existe",
        "auth/wrong-password": "La contraseña es incorrecta",
        "auth/too-many-requests": "Demasiados intentos fallidos. Intenta más tarde",
        "auth/network-request-failed": "Error de red. Verifica tu conexión a internet",
        "auth/invalid-password": "Contraseña inválida. Intenta de nuevo",
        "auth/invalid-credential": "Correo o contraseña inválidos. Intenta de nuevo"
    }
    // Relaciona cada código de Firebase con su mensaje en español.
    // Devuelve el mensaje correspondiente o uno genérico si el código no está registrado.
    return mensajeError[error.code] || "Ocurrió un error. Intente nuevamente";
}
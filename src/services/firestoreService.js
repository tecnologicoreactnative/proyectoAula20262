// ============================================================================
// CAPA: SERVICIO (acceso al Modelo de datos de negocio en Firestore)
// ----------------------------------------------------------------------------
// Este archivo es el "repositorio" de la app: centraliza todas las
// operaciones CRUD y de suscripción en tiempo real contra las colecciones
// `articulos` y `prestamos` de Firestore. Ninguna Vista debería construir
// queries de Firestore por su cuenta; siempre debe hacerlo a través de estas
// funciones, para que la lógica de negocio (por ejemplo, descontar/restaurar
// stock al crear o devolver un préstamo) esté en un solo lugar y sea
// reutilizable desde cualquier pantalla o VistaModelo.
// ============================================================================
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/fbConfig";

// ---------------------------------------------------------------------------
// Artículos: representan el inventario del laboratorio (Modelo de dominio).
// ---------------------------------------------------------------------------

// Crea un artículo nuevo en la colección `articulos`, añadiendo marcas de
// tiempo de creación/actualización automáticas.
export const createArticle = async (articleData) => {
  try {
    const docRef = await addDoc(collection(db, "articulos"), {
      ...articleData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { id: docRef.id, ...articleData };
  } catch (error) {
    console.error("Error creando el artículo:", error);
    throw error;
  }
};

// Obtiene artículos aplicando filtros opcionales (categoría, disponibilidad).
// Se usa para cargas puntuales (no reactivas); para listas en vivo se usa
// `subscribeToArticles` más abajo.
export const getArticles = async (filters = {}) => {
  try {
    let q = collection(db, "articulos");

    if (filters.category) {
      q = query(q, where("categoria", "==", filters.category));
    }

    if (filters.available) {
      q = query(q, where("stock", ">", 0));
    }

    q = query(q, orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error al obtener artículos:", error);
    throw error;
  }
};

// Obtiene un único artículo por su ID, usado por ejemplo al abrir el detalle.
export const getArticle = async (articleId) => {
  try {
    const docRef = doc(db, "articulos", articleId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error("Artículo no encontrado");
  } catch (error) {
    console.error("Error al obtener artículo:", error);
    throw error;
  }
};

// Actualiza campos de un artículo existente (por ejemplo, su stock o datos).
export const updateArticle = async (articleId, updates) => {
  try {
    const docRef = doc(db, "articulos", articleId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error al actualizar artículo:", error);
    throw error;
  }
};

// Elimina un artículo de forma permanente.
export const deleteArticle = async (articleId) => {
  try {
    await deleteDoc(doc(db, "articulos", articleId));
  } catch (error) {
    console.error("Error al eliminar artículo:", error);
    throw error;
  }
};

// ---------------------------------------------------------------------------
// Préstamos: representan la relación usuario-artículo en el tiempo
// (otra entidad clave del Modelo de dominio).
// ---------------------------------------------------------------------------

// Crea un préstamo y, como parte de la misma operación de negocio,
// descuenta la cantidad solicitada del stock del artículo relacionado.
// Mantener esta regla aquí (y no en la Vista) evita inconsistencias de datos.
export const createLoan = async (loanData) => {
  try {
    const docRef = await addDoc(collection(db, "prestamos"), {
      ...loanData,
      estado: "activo",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Actualizar stock del artículo
    const articleRef = doc(db, "articulos", loanData.articuloId);
    const articleSnap = await getDoc(articleRef);
    if (articleSnap.exists()) {
      await updateDoc(articleRef, {
        stock: articleSnap.data().stock - loanData.cantidad,
        updatedAt: new Date(),
      });
    }

    return { id: docRef.id, ...loanData };
  } catch (error) {
    console.error("Error al crear préstamo:", error);
    throw error;
  }
};

// Obtiene préstamos, opcionalmente filtrados por usuario. Se usa para
// consultas puntuales; las pantallas que necesitan datos en vivo usan
// `subscribeToLoans`.
export const getLoans = async (userId) => {
  try {
    let q = collection(db, "prestamos");

    if (userId) {
      q = query(q, where("userId", "==", userId));
    }

    q = query(q, orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error al obtener préstamos:", error);
    throw error;
  }
};

// Obtiene el detalle de un préstamo específico por su ID.
export const getLoan = async (loanId) => {
  try {
    const docRef = doc(db, "prestamos", loanId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error("Préstamo no encontrado");
  } catch (error) {
    console.error("Error al obtener préstamo:", error);
    throw error;
  }
};

// Actualiza campos arbitrarios de un préstamo (por ejemplo, cambiar su
// estado a "sancionado").
export const updateLoan = async (loanId, updates) => {
  try {
    const docRef = doc(db, "prestamos", loanId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error al actualizar préstamo:", error);
    throw error;
  }
};

// Marca un préstamo como devuelto y, en la misma operación de negocio,
// restaura el stock del artículo (operación inversa a `createLoan`).
export const returnLoan = async (loanId) => {
  try {
    const loanRef = doc(db, "prestamos", loanId);
    const loanSnap = await getDoc(loanRef);

    if (loanSnap.exists()) {
      const loanData = loanSnap.data();

      // Actualizar estado del préstamo
      await updateDoc(loanRef, {
        estado: "devuelto",
        fechaDevolucion: new Date(),
        updatedAt: new Date(),
      });

      // Devolver stock al artículo
      const articleRef = doc(db, "articulos", loanData.articuloId);
      const articleSnap = await getDoc(articleRef);
      if (articleSnap.exists()) {
        await updateDoc(articleRef, {
          stock: articleSnap.data().stock + loanData.cantidad,
          updatedAt: new Date(),
        });
      }
    }
  } catch (error) {
    console.error("Error al devolver préstamo:", error);
    throw error;
  }
};

// Elimina un préstamo del historial de forma permanente.
export const deleteLoan = async (loanId) => {
  try {
    await deleteDoc(doc(db, "prestamos", loanId));
  } catch (error) {
    console.error("Error al eliminar préstamo:", error);
    throw error;
  }
};

// ---------------------------------------------------------------------------
// Suscripciones en tiempo real (onSnapshot): son la pieza clave que conecta
// el Modelo (Firestore) con el VistaModelo/Vista de forma reactiva. Cada vez
// que cambian los datos en el servidor, `callback` se ejecuta de nuevo y la
// Vista que lo consume (via `useState`/`useEffect`) se vuelve a renderizar
// automáticamente sin necesidad de refrescar manualmente.
// ---------------------------------------------------------------------------

// Suscripción en tiempo real para préstamos
export const subscribeToLoans = (userId, callback) => {
  let q = collection(db, "prestamos");

  if (userId) {
    q = query(q, where("userId", "==", userId));
  }

  return onSnapshot(q, (snapshot) => {
    const loans = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(loans);
  });
};

// Suscripción en tiempo real para artículos
export const subscribeToArticles = (callback) => {
  const q = collection(db, "articulos");

  return onSnapshot(
    q,
    (snapshot) => {
      const articles = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(articles);
    },
    (error) => {
      console.error("Error al suscribirse a artículos:", error);
      callback([]);
    },
  );
};

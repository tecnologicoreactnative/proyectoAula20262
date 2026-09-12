// src/services/catalogoService.js
// Consultas al catálogo de productos en Firestore.
//
// Estructura sugerida del documento en la colección "productos":
// {
//   nombre: string,
//   descripcion: string,
//   precio: number,
//   unidad: string,          // ej: "libra", "unidad", "bulto"
//   disponibilidad: number,  // cantidad disponible
//   categoria: string,
//   productor: string,
//   imagenUrl: string,
//   activo: boolean
// }
// src/services/catalogoService.js

import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where
} from "firebase/firestore";

import { db } from "./firebaseConfig";

/**
 * Trae todos los productos activos del catálogo.
 */
export async function obtenerCatalogo() {

  const q = query(
    collection(db, "Productos"),
    where("activo", "==", true)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  }));
}


/**
 * Trae el detalle de un producto por su id.
 */
export async function obtenerProducto(productoId) {

  const ref = doc(
    db,
    "Productos",
    productoId
  );

  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error(
      "El producto ya no existe en el catálogo."
    );
  }

  return {
    id: snap.id,
    ...snap.data()
  };
}
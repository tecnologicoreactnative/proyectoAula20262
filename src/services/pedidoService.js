// src/services/pedidoService.js
// Creación de pedidos en Firestore.
//
// Estructura del documento en la colección "pedidos":
// {
//   usuarioId: string,
//   items: [{ productoId, nombre, precio, cantidad, unidad }],
//   total: number,
//   estado: "recibido" | "en_preparacion" | "listo" | "entregado" | "cancelado",
//   creadoEn: timestamp
// }
//
// Nota para el segundo/tercer entregable: aquí es donde debe entrar
// runTransaction() para descontar inventario de forma atómica y evitar
// que dos usuarios compren el último producto disponible al mismo tiempo.

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { obtenerProducto } from "./catalogoService";

/**
 * Valida disponibilidad de cada item del carrito contra el catálogo vigente
 * antes de confirmar el pedido.
 */
export async function validarDisponibilidad(items) {
  const errores = [];

  for (const item of items) {
    const productoActual = await obtenerProducto(item.productoId);
    if (productoActual.disponibilidad < item.cantidad) {
      errores.push(
        `"${productoActual.nombre}" solo tiene ${productoActual.disponibilidad} ${productoActual.unidad} disponibles.`
      );
    }
  }

  return errores;
}

/**
 * Confirma el pedido: valida disponibilidad y lo guarda en Firestore.
 */
export async function confirmarPedido({ usuarioId, items }) {
  const errores = await validarDisponibilidad(items);
  if (errores.length > 0) {
    throw new Error(errores.join(" "));
  }

  const total = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const pedidoRef = await addDoc(collection(db, "pedidos"), {
    usuarioId,
    items,
    total,
    estado: "recibido",
    creadoEn: serverTimestamp(),
  });

  return { id: pedidoRef.id, total };
}

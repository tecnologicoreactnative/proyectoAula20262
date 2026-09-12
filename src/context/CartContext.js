// src/context/CartContext.js
// Carrito en memoria para el primer entregable.
//
// A partir del segundo entregable, este estado debe persistirse con
// AsyncStorage o expo-sqlite para que el pedido sobreviva al cierre de la app
// (requisito de modo offline). Por ahora vive solo en memoria.

import React, { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // { productoId, nombre, precio, unidad, cantidad }

  function agregarProducto(producto, cantidad = 1) {
    setItems((prev) => {
      const existente = prev.find((i) => i.productoId === producto.id);
      if (existente) {
        return prev.map((i) =>
          i.productoId === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i
        );
      }
      return [
        ...prev,
        {
          productoId: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          unidad: producto.unidad,
          cantidad,
        },
      ];
    });
  }

  function actualizarCantidad(productoId, cantidad) {
    if (cantidad <= 0) {
      quitarProducto(productoId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productoId === productoId ? { ...i, cantidad } : i))
    );
  }

  function quitarProducto(productoId) {
    setItems((prev) => prev.filter((i) => i.productoId !== productoId));
  }

  function vaciarCarrito() {
    setItems([]);
  }

  const total = useMemo(
    () => items.reduce((acc, item) => acc + item.precio * item.cantidad, 0),
    [items]
  );

  const value = {
    items,
    total,
    agregarProducto,
    actualizarCantidad,
    quitarProducto,
    vaciarCarrito,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}

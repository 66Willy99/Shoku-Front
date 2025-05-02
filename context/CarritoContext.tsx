import React, { createContext, useContext, useState, ReactNode } from 'react';

// Tipo del producto (puedes expandir esto después con { nombre, precio, etc. })
type Producto = string;

// Tipo del contexto del carrito
interface CarritoContextType {
  carrito: Producto[];
  agregarProducto: (producto: Producto) => void;
  limpiarCarrito: () => void;
}

// Creamos el contexto, con tipo explícito
const CarritoContext = createContext<CarritoContextType | null>(null);

// Proveedor del contexto
export const CarritoProvider = ({ children }: { children: ReactNode }) => {
  const [carrito, setCarrito] = useState<Producto[]>([]);

  const agregarProducto = (producto: Producto) => {
    setCarrito((prev) => [...prev, producto]);
  };

  const limpiarCarrito = () => {
    setCarrito([]);
  };

  return (
    <CarritoContext.Provider value={{ carrito, agregarProducto, limpiarCarrito }}>
      {children}
    </CarritoContext.Provider>
  );
};

// Hook para usar el carrito desde cualquier componente
export const useCarrito = (): CarritoContextType => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe usarse dentro de un CarritoProvider');
  }
  return context;
};

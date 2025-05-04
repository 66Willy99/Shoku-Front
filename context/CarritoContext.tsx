// context/CarritoContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Producto = string;

interface CarritoContextType {
  carrito: Producto[];
  agregarProducto: (p: Producto) => void;
  limpiarCarrito: () => void;
}

const CarritoContext = createContext<CarritoContextType | null>(null);

export const CarritoProvider = ({ children }: { children: ReactNode }) => {
  const [carrito, setCarrito] = useState<Producto[]>([]);

  const agregarProducto = (p: Producto) => setCarrito(prev => [...prev, p]);
  const limpiarCarrito  = () => setCarrito([]);

  return (
    <CarritoContext.Provider value={{ carrito, agregarProducto, limpiarCarrito }}>
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  return ctx;
};

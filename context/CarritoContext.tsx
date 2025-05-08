// context/CarritoContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useMenu, Dish } from './MenuContext';  // importamos useMenu y el tipo Dish

export type CartItem = {
  name: string;
  price: number;
  quantity: number;
};

type CarritoContextType = {
  carrito: CartItem[];
  notes: string;
  setNotes: (text: string) => void;
  agregarProducto: (name: string) => void;
  removeProducto: (name: string) => void;
  limpiarCarrito: () => void;
};

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export const CarritoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const menu = useMenu();
  const allDishes: Dish[] = Object.values(menu).flat();

  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const [notes, setNotes]      = useState<string>('');

  const agregarProducto = (name: string) => {
    // Buscamos el plato en el menú para tomar su precio
    const dish = allDishes.find(d => d.name === name);
    if (!dish) return;

    setCarrito(prev => {
      const idx = prev.findIndex(i => i.name === name);
      if (idx >= 0) {
        // Si ya existe, aumentamos cantidad
        const copy = [...prev];
        copy[idx].quantity += 1;
        return copy;
      }
      // Si no existe, agregamos nuevo con cantidad 1
      return [...prev, { name, price: dish.price, quantity: 1 }];
    });
  };

  const removeProducto = (name: string) => {
    setCarrito(prev => prev.filter(i => i.name !== name));
  };

  const limpiarCarrito = () => {
    setCarrito([]);
    setNotes('');
  };

  return (
    <CarritoContext.Provider
      value={{ carrito, notes, setNotes, agregarProducto, removeProducto, limpiarCarrito }}
    >
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  return ctx;
};

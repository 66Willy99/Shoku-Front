// context/CarritoContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useMenu, Dish } from './MenuContext';

// ✅ 2. 'CartItem' estandarizado para usar el objeto 'Dish' completo
export type CartItem = {
  dish: Dish;
  quantity: number;
};

type CarritoContextType = {
  carrito: CartItem[];
  notes: string;
  total: number; // Agregado para fácil acceso
  setNotes: (text: string) => void;
  agregarProducto: (name: string) => void;
  removeProducto: (name: string) => void;
  limpiarCarrito: () => void;
};

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export const CarritoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { platos } = useMenu(); // Usamos 'platos' que es el array de Dish

  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState<string>('');

  const agregarProducto = (name: string) => {
    // Buscamos el plato en la lista de platos del menú
    const dish = platos.find(d => d.name === name);
    if (!dish) return;

    setCarrito(prev => {
      const existingItem = prev.find(i => i.dish.name === name);
      if (existingItem) {
        // Si ya existe, aumentamos cantidad
        return prev.map(item =>
          item.dish.name === name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Si no existe, agregamos el nuevo item con el objeto 'dish' completo
      return [...prev, { dish, quantity: 1 }];
    });
  };

  const removeProducto = (name: string) => {
    setCarrito(prev => prev.filter(i => i.dish.name !== name));
  };

  const limpiarCarrito = () => {
    setCarrito([]);
    setNotes('');
  };

  // Calcular el total
  const total = carrito.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);

  return (
    <CarritoContext.Provider
      value={{ carrito, notes, total, setNotes, agregarProducto, removeProducto, limpiarCarrito }}
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
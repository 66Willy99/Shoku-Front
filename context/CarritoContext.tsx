// context/CarritoContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  ReactNode
} from 'react';

export interface CartItem {
  name:     string;
  price:    number;
  quantity: number;
}

interface CarritoContextType {
  carrito:     CartItem[];
  notes:       string;
  setNotes:    (n: string) => void;
  agregarProducto: (name: string) => void;
  limpiarCarrito:  () => void;
}

const PRICE_LIST: Record<string, number> = {
  'Pasta Boloñesa': 8990,
  'Pasta Carbonara': 7990,
  Lasaña: 9500,
  Canelones: 9200,
  'Sándwich mixto': 4990,
  'Sándwich vegetal': 4490,
  'Bocadillo de jamón': 3990,
  'Bocadillo de tortilla': 3790,
  'Ensalada César': 5500,
  'Ensalada de Quesos': 6000,
  'Ensalada Mixta': 5200,
  'Ensalada de Verano': 5800,
};

const CarritoContext = createContext<CarritoContextType | null>(null);

export const CarritoProvider = ({ children }: { children: ReactNode }) => {
  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const [notes, setNotes]     = useState<string>('');

  const agregarProducto = (name: string) => {
    setCarrito(prev => {
      const idx = prev.findIndex(i => i.name === name);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].quantity += 1;
        return copy;
      }
      return [...prev, { name, price: PRICE_LIST[name] ?? 0, quantity: 1 }];
    });
  };

  const limpiarCarrito = () => {
    setCarrito([]);
    setNotes('');
  };

  return (
    <CarritoContext.Provider
      value={{ carrito, notes, setNotes, agregarProducto, limpiarCarrito }}
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

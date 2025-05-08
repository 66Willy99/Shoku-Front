// context/MenuContext.tsx

import React, { createContext, ReactNode, useContext } from 'react';

// ▶️ Exportamos el tipo Dish para que otros contextos lo puedan usar
export type Dish = {
  name: string;
  price: number;
};

// Definición inicial de tu menú — ajusta nombres y precios según quieras
const initialMenu: Record<string, Dish[]> = {
  Pastas: [
    { name: 'Pasta Carbonara', price: 8000 },
    { name: 'Pasta Boloñesa', price: 7500 },
  ],
  Ensaladas: [
    { name: 'Ensalada César', price: 6000 },
    { name: 'Ensalada Mixta', price: 5500 },
  ],
  Bocadillos: [
    { name: 'Sándwich mixto', price: 4000 },
    { name: 'Bocadillo de jamón', price: 4200 },
  ],
};

const MenuContext = createContext<typeof initialMenu>(initialMenu);

export const MenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
  <MenuContext.Provider value={initialMenu}>
    {children}
  </MenuContext.Provider>
);

export const useMenu = () => useContext(MenuContext);

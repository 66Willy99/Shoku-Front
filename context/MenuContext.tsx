// context/MenuContext.tsx

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import API_URL from '../lib/api';

// Tipo de plato
export type Dish = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

// Tipo del contexto
type MenuContextType = {
  platos: Dish[];
  setPlatos: (menu: Dish[]) => void;
};

// Crear contexto con valores por defecto
const MenuContext = createContext<MenuContextType>({
  platos: [],
  setPlatos: () => {},
});

// Proveedor del contexto
export const MenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const restauranteId = "-OOGlNS6j9ldiKwPB6zX";
  const userId = "qvTOrKKcnsNQfGQ5dd59YPm4xNf2";

  const [platos, setPlatos] = useState<Dish[]>([]);

  const fetchMenu = async () => {
    try {
      const res = await axios.get(`${API_URL}/platos/`, {
        params: {
          user_id: userId,
          restaurante_id: restauranteId,
        },
      });

      console.log("📦 Respuesta del backend:", res.data);

      if (res.data && typeof res.data.platos === 'object') {
        const mappedDishes: Dish[] = Object.entries(res.data.platos).map(
          ([key, item]: [string, any]) => ({
            id: key,
            name: item.nombre,
            price: item.precio,
            description: item.descripcion,
          })
        );
        setPlatos(mappedDishes);
      } else {
        console.warn("⚠️ La propiedad 'platos' no es un objeto válido:", res.data);
      }
    } catch (error) {
      console.error("❌ Error al obtener los platos:", error);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  return (
    <MenuContext.Provider value={{ platos, setPlatos }}>
      {children}
    </MenuContext.Provider>
  );
};

// Hook para acceder fácilmente al contexto
export const useMenu = () => useContext(MenuContext);

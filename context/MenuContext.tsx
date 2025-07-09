// context/MenuContext.tsx

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { Config } from '@/constants/config';

// Tipo de plato
export type Dish = {
  id: string;
  name: string;
  price: number;
  description?: string;
  imagenUrl?: string[]; // URLs de las imágenes
  image?: string; // URL principal de la imagen para compatibilidad
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
      const res = await axios.get(`${Config.API_URL}/platos/`, {
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
            imagenUrl: item.imagenUrl || [],
            image: item.imagenUrl && item.imagenUrl[0] ? item.imagenUrl[0] : undefined,
          })
        );
        console.log("🖼️ Platos con imágenes:", mappedDishes);
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

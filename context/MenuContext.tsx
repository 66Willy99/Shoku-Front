// context/MenuContext.tsx

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import API_URL from '../lib/api';

// El tipo Dish se mantiene, ya que el resultado final del mapeo es el mismo.
export type Dish = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

type MenuContextType = {
  platos: Dish[];
};

const MenuContext = createContext<MenuContextType>({
  platos: [],
});

export const MenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const restauranteId = "-OOGlNS6j9ldiKwPB6zX";
  const userId = "qvTOrKKcnsNQfGQ5dd59YPm4xNf2";

  const [platos, setPlatos] = useState<Dish[]>([]);

  // ▼▼▼ FUNCIÓN fetchMenu ACTUALIZADA CON TU NUEVO CÓDIGO ▼▼▼
  const fetchMenu = async () => {
    try {
      const res = await axios.get(`${API_URL}/platos/`, {
        params: {
          user_id: userId,
          restaurante_id: restauranteId,
        },
      });

      // Log para depurar la respuesta exacta del backend
      console.log("Respuesta del backend:", res.data);

      // La nueva lógica espera un objeto que contiene una propiedad 'platos' que también es un objeto.
      if (res.data && typeof res.data.platos === 'object') {
        const mappedDishes: Dish[] = Object.entries(res.data.platos).map(([key, item]: [string, any]) => ({
          id: key, // La clave del objeto se usa como ID
          name: item.nombre,
          price: item.precio,
          description: item.descripcion,
        }));
        setPlatos(mappedDishes);
      } else {
        // Advertencia si la estructura de datos no es la esperada
        console.warn("La propiedad 'platos' no es un objeto válido:", res.data);
      }

    } catch (error) {
      console.error("Error al obtener los platos:", error);
    }
  };
  // ▲▲▲ FIN DE LA ACTUALIZACIÓN ▲▲▲

  useEffect(() => {
    fetchMenu();
  }, []);

  return (
    <MenuContext.Provider value={{ platos }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => useContext(MenuContext);
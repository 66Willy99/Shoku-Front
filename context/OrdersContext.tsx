// context/OrdersContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';
import { Config } from '@/constants/config';

function generateShortId(): string {
  return Math.random().toString(36).substring(2, 12).toUpperCase();
}

export type Order = {
  user_id: string;
  restaurante_id: string;
  mesa_id: string;
  silla_id: string;
  platos: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  detalle: string;
  estado_actual?: string;
  status?: string;
  created_at?: string;
  estimatedTime?: number;
  notes?: string;
  paid?: boolean; // auxiliar, usado en frontend para mostrar pasos
};

type NewOrder = {
  user_id: string;
  restaurante_id: string;
  mesa_id: string;
  silla_id: string;
  platos: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  detalle: string;
};

type OrdersContextType = {
  orders: Order[];
  addOrder: (orderData: NewOrder) => Promise<string>;
  markAsPaid: (orderId: string) => Promise<void>;
};

const OrdersContext = createContext<OrdersContextType>({
  orders: [],
  addOrder: async () => '',
  markAsPaid: async () => {},
});

export const OrdersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = async (orderData: NewOrder): Promise<string> => {
    try {
      const platosBackendFormat: Record<string, { cantidad: number }> = {};
      orderData.platos.forEach((plato) => {
        platosBackendFormat[plato.id] = { cantidad: plato.quantity };
      });

      const payload = {
        user_id: orderData.user_id,
        restaurante_id: orderData.restaurante_id,
        mesa_id: orderData.mesa_id,
        silla_id: orderData.silla_id,
        platos: platosBackendFormat,
        detalle: orderData.detalle,
      };

      console.log('🛒 Enviando pedido al backend:', payload);

      const response = await axios.post(`${Config.API_URL}/pedido/`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Extraer el pedido_id del response
      const { pedido_id } = response.data;
      
      if (!pedido_id) {
        throw new Error('El backend no retornó un pedido_id válido');
      }

      console.log('✅ Pedido creado con ID:', pedido_id);

      const newOrder: Order = {
        user_id: orderData.user_id,
        restaurante_id: orderData.restaurante_id,
        mesa_id: orderData.mesa_id,
        silla_id: orderData.silla_id,
        platos: orderData.platos,
        detalle: orderData.detalle,
        notes: orderData.detalle,
        estado_actual: 'confirmado',
        status: 'confirmado',
        created_at: new Date().toISOString(),
        estimatedTime: 15,
        // 🚫 No incluir paid aquí, solo se setea dinámicamente desde el backend o estado.tsx
      };

      setOrders((prev) => [...prev, newOrder]);
      console.log('✅ Pedido creado exitosamente:', newOrder);
      
      // Retornar el pedido_id real del backend en lugar del generado localmente
      return pedido_id;
    } catch (err: any) {
      console.error('❌ Error al crear el pedido:', err.response?.data || err.message);
      throw err;
    }
  };

  // Este método ya no se usa en la lógica actual
  const markAsPaid = async (_orderId: string) => {
    // vacío
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder, markAsPaid }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => useContext(OrdersContext);

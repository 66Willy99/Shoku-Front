// context/OrdersContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';
import { Config } from '@/constants/config';

export type Order = {
  id: string;
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
  paid: boolean;
  status?: string;
  created_at?: string;
  estimatedTime?: number;
  notes?: string;
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

      const res = await axios.post(`${Config.API_URL}/pedido/`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      const orderId = String(res.data?.id ?? res.data ?? crypto.randomUUID());

      const newOrder: Order = {
        id: orderId,
        user_id: orderData.user_id,
        restaurante_id: orderData.restaurante_id,
        mesa_id: orderData.mesa_id,
        silla_id: orderData.silla_id,
        platos: orderData.platos,
        detalle: orderData.detalle,
        notes: orderData.detalle,
        paid: false,
        status: 'confirmado',
        created_at: new Date().toISOString(),
        estimatedTime: 15,
      };

      setOrders((prev) => [...prev, newOrder]);
      console.log('✅ Pedido creado exitosamente:', newOrder);
      return orderId;
    } catch (err: any) {
      console.error('❌ Error al crear el pedido:', err.response?.data || err.message);
      throw err;
    }
  };

  const markAsPaid = async (orderId: string) => {
    try {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, paid: true } : order
        )
      );
      console.log(`✅ Pedido ${orderId} marcado como pagado.`);
    } catch (err) {
      console.error(`❌ Error al marcar el pedido ${orderId} como pagado:`, err);
      throw err;
    }
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder, markAsPaid }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => useContext(OrdersContext);

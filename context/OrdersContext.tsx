import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';
import API_URL from '../lib/api';
import { CartItem } from './CarritoContext';

export type Order = {
  id: string;
  mesa_id: string;
  silla_id: string;
  items: CartItem[];
  notes?: string;
  paid: boolean;
  tipIncluded?: boolean;
  estimatedTime?: number;
  status?: string;
  created_at?: string;
};

type NewOrder = {
  mesa_id: string;
  silla_id: string;
  items: CartItem[];
  notes?: string;
  tipIncluded?: boolean;
  estimatedTime?: number;
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

  const addOrder = async ({
    mesa_id,
    silla_id,
    items,
    notes,
    tipIncluded,
    estimatedTime,
  }: NewOrder): Promise<string> => {
    try {
      const platos: Record<string, { precio: number; cantidad: number }> = {};
      items.forEach((item) => {
        platos[item.dish.id] = {
          precio: item.dish.price,
          cantidad: item.quantity,
        };
      });

      const payload = {
        user_id: 'qvTOrKKcnsNQfGQ5dd59YPm4xNf2',
        restaurante_id: '-OOGlNS6j9ldiKwPB6zX',
        mesa_id,
        silla_id,
        platos,
        detalle: notes ?? '',
      };

      console.log('🛒 Enviando pedido al backend:', payload);

      const res = await axios.post(`${API_URL}/pedido/`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const newOrder: Order = {
        id: res.data?.id ?? crypto.randomUUID(),
        mesa_id,
        silla_id,
        items,
        notes,
        paid: false,
        tipIncluded,
        estimatedTime,
      };

      setOrders((prev) => [...prev, newOrder]);
      console.log('✅ Pedido creado exitosamente:', newOrder);
      return newOrder.id;
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

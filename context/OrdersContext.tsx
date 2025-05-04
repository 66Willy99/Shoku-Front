import React, { createContext, useContext, useState, ReactNode } from 'react';

export type OrderStatus = 'pendiente' | 'preparando' | 'listo';
export interface Order {
  id: number;
  table: number;
  items: string[];
  status: OrderStatus;
}

interface OrdersContextType {
  orders: Order[];
  setStatus: (orderId: number, status: OrderStatus) => void;
  addOrder: (order: Omit<Order, 'id' | 'status'>) => void;
}

const OrdersContext = createContext<OrdersContextType | null>(null);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([
    { id: 1, table: 5, items: ['Pasta Boloñesa'], status: 'pendiente' },
    { id: 2, table: 2, items: ['Ensalada César', 'Jugo piña'], status: 'pendiente' },
  ]);

  const setStatus = (orderId: number, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map(o => o.id === orderId ? { ...o, status } : o)
    );
  };

  const addOrder = ({ table, items }: Omit<Order, 'id' | 'status'>) => {
    const nextId = Math.max(0, ...orders.map(o => o.id)) + 1;
    setOrders(prev => [...prev, { id: nextId, table, items, status: 'pendiente' }]);
  };

  return (
    <OrdersContext.Provider value={{ orders, setStatus, addOrder }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = (): OrdersContextType => {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders debe usarse dentro de OrdersProvider');
  return ctx;
};

// context/OrdersContext.tsx

import React, {
    createContext,
    useContext,
    useState,
    ReactNode
  } from 'react';
  import { CartItem } from './CarritoContext';
  
  export type OrderStatus = 'en progreso' | 'listo' | 'completado';
  
  export interface Order {
    id:             number;
    items:          CartItem[];
    notes:          string;
    tipIncluded:    boolean;
    estimatedTime:  number;  // minutos
    timestamp:      number;  // epoch ms
    status:         OrderStatus;
  }
  
  interface OrdersContextType {
    orders:  Order[];
    addOrder: (
      items: CartItem[],
      notes: string,
      tipIncluded: boolean,
      estimatedTime: number
    ) => void;
  }
  
  const OrdersContext = createContext<OrdersContextType | null>(null);
  
  export const OrdersProvider = ({ children }: { children: ReactNode }) => {
    const [orders, setOrders] = useState<Order[]>([]);
  
    const addOrder = (
      items: CartItem[],
      notes: string,
      tipIncluded: boolean,
      estimatedTime: number
    ) => {
      const id        = Math.floor(1000 + Math.random() * 9000);
      const timestamp = Date.now();
      const newOrder: Order = {
        id,
        items,
        notes,
        tipIncluded,
        estimatedTime,
        timestamp,
        status: 'en progreso',
      };
      setOrders(prev => [...prev, newOrder]);
  
      // tras estimatedTime min → listo
      setTimeout(() => {
        setOrders(prev =>
          prev.map(o => o.id === id ? { ...o, status: 'listo' } : o)
        );
        // +1 min → completado
        setTimeout(() => {
          setOrders(prev =>
            prev.map(o => o.id === id ? { ...o, status: 'completado' } : o)
          );
        }, 60 * 1000);
      }, estimatedTime * 60 * 1000);
    };
  
    return (
      <OrdersContext.Provider value={{ orders, addOrder }}>
        {children}
      </OrdersContext.Provider>
    );
  };
  
  export const useOrders = () => {
    const ctx = useContext(OrdersContext);
    if (!ctx) throw new Error('useOrders debe usarse dentro de OrdersProvider');
    return ctx;
  };
  
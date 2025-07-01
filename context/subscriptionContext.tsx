import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubscriptionLimits } from '../constants/subscriptions';

type Nivel = 0 | 1 | 2;

interface SubscriptionContextProps {
    nivel: Nivel;
    limites: typeof SubscriptionLimits[Nivel];
    puedeCrearMesa: (cantidadActual: number) => boolean;
    puedeCrearSilla: (actual: number, agregar: number) => boolean;
    puedeCrearPlato: (cantidadActual: number) => boolean;
    puedeCrearCategoria: (cantidadActual: number) => boolean;
    // Puedes agregar más funciones
}

const SubscriptionContext = createContext<SubscriptionContextProps | null>(null);

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
const [nivel, setNivel] = useState<Nivel>(1);

    useEffect(() => {
        AsyncStorage.getItem('Nivel').then(val => {
            const nivelGuardado = Number(val);
            if ([0, 1, 2].includes(nivelGuardado)) 
                setNivel(nivelGuardado as Nivel);
        });
    }, []);

    const limites = SubscriptionLimits[nivel];

    const puedeCrearMesa = (cantidadActual: number) => cantidadActual < limites.mesas;
    const puedeCrearSilla = (sillasActualesTotales: number, sillasPorAgregar: number) => {
        return sillasActualesTotales + sillasPorAgregar <= limites.sillas;
    };
    const puedeCrearPlato = (actual: number) => actual < limites.platos;
    const puedeCrearCategoria = (actual: number) => actual < limites.categorias;

    return (
        <SubscriptionContext.Provider 
            value={{ nivel, 
                    limites, 
                    puedeCrearPlato, 
                    puedeCrearCategoria,
                    puedeCrearMesa,
                    puedeCrearSilla }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) throw new Error('Error en contexto de suscripcion');
    return context;
};
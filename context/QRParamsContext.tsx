import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface QRParams {
  userId: string;
  restauranteId: string;
  mesaId: string;
  sillaId: string;
}

interface QRParamsContextType {
  qrParams: QRParams | null;
  setQRParams: (params: QRParams | null) => void;
  hasValidParams: boolean;
  clearParams: () => void;
  isLoading: boolean;
}

const QRParamsContext = createContext<QRParamsContextType | undefined>(undefined);

export function QRParamsProvider({ children }: { children: ReactNode }) {
  const [qrParams, setQRParams] = useState<QRParams | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hasValidParams = qrParams && 
    qrParams.userId && 
    qrParams.restauranteId && 
    qrParams.mesaId && 
    qrParams.sillaId;

  const clearParams = useCallback(async () => {
    setQRParams(null);
    // También limpiar de AsyncStorage
    await AsyncStorage.multiRemove(['userId', 'restauranteId', 'mesaId', 'sillaId']);
  }, []);

  const setQRParamsWithStorage = useCallback(async (params: QRParams | null) => {
    // Evitar actualizaciones innecesarias
    if (params && qrParams && 
        params.userId === qrParams.userId && 
        params.restauranteId === qrParams.restauranteId && 
        params.mesaId === qrParams.mesaId && 
        params.sillaId === qrParams.sillaId) {
      return; // No hay cambios, no actualizar
    }

    setQRParams(params);
    
    if (params) {
      // Guardar también en AsyncStorage para persistencia
      await AsyncStorage.setItem('userId', params.userId);
      await AsyncStorage.setItem('restauranteId', params.restauranteId);
      await AsyncStorage.setItem('mesaId', params.mesaId);
      await AsyncStorage.setItem('sillaId', params.sillaId);
    }
  }, [qrParams]);

  // Recuperar parámetros de AsyncStorage al inicializar
  useEffect(() => {
    const loadParamsFromStorage = async () => {
      try {
        const [userId, restauranteId, mesaId, sillaId] = await AsyncStorage.multiGet([
          'userId', 'restauranteId', 'mesaId', 'sillaId'
        ]);

        const params = {
          userId: userId[1] || '',
          restauranteId: restauranteId[1] || '',
          mesaId: mesaId[1] || '',
          sillaId: sillaId[1] || ''
        };

        // Solo setear si todos los parámetros existen
        if (params.userId && params.restauranteId && params.mesaId && params.sillaId) {
          setQRParams(params);
        }
      } catch (error) {
        console.error('Error loading QR params from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadParamsFromStorage();
  }, []);

  return (
    <QRParamsContext.Provider value={{
      qrParams,
      setQRParams: setQRParamsWithStorage,
      hasValidParams: Boolean(hasValidParams),
      clearParams,
      isLoading
    }}>
      {children}
    </QRParamsContext.Provider>
  );
}

export function useQRParams() {
  const context = useContext(QRParamsContext);
  if (context === undefined) {
    throw new Error('useQRParams debe usarse dentro de un QRParamsProvider');
  }
  return context;
}

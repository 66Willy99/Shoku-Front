// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { COLORS } from '../../../../../theme';
import { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router"; // Cambiado a useLocalSearchParams de expo-router
import Home from '../../..';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MesaSillaPage() {
    const { userId, restauranteId, mesaId, sillaId } = useLocalSearchParams(); // Cambiado a useLocalSearchParams de expo-router

    useEffect(() => {
        if (userId && restauranteId && mesaId && sillaId) {
            AsyncStorage.setItem("userId", userId as string);
            AsyncStorage.setItem("restauranteId", restauranteId as string);
            AsyncStorage.setItem("mesaId", mesaId as string);
            AsyncStorage.setItem("sillaId", sillaId as string);
        }
    }, [userId, restauranteId, mesaId, sillaId]);

  return (
      <>
          {Home()}
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: COLORS.primary,
              tabBarStyle: { backgroundColor: COLORS.white },
            }}
          >
            <Tabs.Screen name="index"   options={{ title: 'Inicio'  }} />
            <Tabs.Screen name="carta"   options={{ title: 'Carta'   }} />
            <Tabs.Screen name="carrito" options={{ title: 'Pedido'  }} />
            <Tabs.Screen name="pago"     options={{ title: 'Pagar'   }} />
            <Tabs.Screen name="estado"   options={{ title: 'Atención'}} />
          </Tabs>
      </>
  );
}

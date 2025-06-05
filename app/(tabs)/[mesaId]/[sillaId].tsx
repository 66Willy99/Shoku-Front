// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { COLORS } from '../../../theme';
import { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router"; // Cambiado a useLocalSearchParams de expo-router

export default function MesaSillaPage() {
    const { mesaId, sillaId } = useLocalSearchParams(); // Cambiado a useLocalSearchParams de expo-router

    useEffect(() => {
        if (mesaId && sillaId) {
            localStorage.setItem("mesaId", mesaId as string);
            localStorage.setItem("sillaId", sillaId as string);
        }
    }, [mesaId, sillaId]);

  return (
      <>
          <div>
              <h1>Mesa: {mesaId}</h1>
              <h2>Silla: {sillaId}</h2>
              <p>¡IDs guardados en localStorage!</p>
          </div>
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

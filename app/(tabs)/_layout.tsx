// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { COLORS } from '../../theme';

export default function TabLayout() {
  return (
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
  );
}

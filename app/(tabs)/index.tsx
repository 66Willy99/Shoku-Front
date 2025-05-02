// app/(tabs)/index.tsx

import { View, Text, Pressable, Alert } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
  const handleLlamarMesero = () => {
    Alert.alert(
      'Llamar a Mesero',
      'Un garzón ha sido notificado y llegará en breve.'
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
      }}
    >
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 32 }}>
        Shoku
      </Text>

      {/* Llamar a Mesero */}
      <Pressable
        onPress={handleLlamarMesero}
        style={{
          backgroundColor: '#f59e0b',
          paddingVertical: 12,
          paddingHorizontal: 32,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: 'white', fontSize: 18 }}>
          ☎️ Llamar a Mesero
        </Text>
      </Pressable>

      {/* Pagar: navega a /pago */}
      <Link href="/pago" asChild>
        <Pressable
          style={{
            backgroundColor: '#10b981',
            paddingVertical: 12,
            paddingHorizontal: 32,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: 'white', fontSize: 18 }}>💳 Pagar</Text>
        </Pressable>
      </Link>

      {/* Ver Carta: navega a /carta */}
      <Link href="/carta" asChild>
        <Pressable
          style={{
            backgroundColor: '#3b82f6',
            paddingVertical: 12,
            paddingHorizontal: 32,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: 'white', fontSize: 18 }}>🛒 Ver Carta</Text>
        </Pressable>
      </Link>
    </View>
  );
}

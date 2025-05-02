import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function Estado() {
  // Aquí podrías recibir params (como número de orden) usando useSearchParams()
  // pero de momento lo dejamos estático
  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>
        ✅ Pedido realizado con éxito
      </Text>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>ORDEN #1234</Text>
      <Text style={{ fontSize: 16, marginBottom: 24 }}>
        Tiempo estimado de preparación: 15 minutos
      </Text>

      <Link href="/carta" asChild>
        <Pressable
          style={{
            backgroundColor: '#3b82f6',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            🔄 Volver a pedir
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}

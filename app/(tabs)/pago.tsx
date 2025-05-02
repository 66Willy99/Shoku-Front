import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function Pago() {
  const router = useRouter();
  const handleProcesarPago = () => {
    Alert.alert('Procesando pago', 'Aquí integrarás WebPay o MercadoPago.');
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
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>💳 Pago</Text>

      <Pressable
        onPress={handleProcesarPago}
        style={{
          backgroundColor: '#3b82f6',
          paddingVertical: 12,
          paddingHorizontal: 32,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: 'white', fontSize: 18 }}>Iniciar Pago</Text>
      </Pressable>

      <Pressable onPress={() => router.back()}>
        <Text style={{ color: '#3b82f6' }}>← Volver</Text>
      </Pressable>
    </View>
  );
}

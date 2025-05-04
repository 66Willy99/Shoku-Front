import { View, Text, ScrollView, Pressable } from 'react-native';
import { useCarrito } from '../../context/CarritoContext';
import { Link, useRouter } from 'expo-router';

export default function Carrito() {
  const { carrito, limpiarCarrito } = useCarrito();
  const router = useRouter();

  const total = carrito.length;

  return (
    <ScrollView style={{ padding: 16, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>🛒 Tu Carrito</Text>

      {carrito.length === 0 ? (
        <Text style={{ fontSize: 16 }}>Tu carrito está vacío.</Text>
      ) : (
        carrito.map((item, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 10,
              borderBottomWidth: 1,
              borderColor: '#ccc',
              paddingBottom: 6,
            }}
          >
            <Text>{item}</Text>
            <Text>$X.XXX</Text>
          </View>
        ))
      )}

      {carrito.length > 0 && (
        <>
          <Text style={{ marginTop: 12, fontWeight: 'bold' }}>Total de productos: {total}</Text>

          <Link href={{ pathname: '/estado' }} asChild>
            <Pressable
              onPress={() => limpiarCarrito()}
              style={{
                marginTop: 20,
                backgroundColor: '#10b981',
                padding: 12,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>✅ Realizar Pedido</Text>
            </Pressable>
          </Link>
        </>
      )}

      <Pressable
        onPress={() => router.back()}
        style={{ marginTop: 32, alignItems: 'center' }}
      >
        <Text style={{ color: '#3b82f6' }}>← Volver a la carta</Text>
      </Pressable>
    </ScrollView>
  );
}

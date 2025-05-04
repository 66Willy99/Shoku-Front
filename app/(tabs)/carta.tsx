import { View, Text, ScrollView, Pressable } from 'react-native';
import { useCarrito } from '../../context/CarritoContext';
import { Link } from 'expo-router';

const categorias = {
  Pastas: ['Pasta Boloñesa', 'Pasta Carbonara', 'Lasaña', 'Canelones'],
  Bocadillos: ['Sándwich mixto', 'Sándwich vegetal', 'Bocadillo de jamón', 'Bocadillo de tortilla'],
  Ensaladas: ['Ensalada César', 'Ensalada de Quesos', 'Ensalada Mixta', 'Ensalada de Verano'],
};

export default function Carta() {
  const { agregarProducto } = useCarrito();

  return (
    <ScrollView style={{ padding: 16, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>📋 Carta de Productos</Text>

      {Object.entries(categorias).map(([categoria, productos]) => (
        <View key={categoria} style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 8 }}>{categoria}</Text>

          {productos.map((producto) => (
            <View
              key={producto}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <Text>{producto}</Text>
              <Pressable
                style={{
                  backgroundColor: '#ef4444',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 6,
                }}
                onPress={() => agregarProducto(producto)}
              >
                <Text style={{ color: 'white' }}>+ Agregar</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ))}

      <Link href={{ pathname: '/carrito' }} asChild>
        <Pressable
          style={{
            marginTop: 32,
            backgroundColor: '#3b82f6',
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>🛒 Ver Carrito</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function Estado() {
  const router = useRouter();
  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <Text>Ver pedido</Text>
      <Button title="Volver al inicio" onPress={() => router.back()} />
    </View>
  );
}

const pedidos = [
  { id: '8269', estado: 'En preparación' },
  { id: '8270', estado: 'Terminado' },
  { id: '8271', estado: 'En preparación' },
  { id: '8272', estado: 'Terminado' },
  { id: '6273', estado: 'En preparación' },
];

const estadoColor = {
  'En preparación': 'orange',
  'Terminado': 'green',
};

export default function Estado() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pedidos</Text>
      <FlatList
        data={pedidos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.pedido}
            onPress={() => router.push(`/garzon/entrega/${item.id}`)}
          >
            <Text style={styles.text}>Pedido #{item.id}</Text>
            <View
              style={[
                styles.statusCircle,
                { backgroundColor: estadoColor[item.estado] || '#ccc' },
              ]}
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  pedido: {
    padding: 16,
    backgroundColor: '#eee',
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: { fontWeight: 'bold' },
  statusCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});

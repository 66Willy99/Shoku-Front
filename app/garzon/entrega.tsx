import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

export default function EntregaPedido() {
  const router = useRouter();
  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <Text>Entregar pedido</Text>
      <Button title="Volver al inicio" onPress={() => router.back()} />
    </View>
  );
}

export default function EntregaPedido() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pedido #{id} M2</Text>

      <View style={styles.detalle}>
        <Text>🍔 Hamburguesa queso</Text>
        <Text>🍕 Pizza Carbonara (32cm)</Text>
        <Text>🍰 Torta de Chocolate</Text>
        <Text>🥤 Pepsi Original 350 ml</Text>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Entregar Pedido</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  detalle: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#90D07F',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

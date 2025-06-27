<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../../theme';

type Pedido = {
  id: string;
  numero: number;
  mesa: string;
  estado: string;
};

export default function EstadoPedidos() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      const response = await fetch("....");
      const data = await response.json();
      setPedidos(data);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderPedido = ({ item }: { item: Pedido }) => (
    <TouchableOpacity
      style={styles.pedidoItem}
      onPress={() => router.push(`/garzon/entrega?id=${item._id}`)}
    >
      <Text style={styles.pedidoNombre}>Pedido #{item.numero}</Text>
      <Text style={styles.pedidoEstado}>Mesa: {item.mesa} - {item.estado}</Text>
      <View
        style={[
          styles.estadoIndicator,
          { backgroundColor: colorEstado(item.estado) },
        ]}
      />
    </TouchableOpacity>
  );

  const colorEstado = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "en preparación":
        return COLORS.warning;
      case "terminado":
        return COLORS.success;
      default:
        return COLORS.gray;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>
      <Text style={styles.title}>Estado de Pedidos</Text>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item._id}
          renderItem={renderPedido}
          contentContainerStyle={{ paddingBottom: SPACING.lg }}
        />
      )}
=======
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
>>>>>>> 845085c373a471f824a5ee8b267a1dcf8c8fd359
    </View>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  backButton: {
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  pedidoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pedidoNombre: {
    fontSize: FONT_SIZES.body,
    color: COLORS.primary,
  },
  pedidoEstado: {
    fontSize: FONT_SIZES.body,
    color: COLORS.grayDark,
  },
  estadoIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
=======
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
>>>>>>> 845085c373a471f824a5ee8b267a1dcf8c8fd359
  },
});

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
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
});

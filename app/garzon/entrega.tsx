import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../../theme';

type Pedido = {
  id: string;
  numero: number;
  mesa: string;
  estado: string;
  productos: string[];
};

export default function EntregaPedido() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPedido();
    }
  }, [id]);

  const fetchPedido = async () => {
    try {
      const response = await fetch(`/pedidos/${id}`);
      const data = await response.json();
      setPedido(data);
    } catch (error) {
      console.error("Error al cargar pedido:", error);
    } finally {
      setLoading(false);
    }
  };

  const entregarPedido = async () => {
    try {
      await fetch(`/pedidos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: "entregado" }),
      });
      Alert.alert("✅ Pedido entregado correctamente");
      router.back();
    } catch (error) {
      console.error("Error al entregar pedido:", error);
      Alert.alert("Error al marcar el pedido como entregado");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>
      {loading || !pedido ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : (
        <>
          <Text style={styles.title}>Pedido #{pedido.numero} - Mesa {pedido.mesa}</Text>
          <ScrollView style={styles.productosList}>
            {pedido.productos.map((prod, index) => (
              <Text key={index} style={styles.productoItem}>{prod}</Text>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.entregarBtn} onPress={entregarPedido}>
            <Text style={styles.entregarText}>Entregar Pedido</Text>
          </TouchableOpacity>
        </>
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
    marginBottom: SPACING.lg,
  },
  productosList: {
    flex: 1,
    marginBottom: SPACING.lg,
  },
  productoItem: {
    fontSize: FONT_SIZES.body,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  entregarBtn: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: 10,
  },
  entregarText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.body,
    fontWeight: 'bold',
  },
});

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Alert, StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Order } from '../../context/OrdersContext';
import { COLORS, FONT_SIZES, SPACING } from '../../theme';
import API_URL from '../../lib/api';

const STEPS = [
  { key: 'confirmed', icon: 'check-circle', label: 'Pedido confirmado' },
  { key: 'preparing', icon: 'silverware-fork-knife', label: 'En preparación' },
  { key: 'finished', icon: 'clock-end', label: 'Terminado' },
  { key: 'delivered', icon: 'food-fork-drink', label: 'Entregado' },
];

const STATUS_INDEX: Record<string, number> = {
  'confirmado': 0,
  'en progreso': 1,
  'listo': 2,
  'completado': 3,
  'entregado': 3,
};

export default function Estado() {
  const {
    mesa_id,
    silla_id,
    token_ws,
    approved,
    user_id,
    restaurante_id,
  } = useLocalSearchParams<{
    mesa_id?: string;
    silla_id?: string;
    token_ws?: string;
    approved?: 'true' | 'false';
    user_id?: string;
    restaurante_id?: string;
  }>();

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (token_ws) {
      Alert.alert(
        approved === 'true' ? '✅ Pago aprobado' : '❌ Pago rechazado',
        approved === 'true'
          ? 'Tu pedido ha sido registrado correctamente.'
          : 'Lo sentimos, tu pago fue rechazado.'
      );
    }
  }, [token_ws]);

  useEffect(() => {
    if (!user_id || !restaurante_id) return;

    const fetchPedidos = async () => {
      try {
        const res = await fetch(
          `${API_URL}/pedidos/?user_id=${user_id}&restaurante_id=${restaurante_id}`
        );

        if (!res.ok) {
          console.error('Error en la respuesta del servidor:', res.status);
          return;
        }

        const data = await res.json();
        console.log('📦 Pedidos recibidos:', data);

        if (data && data.pedidos) {
          const pedidosArray: Order[] = Object.entries(data.pedidos).map(([id, pedido]: [string, any]) => ({
            ...pedido,
            id,
          }));
          setOrders(pedidosArray);
        } else {
          console.warn('La respuesta no contiene pedidos válidos:', data);
          setOrders([]);
        }
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
      }
    };

    fetchPedidos();
    const interval = setInterval(fetchPedidos, 10000);
    return () => clearInterval(interval);
  }, [user_id, restaurante_id]);

  const activos = orders.filter(o => o.status !== 'completado' && o.status !== 'entregado');
  const completados = orders.filter(o => o.status === 'completado' || o.status === 'entregado');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {activos.length > 0 && (
        <View>
          <Text style={styles.statusBanner}>⌛ Pedido en curso, sigue su estado aquí</Text>
          {activos.map(o => {
            const idx = o.status ? STATUS_INDEX[o.status] ?? 0 : 0;
            const platosArray = Object.values(o.platos || {});

            const total = platosArray.reduce((s: number, i: any) => {
              const price = i?.dish?.price ?? 0;
              const quantity = i?.quantity ?? 0;
              return s + price * quantity;
            }, 0);

            return (
              <View key={o.id} style={styles.section}>
                <Text style={styles.sectionTitle}>📦 Datos de tu pedido</Text>
                <Text style={styles.detail}>🧾 Orden #{o.id}</Text>
                <Text style={styles.detail}>💵 Total: ${total.toLocaleString()}</Text>

                <View style={styles.timelineCard}>
                  {STEPS.map((step, i) => {
                    const isActive = i <= idx;
                    return (
                      <View key={step.key} style={styles.stepContainer}>
                        <MaterialCommunityIcons
                          name={step.icon as any}
                          size={28}
                          color={isActive ? COLORS.primary : COLORS.grayLight}
                        />
                        <Text
                          style={[
                            styles.stepLabel,
                            { color: isActive ? COLORS.primary : COLORS.grayDark },
                          ]}
                        >
                          {step.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {platosArray.map((i: any, index: number) => (
                  <Text key={index} style={styles.detail}>
                    🍽 {i?.dish?.name ?? 'Plato desconocido'} ×{i?.quantity ?? '?'}
                  </Text>
                ))}

                {o.notes && <Text style={styles.notes}>📋 Notas: {o.notes}</Text>}
              </View>
            );
          })}
        </View>
      )}

      {completados.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>
            📚 Historial de pedidos
          </Text>
          {completados.map(o => {
            const platosArray = Object.values(o.platos || {});
            return (
              <View key={o.id} style={styles.historyCard}>
                <Text style={styles.historyTitle}>Orden #{o.id}</Text>
                {platosArray.map((i: any, ix: number) => (
                  <Text key={ix}>• {i?.dish?.name ?? 'Plato'} ×{i?.quantity ?? '?'}</Text>
                ))}
                {o.notes && <Text>📋 Notas: {o.notes}</Text>}
              </View>
            );
          })}
        </>
      )}

      {activos.length === 0 && completados.length === 0 && (
        <Text style={styles.detail}>🕐 No hay pedidos registrados para esta mesa.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.subtitle,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  detail: {
    fontSize: FONT_SIZES.body,
    marginBottom: 6,
    color: COLORS.grayDark,
  },
  timelineCard: {
    backgroundColor: '#fefefe',
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  stepLabel: {
    marginLeft: 10,
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
  },
  notes: {
    fontStyle: 'italic',
    marginTop: SPACING.sm,
  },
  historyCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  historyTitle: {
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  statusBanner: {
    backgroundColor: COLORS.secondary,
    padding: SPACING.sm,
    borderRadius: 6,
    textAlign: 'center',
    marginBottom: SPACING.md,
    color: '#fff',
    fontWeight: '600',
  },
});

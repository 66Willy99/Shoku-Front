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
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

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
    if (!mesa_id || !user_id || !restaurante_id) return;

    const fetchPedidos = async () => {
      try {
        const res = await fetch(`${API_URL}/pedidos/mesa/`, {

          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id,
            restaurante_id,
            mesa_id,
          }),
        });

        if (!res.ok) {
          console.error('Error en la respuesta del servidor:', res.status);
          return;
        }

        const data = await res.json();
        setOrders(data.pedidos || []);
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
      }
    };

    fetchPedidos();
    const interval = setInterval(fetchPedidos, 10000);
    return () => clearInterval(interval);
  }, [mesa_id, user_id, restaurante_id]);

  const activos = orders.filter(o => o.status !== 'completado' && o.status !== 'entregado');
  const completados = orders.filter(o => o.status === 'completado' || o.status === 'entregado');

  const formatTime = (ms: number) =>
    new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const remaining = (o: Order) => {
    const startTime = new Date(o.created_at || Date.now()).getTime();
    const elapsed = (now - startTime) / 1000;
    const totalSec = (o.estimatedTime || 0) * 60;
    const rem = Math.max(totalSec - elapsed, 0);
    const m = Math.floor(rem / 60);
    const s = Math.floor(rem % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {activos.length > 0 && (
        <View>
          <Text style={styles.statusBanner}>⌛ Pedido en curso, sigue su estado aquí</Text>
          {activos.map(o => {
            const idx = o.status ? STATUS_INDEX[o.status] ?? 0 : 0;
            return (
              <View key={o.id} style={styles.section}>
                <Text style={styles.sectionTitle}>📦 Detalles de tu pedido</Text>
                <Text style={styles.detail}>🧾 Orden #{o.id}</Text>
                <Text style={styles.detail}>
                  💵 Total: ${o.platos.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()}
                </Text>
                <Text style={styles.detail}>⏳ Estimado: {o.estimatedTime || 'N/A'} min</Text>

                <View style={styles.timelineCard}>
                  {STEPS.map((step, i) => {
                    const isActive = i <= idx;
                    return (
                      <View key={step.key} style={styles.stepContainer}>
                        <MaterialCommunityIcons
                          name={step.icon as any}
                          size={24}
                          color={isActive ? COLORS.primary : COLORS.grayLight}
                        />
                        <Text
                          style={[
                            styles.stepLabel,
                            { color: isActive ? COLORS.primary : COLORS.grayDark },
                          ]}
                        >
                          {step.label}
                          {i === idx && o.status === 'en progreso' ? ` — Resta ${remaining(o)}` : ''}
                          {i === 0 && ` (${formatTime(new Date(o.created_at || 0).getTime())})`}
                        </Text>
                      </View>
                    );
                  })}
                </View>

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
            const doneTime = new Date(o.created_at || 0).getTime() + (o.estimatedTime || 0) * 60 * 1000;
            return (
              <View key={o.id} style={styles.historyCard}>
                <Text style={styles.historyTitle}>
                  Orden #{o.id} — completada a las {formatTime(doneTime)}
                </Text>
                {o.platos.map((i, ix) => (
                  <Text key={ix}>• {i.name} ×{i.quantity}</Text>
                ))}
                {o.notes && <Text>📋 Notas: {o.notes}</Text>}
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}
// despues viene los stylesheet
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
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  stepLabel: {
    marginLeft: 10,
    fontSize: FONT_SIZES.body,
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

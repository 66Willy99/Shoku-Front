import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useOrders, Order } from '../../context/OrdersContext';
import { COLORS, FONT_SIZES, SPACING } from '../../theme';

const STEPS = [
  { key: 'confirmed', icon: 'check-circle', label: 'Pedido confirmado' },
  { key: 'preparing', icon: 'silverware-fork-knife', label: 'En preparación' },
  { key: 'finished', icon: 'clock-end', label: 'Terminado' },
  { key: 'delivered', icon: 'food-fork-drink', label: 'Entregado' },
];

const STATUS_INDEX: Record<Order['status'], number> = {
  'en progreso': 1,
  'listo': 2,
  'completado': 3,
};

export default function Estado() {
  const router = useRouter();
  const { token_ws, approved } = useLocalSearchParams<{
    token_ws?: string;
    approved?: string;
  }>();

  const { orders } = useOrders();
  const [now, setNow] = useState(Date.now());

  // Convertimos el parámetro a booleano robustamente
  const isApproved = approved?.toLowerCase() === 'true';

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (token_ws) {
      Alert.alert(
        isApproved ? '✅ Pago aprobado' : '❌ Pago rechazado',
        isApproved
          ? 'Tu pedido ha sido registrado correctamente.'
          : 'Lo sentimos, tu pago fue rechazado.'
      );
    }
  }, [token_ws]);

  const activos = orders.filter(o => o.status !== 'completado');
  const completados = orders.filter(o => o.status === 'completado');

  const formatTime = (ms: number) =>
    new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const remaining = (o: Order) => {
    const elapsed = (now - o.timestamp) / 1000;
    const totalSec = o.estimatedTime * 60;
    const rem = Math.max(totalSec - elapsed, 0);
    const m = Math.floor(rem / 60);
    const s = Math.floor(rem % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!orders.length && token_ws) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {isApproved ? '✅ Pedido aprobado' : '❌ Pago rechazado'}
        </Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push('/carta')}
        >
          <Text style={styles.btnText}>🛒 Volver a la Carta</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!orders.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Aún no tienes ningún pedido.</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push('/carta')}
        >
          <Text style={styles.btnText}>🛒 Ver Carta</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {activos.length > 0 && (
        <View>
          <Text style={styles.statusBanner}>⌛ Pedido en curso, sigue su estado aquí</Text>
          {activos.map(o => {
            const idx = STATUS_INDEX[o.status];
            return (
              <View key={o.id} style={styles.section}>
                <Text style={styles.sectionTitle}>📦 Detalles de tu pedido</Text>
                <Text style={styles.detail}>🧾 Orden #{o.id}</Text>
                <Text style={styles.detail}>
                  💵 Total: ${o.items.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()}
                </Text>
                <Text style={styles.detail}>⏳ Estimado: {o.estimatedTime} min</Text>

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
                          {i === 0 && ` (${formatTime(o.timestamp)})`}
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
            const doneTime = o.timestamp + o.estimatedTime * 60 * 1000;
            return (
              <View key={o.id} style={styles.historyCard}>
                <Text style={styles.historyTitle}>
                  Orden #{o.id} — completada a las {formatTime(doneTime)}
                </Text>
                {o.items.map((i, ix) => (
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

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.grayDark,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
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

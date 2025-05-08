// app/(tabs)/estado.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useOrders, Order } from '../../context/OrdersContext';
import { COLORS, FONT_SIZES, SPACING } from '../../theme';

const STEPS = [
  { key: 'confirmed', icon: 'check-circle',           label: 'Pedido confirmado' },
  { key: 'preparing', icon: 'silverware-fork-knife',  label: 'En preparación' },
  { key: 'finished',  icon: 'clock-end',              label: 'Terminado' },
  { key: 'delivered', icon: 'food-fork-drink',        label: 'Entregado' },
];
const STATUS_INDEX: Record<Order['status'], number> = {
  'en progreso': 1,
  'listo':       2,
  'completado':  3,
};

export default function Estado() {
  const router = useRouter();
  const { orders } = useOrders();
  const [now, setNow] = useState(Date.now());

  // actualizar cada segundo para cuenta regresiva
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  const formatTime = (ms: number) =>
    new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const remaining = (o: Order) => {
    const elapsed  = (now - o.timestamp) / 1000;
    const totalSec = o.estimatedTime * 60;
    const rem      = Math.max(totalSec - elapsed, 0);
    const m = Math.floor(rem / 60);
    const s = Math.floor(rem % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // si no hay pedidos activos ni historial:
  if (orders.length === 0) {
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

  const activos     = orders.filter(o => o.status !== 'completado');
  const completados = orders.filter(o => o.status === 'completado');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {activos.map(o => {
        const idx = STATUS_INDEX[o.status];
        return (
          <View key={o.id} style={styles.section}>
            {/* Cabecera de datos */}
            <Text style={styles.sectionTitle}>Datos de tu pedido</Text>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="receipt" size={20} color="#fff" />
              <Text style={styles.infoText}>Orden #{o.id}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="currency-usd" size={20} color="#fff" />
              <Text style={styles.infoText}>
                Total: ${o.items.reduce((s,i)=>s+i.price*i.quantity,0).toLocaleString()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="timer" size={20} color="#fff" />
              <Text style={styles.infoText}>
                Estimado: {o.estimatedTime} min
              </Text>
            </View>

            {/* Línea de tiempo */}
            <View style={styles.timelineCard}>
              {STEPS.map((step, i) => {
                const isActive = i <= idx;
                return (
                  <View key={step.key} style={styles.stepContainer}>
                    <View style={styles.iconColumn}>
                      <MaterialCommunityIcons
                        name={step.icon as any}
                        size={24}
                        color={isActive ? COLORS.primary : COLORS.grayLight}
                      />
                      {i < STEPS.length - 1 && (
                        <View
                          style={[
                            styles.line,
                            { backgroundColor: i < idx ? COLORS.primary : COLORS.grayLight },
                          ]}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        { color: isActive ? COLORS.primary : COLORS.grayDark },
                      ]}
                    >
                      {step.label}
                      {i === idx && o.status === 'en progreso'
                        ? ` — Resta ${remaining(o)}`
                        : ''}
                      {i === 0 && ` (${formatTime(o.timestamp)})`}
                    </Text>
                  </View>
                );
              })}
            </View>

            {o.notes ? (
              <Text style={styles.notes}>📋 Notas: {o.notes}</Text>
            ) : null}
          </View>
        );
      })}

      {completados.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>
            Historial de pedidos
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
                {o.notes ? <Text>📋 Notas: {o.notes}</Text> : null}
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background,
    padding: SPACING.md
  },
  emptyText: { fontSize: FONT_SIZES.body, color: COLORS.grayDark, marginBottom: SPACING.md },
  btn:        { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: 8 },
  btnText:    { color: '#fff', fontWeight: 'bold' },

  container:    { padding: SPACING.md, backgroundColor: COLORS.background },
  section:      { marginBottom: SPACING.lg },
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
  infoRow:      {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.xs,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  infoText:     { color: '#fff', marginLeft: SPACING.xs },

  timelineCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: SPACING.md, marginVertical: SPACING.sm },
  stepContainer:{ flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.xs },
  iconColumn:   { alignItems: 'center', marginRight: SPACING.sm },
  line:         { width: 2, flex: 1, marginTop: SPACING.xs },
  stepLabel:    { fontSize: FONT_SIZES.body },

  notes:        { fontStyle: 'italic', marginTop: SPACING.sm },

  historyCard:  { backgroundColor: COLORS.white, padding: SPACING.sm, borderRadius: 8, marginBottom: SPACING.sm },
  historyTitle: { fontWeight: 'bold', marginBottom: SPACING.xs },
});

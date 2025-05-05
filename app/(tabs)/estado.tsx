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
  { key: 'confirmed', icon: 'check-circle', label: 'Pedido confirmado' },
  { key: 'preparing', icon: 'silverware-fork-knife', label: 'En preparación' },
  { key: 'finished', icon: 'clock-end', label: 'Terminado' },
  { key: 'delivered', icon: 'truck-delivery', label: 'Entregado' },
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

  const activos     = orders.filter(o => o.status !== 'completado');
  const completados = orders.filter(o => o.status === 'completado');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {activos.map(o => {
        const idx = STATUS_INDEX[o.status];
        return (
          <View key={o.id} style={styles.section}>
            {/* Cabecera coral */}
            <Text style={styles.sectionTitle}>Datos de tu pedido</Text>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="receipt" size={20} color={COLORS.white} />
              <Text style={styles.infoText}>Orden #{o.id}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="currency-usd" size={20} color={COLORS.white} />
              <Text style={styles.infoText}>
                Total: ${o.items.reduce((s,i)=>s + i.price*i.quantity,0).toLocaleString()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="timer" size={20} color={COLORS.white} />
              <Text style={styles.infoText}>
                Tiempo estimado: {o.estimatedTime} minutos
              </Text>
            </View>

            {/* Timeline */}
            <View style={styles.timelineCard}>
              {STEPS.map((step, i) => (
                <View key={step.key} style={styles.stepContainer}>
                  <View style={styles.iconColumn}>
                    <MaterialCommunityIcons
                      name={step.icon as any}
                      size={24}
                      color={i <= idx ? COLORS.primary : COLORS.grayLight}
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
                      { color: i <= idx ? COLORS.primary : COLORS.grayDark },
                    ]}
                  >
                    {step.label}
                    {i === 0 && ` — ${formatTime(o.timestamp)}`}
                    {i === idx && o.status === 'en progreso'
                      ? ` (resta ${remaining(o)})`
                      : ''}
                  </Text>
                </View>
              ))}
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

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/')}
      >
        <Text style={styles.backText}>← Volver al inicio</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flexGrow: 1, padding: SPACING.md, backgroundColor: COLORS.background },
  section:      { marginBottom: SPACING.lg },
  sectionTitle: {
    fontSize: FONT_SIZES.subtitle,
    fontWeight: 'bold',
    color: COLORS.white,
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
  infoText:     { color: COLORS.white, marginLeft: SPACING.xs },

  timelineCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  stepContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.xs },
  iconColumn:     { alignItems: 'center', marginRight: SPACING.sm },
  line:           { width: 2, flex: 1, marginTop: SPACING.xs },
  stepLabel:      { fontSize: FONT_SIZES.body },

  notes:       { fontStyle: 'italic', marginTop: SPACING.sm },

  historyCard:   { backgroundColor: COLORS.white, padding: SPACING.sm, borderRadius: 8, marginBottom: SPACING.sm },
  historyTitle:  { fontWeight: 'bold', marginBottom: SPACING.xs },

  backButton:   {
    marginTop: SPACING.lg,
    padding: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    alignItems: 'center',
  },
  backText:      { color: COLORS.white, fontSize: FONT_SIZES.body },
});

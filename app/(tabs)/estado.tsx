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
import { useOrders, Order } from '../../context/OrdersContext';
import { COLORS, FONT_SIZES, SPACING } from '../../theme';

export default function Estado() {
  const router = useRouter();
  const { orders } = useOrders();

  // Estado local para forzar re-render cada segundo
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Separar pedidos activos y completados
  const activos   = orders.filter(o => o.status !== 'completado');
  const historial = orders.filter(o => o.status === 'completado');

  // Formatea timestamp a "HH:MM"
  const formatTime = (ms: number) => {
    const d = new Date(ms);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calcula tiempo restante "M:SS"
  const formatRemaining = (o: Order) => {
    const elapsedSec = Math.floor((now - o.timestamp) / 1000);
    const totalSec = o.estimatedTime * 60;
    const rem = Math.max(totalSec - elapsedSec, 0);
    const m = Math.floor(rem / 60);
    const s = rem % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>📋 Pedidos Activos</Text>
      {activos.length === 0 ? (
        <Text style={styles.info}>No tienes pedidos en curso.</Text>
      ) : activos.map((o: Order) => (
        <View key={o.id} style={styles.card}>
          <Text style={styles.cardTitle}>
            Orden #{o.id} — solicitado a las {formatTime(o.timestamp)}
          </Text>
          <Text>Status: {o.status}</Text>
          {o.status === 'en progreso' && (
            <Text>Tiempo restante: {formatRemaining(o)}</Text>
          )}
          {o.status === 'listo' && (
            <Text>Listo para servir</Text>
          )}
          {o.items.map((i, idx) => (
            <Text key={idx}>• {i.name} ×{i.quantity}</Text>
          ))}
        </View>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>✅ Historial</Text>
      {historial.length === 0 ? (
        <Text style={styles.info}>Aún no tienes pedidos completados.</Text>
      ) : historial.map((o: Order) => {
        // tiempo de completado = timestamp + estimatedTime*60*1000
        const doneTime = o.timestamp + o.estimatedTime * 60 * 1000;
        return (
          <View key={o.id} style={styles.card}>
            <Text style={styles.cardTitle}>
              Orden #{o.id} — completada a las {formatTime(doneTime)}
            </Text>
            {o.items.map((i, idx) => (
              <Text key={idx}>• {i.name} ×{i.quantity}</Text>
            ))}
          </View>
        );
      })}

      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
        <Text style={styles.backText}>← Volver al inicio</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flexGrow: 1, padding: SPACING.md, backgroundColor: COLORS.background },
  sectionTitle: { fontSize: FONT_SIZES.subtitle, fontWeight: 'bold', marginBottom: SPACING.sm },
  info:         { fontSize: FONT_SIZES.body, marginBottom: SPACING.md, color: COLORS.grayDark },
  card:         { backgroundColor: COLORS.white, padding: SPACING.sm, borderRadius: 8, marginBottom: SPACING.sm },
  cardTitle:    { fontWeight: 'bold', marginBottom: SPACING.xs },
  backButton:   { marginTop: SPACING.lg, padding: SPACING.sm, backgroundColor: COLORS.primary, alignItems: 'center', borderRadius: 6 },
  backText:     { color: COLORS.white, fontSize: FONT_SIZES.body },
});

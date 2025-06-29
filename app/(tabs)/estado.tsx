import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Alert, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Order } from '../../context/OrdersContext';
import { COLORS, SPACING, FONT_SIZES } from '../../theme';
import { Config } from '@/constants/config';
import { useMenu } from '../../context/MenuContext';
import { Dish } from '../../context/MenuContext';

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
  'pagado': 0, // ✅ Estado inicial post-Webpay
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

  const router = useRouter();
  const { platos } = useMenu();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (token_ws && approved !== undefined) {
      Alert.alert(
        approved === 'true' ? '✅ Pago aprobado' : '❌ Pago rechazado',
        approved === 'true'
          ? 'Tu pedido ha sido registrado correctamente.'
          : 'Lo sentimos, tu pago fue rechazado.'
      );
    }
  }, [token_ws]);

  useEffect(() => {
    if (!user_id || !restaurante_id) {
      Alert.alert("Error", "Faltan datos de usuario o restaurante en la URL");
      return;
    }

    const fetchPedidos = async () => {
      try {
        const res = await fetch(
          `${Config.API_URL}/pedidos/?user_id=${user_id}&restaurante_id=${restaurante_id}`
        );

        if (!res.ok) {
          console.error('Error en la respuesta del servidor:', res.status);
          return;
        }

        const data = await res.json();
        console.log('📦 Pedidos recibidos:', data);

        if (data && data.pedidos) {
          const pedidosArray: Order[] = Object.entries(data.pedidos).map(
            ([id, pedido]: [string, any]) => ({
              ...pedido,
              id,
            })
          );
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

  const formatTime = (ms: number) =>
    new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const mapPlatos = (platosObj: any) =>
    Object.entries(platosObj || {}).map(([platoId, info]: [string, any]) => {
      const dish = platos.find((p: Dish) => p.id === platoId);
      return {
        dish: dish || { id: platoId, name: 'Plato desconocido', price: 0 },
        quantity: info?.cantidad ?? 0,
      };
    });

  return (
    <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
      {activos.length > 0 && (
        <View>
          <Text style={{ marginBottom: SPACING.sm, fontWeight: 'bold' }}>⌛ Pedido en curso, sigue su estado aquí</Text>
          {activos.map(o => {
            const idx = o.status ? STATUS_INDEX[o.status] ?? 0 : 0;
            const platosArray = mapPlatos(o.platos);
            const total = platosArray.reduce((s, i) => s + i.dish.price * i.quantity, 0);

            return (
              <View key={o.id} style={{ marginBottom: SPACING.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.grayLight, borderRadius: 10 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: SPACING.sm }}>📦 Orden #{o.id}</Text>
                <Text>💵 Total: ${total.toLocaleString()}</Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: SPACING.md }}>
                  {STEPS.map((step, i) => {
                    const isActive = i <= idx;
                    return (
                      <View key={step.key} style={{ alignItems: 'center', flex: 1 }}>
                        <MaterialCommunityIcons
                          name={step.icon as any}
                          size={28}
                          color={isActive ? COLORS.primary : COLORS.grayLight}
                        />
                        <Text style={{ color: isActive ? COLORS.primary : COLORS.grayDark, fontSize: 12, textAlign: 'center' }}>
                          {step.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {platosArray.map((i, index) => (
                  <Text key={index}>🍽 {i.dish.name} ×{i.quantity}</Text>
                ))}

                {o.notes && <Text style={{ marginTop: SPACING.xs }}>📋 Notas: {o.notes}</Text>}

                {!o.paid && (
                  <TouchableOpacity
                    style={{
                      marginTop: SPACING.sm,
                      backgroundColor: COLORS.primary,
                      padding: SPACING.sm,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      router.push({
                        pathname: '/pago',
                        params: {
                          mesaId: mesa_id || o.mesa_id,
                          sillaId: silla_id || o.silla_id,
                          userId: user_id,
                          restauranteId: restaurante_id,
                        },
                      });
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ir a pagar este pedido</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}

      {completados.length > 0 && (
        <>
          <Text style={{ fontWeight: 'bold', marginTop: SPACING.lg, marginBottom: SPACING.sm }}>
            📚 Historial de pedidos
          </Text>
          {completados.map(o => {
            const platosArray = mapPlatos(o.platos);
            const doneTime = new Date(o.created_at || 0).getTime() + (o.estimatedTime || 0) * 60 * 1000;

            return (
              <View key={o.id} style={{ marginBottom: SPACING.md, padding: SPACING.md, backgroundColor: COLORS.grayLight, borderRadius: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>
                  Orden #{o.id} — completada a las {formatTime(doneTime)}
                </Text>
                {platosArray.map((i, ix) => (
                  <Text key={ix}>• {i.dish.name} ×{i.quantity}</Text>
                ))}
                {o.notes && <Text>📋 Notas: {o.notes}</Text>}
              </View>
            );
          })}
        </>
      )}

      {activos.length === 0 && completados.length === 0 && (
        <Text>🕐 No hay pedidos registrados para esta mesa.</Text>
      )}
    </ScrollView>
  );
}


// Estilos se mantienen igual, asumiendo que los defines globalmente



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


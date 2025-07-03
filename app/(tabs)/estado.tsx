import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Alert, TouchableOpacity, StyleSheet
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Order } from '../../context/OrdersContext';
import { useQRParams } from '../../context/QRParamsContext';

import { COLORS, SPACING, FONT_SIZES } from '../../theme';
import { Config } from '@/constants/config';
import { useMenu } from '../../context/MenuContext';
import { Dish } from '../../context/MenuContext';

const STEPS = [
  { key: 'pagado', icon: 'credit-card-check', label: 'Pagado' },
  { key: 'confirmado', icon: 'check-circle', label: 'Pedido confirmado' },
  { key: 'en progreso', icon: 'silverware-fork-knife', label: 'En preparación' },
  { key: 'listo', icon: 'clock-end', label: 'Terminado' },
  { key: 'entregado', icon: 'food-fork-drink', label: 'Entregado' },
];

const STATUS_INDEX: Record<string, number> = {
  'pagado': 0,
  'confirmado': 1,
  'en progreso': 2,
  'listo': 3,
  'entregado': 4,
  'completado': 4,
};

export default function Estado() {
  // Solo usar useLocalSearchParams para parámetros específicos de pago
  const params = useLocalSearchParams<{
    token_ws?: string;
    approved?: 'true' | 'false';
  }>();
  
  const { qrParams, hasValidParams } = useQRParams();

  // Usar parámetros del contexto QR para identificación de mesa/usuario
  const mesa_id = qrParams?.mesaId || '';
  const silla_id = qrParams?.sillaId || '';
  const user_id = qrParams?.userId || '';
  const restaurante_id = qrParams?.restauranteId || '';
  const token_ws = params.token_ws;
  const approved = params.approved;

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
      Alert.alert("Error", "Faltan datos de usuario o restaurante");
      return;
    }

    const fetchPedidos = async () => {
      try {
        const res = await fetch(
          `${Config.API_URL}/pedidos/?user_id=${user_id}&restaurante_id=${restaurante_id}`
        );
        if (!res.ok) return;

        const data = await res.json();
        if (data && data.pedidos) {
          const pedidosArray: Order[] = Object.entries(data.pedidos).map(
            ([id, pedido]: [string, any]) => {
              const estado = (
                pedido.estado_actual || 
                pedido.estados?.estado_actual || 
                'confirmado'
              ).toLowerCase();

              return {
                ...pedido,
                id,
                estado_actual: estado,
                status: estado,
                paid: estado === 'pagado',
              };
            }
          );
          setOrders(pedidosArray);
        }
      } catch (err) {
        console.error("❌ Error al obtener pedidos:", err);
      }
    };

    fetchPedidos();
    const interval = setInterval(fetchPedidos, 8000);
    return () => clearInterval(interval);
  }, [user_id, restaurante_id]);

  // Pedidos listos para pagar (entregados pero no pagados)
  const listosPagar = orders.filter(o => {
    const estado = o.status || o.estado_actual || '';
    return estado === 'entregado' && !o.paid;
  });

  // Pedidos en proceso (confirmados, en progreso, listos)
  const enProceso = orders.filter(o => {
    const estado = o.status || o.estado_actual || '';
    return ['confirmado', 'en progreso', 'listo'].includes(estado);
  });

  // Pedidos completados (pagados)
  const completados = orders.filter(o => {
    const estado = o.status || o.estado_actual || '';
    return o.paid || estado === 'completado';
  });

  const formatTime = (ms: number) =>
    new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const mapPlatos = (platosObj: any) =>
    Object.entries(platosObj || {}).map(([id, info]: [string, any]) => {
      const dish = platos.find((p: Dish) => p.id === id);
      return {
        dish: dish || { id, name: 'Plato desconocido', price: 0 },
        quantity: info?.cantidad ?? 0
      };
    });

  return (
    <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
      {/* Pedidos listos para pagar (entregados) */}
      {listosPagar.length > 0 && (
        <View>
          <Text style={{ 
            marginBottom: SPACING.sm, 
            fontWeight: 'bold', 
            color: COLORS.primary,
            fontSize: FONT_SIZES.subtitle 
          }}>
            💳 Pedidos listos para pagar (entregados)
          </Text>
          
          {listosPagar.map((o, orderIndex) => {
            const platosArray = mapPlatos(o.platos);
            const total = platosArray.reduce((s, i) => s + i.dish.price * i.quantity, 0);
            const orderId = (o as any).id || `temp-${orderIndex}`;

            return (
              <View key={orderId} style={{
                marginBottom: SPACING.md,
                padding: SPACING.md,
                borderWidth: 2,
                borderColor: '#4CAF50',
                backgroundColor: '#F1F8E9',
                borderRadius: 10
              }}>
                <Text style={{ fontWeight: 'bold', marginBottom: SPACING.sm, color: '#4CAF50' }}>
                  📦 Orden #{orderId} - LISTO PARA PAGAR
                </Text>
                <Text style={{ color: '#333' }}>💵 Total: ${total.toLocaleString()}</Text>

                {platosArray.map((i, index) => (
                  <Text key={index} style={{ color: '#666' }}>🍽 {i.dish.name} ×{i.quantity}</Text>
                ))}

                {o.detalle && (
                  <Text style={{ fontStyle: 'italic', color: '#888', marginTop: SPACING.xs }}>
                    📝 {o.detalle}
                  </Text>
                )}
              </View>
            );
          })}

          {/* Botón para pagar todos los pedidos entregados */}
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.primary,
              padding: SPACING.md,
              borderRadius: 10,
              alignItems: 'center',
              marginBottom: SPACING.lg,
            }}
            onPress={() => {
              router.push({
                pathname: '/pago',
                params: {
                  mesaId: mesa_id ?? '',
                  sillaId: silla_id ?? '',
                  userId: user_id ?? '',
                  restauranteId: restaurante_id ?? '',
                },
              });
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: FONT_SIZES.body }}>
              💳 Pagar pedidos entregados ({listosPagar.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Pedidos en proceso */}
      {enProceso.length > 0 && (
        <View>
          <Text style={{ 
            marginBottom: SPACING.sm, 
            fontWeight: 'bold',
            color: COLORS.primary,
            fontSize: FONT_SIZES.subtitle 
          }}>
            ⌛ Pedidos en proceso
          </Text>
          {enProceso.map((o, orderIndex) => {
            const idx = o.status && o.status in STATUS_INDEX ? STATUS_INDEX[o.status] : 1;
            const platosArray = mapPlatos(o.platos);
            const total = platosArray.reduce((s, i) => s + i.dish.price * i.quantity, 0);
            const stepsToShow = STEPS; // Mostrar todos los pasos
            const orderId = (o as any).id || `temp-${orderIndex}`;

            return (
              <View key={orderId} style={{
                marginBottom: SPACING.lg,
                padding: SPACING.md,
                borderWidth: 1,
                borderColor: COLORS.grayLight,
                borderRadius: 10,
                backgroundColor: '#FFF8E1'
              }}>
                <Text style={{ fontWeight: 'bold', marginBottom: SPACING.sm }}>📦 Orden #{orderId}</Text>
                <Text>💵 Total: ${total.toLocaleString()}</Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: SPACING.md }}>
                  {stepsToShow.map((step, i) => {
                    const isActive = i <= idx;
                    return (
                      <View key={step.key} style={{ alignItems: 'center', flex: 1 }}>
                        <MaterialCommunityIcons
                          name={step.icon as any}
                          size={28}
                          color={isActive ? COLORS.primary : COLORS.grayLight}
                        />
                        <Text style={{
                          color: isActive ? COLORS.primary : COLORS.grayDark,
                          fontSize: 12,
                          textAlign: 'center'
                        }}>
                          {step.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {platosArray.map((i, index) => (
                  <Text key={index}>🍽 {i.dish.name} ×{i.quantity}</Text>
                ))}
              </View>
            );
          })}
        </View>
      )}

      {/* Pedidos completados */}
      {completados.length > 0 && (
        <>
          <Text style={{
            fontWeight: 'bold',
            marginTop: SPACING.lg,
            marginBottom: SPACING.sm
          }}>
            📚 Historial de pedidos
          </Text>
          {completados.map((o, orderIndex) => {
            const platosArray = mapPlatos(o.platos);
            const doneTime = new Date(o.created_at || 0).getTime() + (o.estimatedTime || 0) * 60 * 1000;
            const orderId = (o as any).id || `temp-${orderIndex}`;

            return (
              <View key={orderId} style={{
                marginBottom: SPACING.md,
                padding: SPACING.md,
                backgroundColor: COLORS.grayLight,
                borderRadius: 10
              }}>
                <Text style={{ fontWeight: 'bold' }}>
                  Orden #{orderId} — completada a las {formatTime(doneTime)}
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

      {listosPagar.length === 0 && enProceso.length === 0 && completados.length === 0 && (
        <View style={{ alignItems: 'center', marginTop: SPACING.xl }}>
          <Text style={{ fontSize: FONT_SIZES.subtitle, color: COLORS.grayDark }}>
            🕐 No hay pedidos registrados para esta mesa.
          </Text>
          <TouchableOpacity
            style={{
              marginTop: SPACING.lg,
              backgroundColor: COLORS.primary,
              padding: SPACING.md,
              borderRadius: 10,
              alignItems: 'center',
            }}
            onPress={() => {
              router.push({
                pathname: '/carta',
                params: {
                  mesaId: mesa_id ?? '',
                  sillaId: silla_id ?? '',
                  userId: user_id ?? '',
                  restauranteId: restaurante_id ?? '',
                },
              });
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              🍽️ Ver carta y hacer pedido
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}




// despues viene los tylesheet asi que no es necesario que los generes a menos que hagas unos nuevos si es necesario

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


import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Alert, Switch, Modal, Platform, StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useCarrito } from '../../context/CarritoContext';
import { useOrders } from '../../context/OrdersContext';
import { useQRParams } from '../../context/QRParamsContext';
import { QRParamsIndicator } from '../../components/QRParamsIndicator';
import { Config } from '../../constants/config';
import { Dish } from '../../context/MenuContext';
import { COLORS, FONT_SIZES, SPACING } from '../../theme';
import { ScrollView } from 'react-native-gesture-handler';

type CartItem = {
  dish: Dish;
  quantity: number;
};

export default function Pago() {
  const router = useRouter();
  const { qrParams, hasValidParams } = useQRParams();

  // Usar los parámetros del contexto QR
  const mesa_id = qrParams?.mesaId || '';
  const silla_id = qrParams?.sillaId || '';
  const user_id = qrParams?.userId || '';
  const restaurante_id = qrParams?.restauranteId || '';

  const { carrito, notes, limpiarCarrito } = useCarrito();
  const { orders, addOrder } = useOrders();

  const [method, setMethod] = useState<'efectivo' | 'tarjeta' | null>(null);
  const [waiterModal, setWaiterModal] = useState(false);
  const [tipIncluded, setTipIncluded] = useState(true);
  const [confirmModal, setConfirmModal] = useState(false);
  const [allUnpaidOrders, setAllUnpaidOrders] = useState<any[]>([]);
  const [platosData, setPlatosData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  if (!mesa_id || !silla_id || !user_id || !restaurante_id) {
    return (
      <View style={{ padding: 20 }}>
        <Text>❌ Faltan parámetros requeridos:</Text>
        <Text>Mesa ID: {mesa_id || 'NO DISPONIBLE'}</Text>
        <Text>Silla ID: {silla_id || 'NO DISPONIBLE'}</Text>
        <Text>User ID: {user_id || 'NO DISPONIBLE'}</Text>
        <Text>Restaurante ID: {restaurante_id || 'NO DISPONIBLE'}</Text>
        <Text style={{ marginTop: 10, color: COLORS.primary }}>
          Por favor accede mediante un código QR válido.
        </Text>
      </View>
    );
  }

  // Cargar platos y pedidos listos para pagar
  React.useEffect(() => {
    const fetchData = async () => {
      if (!user_id || !restaurante_id) return;
      
      setLoading(true);
      console.log('🔍 Cargando datos para:', { user_id, restaurante_id, mesa_id });
      
      try {
        // 1. Obtener todos los platos primero
        console.log('📋 Obteniendo información de platos...');
        const platosResponse = await fetch(
          `${Config.API_URL}/platos/?user_id=${user_id}&restaurante_id=${restaurante_id}`
        );
        const platosData = await platosResponse.json();
        
        if (platosData && platosData.platos) {
          setPlatosData(platosData.platos);
          console.log('✅ Platos cargados:', Object.keys(platosData.platos).length);
        }

        // 2. Obtener pedidos de la mesa usando el endpoint de detalles
        console.log('📦 Obteniendo pedidos de la mesa...');
        const response = await fetch(
          `${Config.API_URL}/pedidos/mesa/?user_id=${user_id}&restaurante_id=${restaurante_id}&mesa_id=${mesa_id}`
        );
        const data = await response.json();
        
        console.log('📥 Respuesta del servidor:', data);
        
        if (data && data.pedidos) {
          console.log('📦 Todos los pedidos de la mesa:', Object.keys(data.pedidos));
          
          // 3. Filtrar solo pedidos que estén entregados (listos para pagar)
          const pedidosEntregados = Object.entries(data.pedidos)
            .filter(([_, pedido]: [string, any]) => {
              const estado = pedido.estados?.estado_actual || '';
              console.log(`🔍 Pedido ${_}: estado=${estado}`);
              return estado === 'entregado';
            })
            .map(([id, pedido]: [string, any]) => {
              // 4. Mapear platos con información completa y calcular precios
              const platosConInfo = Object.entries(pedido.platos || {}).map(([platoId, platoInfo]: [string, any]) => {
                const platoDB = platosData.platos?.[platoId];
                return {
                  id: platoId,
                  nombre: platoDB?.nombre || `Plato ${platoId}`,
                  precio: platoDB?.precio || 0,
                  cantidad: platoInfo.cantidad || 0,
                  descripcion: platoDB?.descripcion || '',
                  imagen: platoDB?.imagenUrl?.[0] || null,
                  subtotal: (platoDB?.precio || 0) * (platoInfo.cantidad || 0)
                };
              });

              const totalPedido = platosConInfo.reduce((sum, plato) => sum + plato.subtotal, 0);

              return {
                id,
                ...pedido,
                platosConInfo,
                totalPedido,
                fechaEntrega: pedido.estados?.entregado ? new Date(pedido.estados.entregado).toLocaleString() : 'N/A'
              };
            });
          
          console.log('✅ Pedidos entregados procesados:', pedidosEntregados);
          setAllUnpaidOrders(pedidosEntregados);
          console.log('📋 Total pedidos listos para pagar:', pedidosEntregados.length);
        }
      } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        Alert.alert('Error', 'No se pudieron cargar los pedidos. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user_id, restaurante_id, mesa_id]);

  const lastUnpaidOrder = orders.findLast(o => !o.paid);
  const hasPendingOrder = carrito.length === 0 && !!lastUnpaidOrder;

  const items: CartItem[] = carrito.length > 0
    ? carrito
    : lastUnpaidOrder?.platos.map(plato => ({
        dish: {
          id: plato.id,
          name: plato.name,
          price: plato.price,
        },
        quantity: plato.quantity,
      })) ?? [];

  const notesToShow = carrito.length > 0 ? notes : lastUnpaidOrder?.notes ?? '';
  const hasItems = items.length > 0 || allUnpaidOrders.length > 0;

  // Calcular total basado en los precios reales del backend
  const carritoSubtotal = items.reduce((sum, i) => sum + i.dish.price * i.quantity, 0);
  
  // Calcular subtotal de pedidos entregados usando los precios reales
  const pedidosSubtotal = allUnpaidOrders.reduce((sum, pedido) => {
    return sum + (pedido.totalPedido || 0);
  }, 0);

  const subtotal = carritoSubtotal + pedidosSubtotal;
  const tipAmount = tipIncluded ? Math.round(subtotal * 0.1) : 0;
  const totalWithTip = subtotal + tipAmount;
  const estimatedTime = items.reduce((sum, i) => sum + i.quantity * 3, 0);

  const showWaiter = () => {
    setWaiterModal(true);
    setTimeout(() => {
      setWaiterModal(false);
      limpiarCarrito();
      router.replace({
        pathname: '/estado',
        params: { mesaId: mesa_id, sillaId: silla_id, userId: user_id, restauranteId: restaurante_id },
      });
    }, 2000);
  };

  async function iniciarPagoWebpay(total: number, pedidosIds: string[]) {
    try {
      console.log('🧾 Iniciando pago con pedidos:', pedidosIds);

      const payUrl = `${Config.API_URL}/pay?total=${total}&pedidos=${encodeURIComponent(JSON.stringify(pedidosIds))}&mesaId=${mesa_id}&sillaId=${silla_id}&userId=${user_id}&restauranteId=${restaurante_id}`;

      console.log('🔗 URL de pago:', payUrl);

      if (Platform.OS === 'web') {
        window.open(payUrl, '_blank');
        return;
      }

      const redirectUrl = Linking.createURL('/payment-complete');
      const result = await WebBrowser.openAuthSessionAsync(payUrl, redirectUrl);

      if (result.type === 'success' && result.url) {
        const { queryParams } = Linking.parse(result.url);
        const token_ws = String(queryParams?.token_ws ?? '');
        const approved = String(queryParams?.approved) === 'true';

        if (approved) {
          limpiarCarrito(); // ✅ Solo limpiar si fue aprobado
        }

        router.replace({
          pathname: '/estado',
          params: {
            mesaId: mesa_id,
            sillaId: silla_id,
            userId: user_id,
            restauranteId: restaurante_id,
            token_ws,
            approved: String(approved),
          },
        });
      } else {
        Alert.alert('Pago cancelado', 'No se completó la transacción.');
      }
    } catch (err) {
      console.error('[Pago] Error AuthSession:', err);
      Alert.alert('Error', 'No se pudo iniciar el pago');
    }
  }

  const confirmarPedido = async () => {
    setConfirmModal(false);

    try {
      // Obtener todos los IDs de pedidos entregados listos para pagar
      const pedidosIds = allUnpaidOrders.map(pedido => pedido.id);
      console.log('📋 Pedidos entregados encontrados:', allUnpaidOrders);
      console.log('🔢 IDs de pedidos a pagar:', pedidosIds);
      
      // Si hay carrito, crear nuevo pedido y agregarlo a la lista
      if (carrito.length > 0) {
        console.log('🛒 Creando nuevo pedido del carrito...');
        const newOrderId = await addOrder({
          user_id,
          restaurante_id,
          mesa_id,
          silla_id,
          platos: items.map(item => ({
            id: item.dish.id,
            name: item.dish.name,
            price: item.dish.price,
            quantity: item.quantity,
          })),
          detalle: notesToShow,
        });

        console.log('🧾 Nuevo pedido generado con ID:', newOrderId);
        pedidosIds.push(newOrderId);
      }

      // Validar que hay pedidos para pagar
      if (pedidosIds.length === 0) {
        Alert.alert('Error', 'No hay pedidos para pagar. Asegúrate de tener pedidos entregados o productos en el carrito.');
        return;
      }

      console.log('💳 Procesando pago para pedidos:', pedidosIds);
      console.log('💰 Total a pagar:', totalWithTip);

      if (method === 'tarjeta') {
        iniciarPagoWebpay(totalWithTip, pedidosIds);
      } else {
        // Para efectivo, mostrar modal del mesero
        showWaiter();
      }
    } catch (err) {
      console.error('❌ Error al confirmar pedido:', err);
      Alert.alert('Error', 'No se pudo confirmar el pedido: ' + (err as Error).message);
    }
  };

  const handlePagar = () => {
    console.log('🚀 Iniciando proceso de pago...');
    console.log('📊 Estado actual:', {
      hasItems,
      carritoLength: carrito.length,
      pedidosEntregados: allUnpaidOrders.length,
      method,
      total: totalWithTip
    });
    
    if (!hasItems) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de pagar o asegúrate de tener pedidos entregados pendientes.');
      return;
    }
    if (!method) {
      Alert.alert('Selecciona método', 'Elige efectivo o tarjeta.');
      return;
    }
    
    setConfirmModal(true);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>PAGO</Text>
      <QRParamsIndicator />

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Cargando pedidos...</Text>
        </View>
      ) : !hasItems ? (
        <Text style={styles.emptyText}>No hay productos en el carrito ni pedidos entregados listos para pagar</Text>
      ) : (
        <>
          {/* Mostrar pedidos entregados listos para pagar */}
          {allUnpaidOrders.length > 0 && (
            <>
              <Text style={styles.subheader}>📋 Pedidos entregados listos para pagar:</Text>
              {allUnpaidOrders.map((pedido) => (
                <View key={pedido.id} style={styles.orderCard}>
                  <Text style={styles.orderTitle}>Pedido #{pedido.id}</Text>
                  <Text style={styles.orderSubtitle}>
                    Entregado: {pedido.fechaEntrega}
                  </Text>
                  
                  {pedido.platosConInfo?.map((plato: any, i: number) => (
                    <View key={i} style={styles.orderItemRow}>
                      <Text style={styles.orderItem}>
                        🍽 {plato.nombre} x{plato.cantidad}
                      </Text>
                      <Text style={styles.orderItemPrice}>
                        ${plato.subtotal.toLocaleString()}
                      </Text>
                    </View>
                  ))}
                  
                  <View style={styles.orderTotalRow}>
                    <Text style={styles.orderTotal}>
                      Total: ${pedido.totalPedido.toLocaleString()}
                    </Text>
                  </View>
                  
                  {pedido.detalle && (
                    <Text style={styles.orderNotes}>📝 {pedido.detalle}</Text>
                  )}
                </View>
              ))}
              <View style={styles.divider} />
            </>
          )}

          {/* Mostrar items del carrito actual */}
          {items.length > 0 && (
            <>
              <Text style={styles.subheader}>🛒 Carrito actual:</Text>
              {items.map((item, i) => (
                <View key={i} style={styles.row}>
                  <Text style={styles.itemText}>{item.dish.name} ×{item.quantity}</Text>
                  <Text style={styles.itemText}>${(item.dish.price * item.quantity).toLocaleString()}</Text>
                </View>
              ))}
              <View style={styles.divider} />
            </>
          )}

          {/* Solo mostrar items del carrito si no hay carrito actual */}
          {items.length === 0 && carrito.length === 0 && lastUnpaidOrder && (
            <>
              {items.map((item, i) => (
                <View key={i} style={styles.row}>
                  <Text style={styles.itemText}>{item.dish.name} ×{item.quantity}</Text>
                  <Text style={styles.itemText}>${(item.dish.price * item.quantity).toLocaleString()}</Text>
                </View>
              ))}
            </>
          )}

          <View style={styles.divider} />
          <View style={styles.pricing}><Text>Subtotal</Text><Text>${subtotal.toLocaleString()}</Text></View>

          <View style={styles.tipRow}>
            <Text>Incluir propina (10%)</Text>
            <Switch value={tipIncluded} onValueChange={setTipIncluded} />
          </View>

          {tipIncluded && (
            <View style={styles.pricing}><Text>Propina</Text><Text>${tipAmount.toLocaleString()}</Text></View>
          )}

          <View style={[styles.pricing, { marginBottom: SPACING.lg }]}>
            <Text style={{ fontWeight: 'bold' }}>TOTAL</Text>
            <Text style={{ fontWeight: 'bold' }}>${totalWithTip.toLocaleString()}</Text>
          </View>

          {notesToShow && <Text style={styles.notes}>📋 Notas: {notesToShow}</Text>}

          <Text style={styles.subheader}>Método de pago</Text>
          <View style={styles.methods}>
            {(['tarjeta', 'efectivo'] as const).map(m => (
              <TouchableOpacity
                key={m}
                style={[styles.methodButton, method === m && { borderColor: COLORS.primary }]}
                onPress={() => setMethod(m)}
              >
                <Text style={styles.methodText}>
                  {m === 'tarjeta' ? '💳 Tarjeta' : '💵 Efectivo'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.payButton, { backgroundColor: COLORS.primary }]} onPress={handlePagar}>
            <Text style={styles.payText}>Pagar ahora</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Modal de confirmación */}
      <Modal visible={confirmModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>¿Confirmar pedido?</Text>
            <Text style={styles.modalMsg}>Total a pagar: ${totalWithTip}</Text>
            <TouchableOpacity onPress={confirmarPedido} style={[styles.payButton, { backgroundColor: COLORS.primary, marginTop: SPACING.sm }]}>
              <Text style={styles.payText}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setConfirmModal(false)} style={{ marginTop: SPACING.sm }}>
              <Text style={{ color: COLORS.grayDark }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal del mesero */}
      <Modal visible={waiterModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Mesero en camino</Text>
            <Text style={styles.modalMsg}>⏰ Tiempo estimado: {estimatedTime} minutos</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// Puedes usar tus estilos ya definidos, o agregarlos aquí si necesitas.



const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.md, backgroundColor: COLORS.white },
  header: { fontSize: FONT_SIZES.subtitle, fontWeight: 'bold', marginBottom: SPACING.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.xs },
  itemText: { fontSize: FONT_SIZES.body },
  divider: { height: 1, backgroundColor: COLORS.grayLight, marginVertical: SPACING.sm },
  pricing: { flexDirection: 'row', justifyContent: 'space-between' },
  tipRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: SPACING.sm },
  notes: { fontStyle: 'italic', color: COLORS.grayDark, marginVertical: SPACING.sm },
  subheader: { fontSize: FONT_SIZES.body, fontWeight: 'bold', marginTop: SPACING.lg },
  methods: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: SPACING.md },
  methodButton: { borderWidth: 2, borderColor: COLORS.grayLight, borderRadius: 8, padding: SPACING.sm, flex: 1, marginHorizontal: SPACING.xs, alignItems: 'center' },
  methodText: { fontSize: FONT_SIZES.body, fontWeight: 'bold' },
  payButton: { padding: SPACING.md, borderRadius: 8, alignItems: 'center', marginTop: SPACING.md },
  payText: { color: COLORS.white, fontSize: FONT_SIZES.body, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: COLORS.grayDark, marginTop: SPACING.lg },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: COLORS.white, padding: SPACING.lg, borderRadius: 12, alignItems: 'center', width: '80%' },
  modalTitle: { fontSize: FONT_SIZES.subtitle, fontWeight: 'bold', marginBottom: SPACING.sm },
  modalMsg: { fontSize: FONT_SIZES.body, color: COLORS.grayDark },
  orderCard: { 
    backgroundColor: '#f0f8ff', 
    padding: SPACING.sm, 
    borderRadius: 8, 
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50' 
  },
  orderTitle: { fontWeight: 'bold', fontSize: FONT_SIZES.body, marginBottom: SPACING.xs },
  orderSubtitle: { fontSize: FONT_SIZES.small, color: COLORS.grayDark, marginBottom: SPACING.xs },
  orderItemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  orderItem: { fontSize: FONT_SIZES.small, color: COLORS.grayDark, flex: 1 },
  orderItemPrice: { fontSize: FONT_SIZES.small, color: COLORS.primary, fontWeight: 'bold' },
  orderTotalRow: { marginTop: SPACING.xs, paddingTop: SPACING.xs, borderTopWidth: 1, borderTopColor: COLORS.grayLight },
  orderTotal: { fontSize: FONT_SIZES.body, fontWeight: 'bold', color: COLORS.primary, textAlign: 'right' },
  orderNotes: { fontSize: FONT_SIZES.small, fontStyle: 'italic', color: COLORS.grayDark, marginTop: SPACING.xs },
});

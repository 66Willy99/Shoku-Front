import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, Switch, Modal, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useCarrito, CartItem } from '../../context/CarritoContext';
import { useOrders } from '../../context/OrdersContext';
import { COLORS, FONT_SIZES, SPACING } from '../../theme';
import { Config } from '../../constants/config';

export default function Pago() {
  const router = useRouter();
  const { carrito, notes, limpiarCarrito } = useCarrito();
  const { orders, addOrder, markAsPaid } = useOrders();

  const [method, setMethod] = useState<'efectivo' | 'tarjeta' | 'qr' | null>(null);
  const [waiterModal, setWaiterModal] = useState(false);
  const [tipIncluded, setTipIncluded] = useState(true);
  const [confirmModal, setConfirmModal] = useState(false);

  const lastUnpaidOrder = orders.findLast(o => !o.paid);
  const hasPendingOrder = carrito.length === 0 && !!lastUnpaidOrder;

  const items = carrito.length > 0 ? carrito : lastUnpaidOrder?.items || [];
  const notesToShow = carrito.length > 0 ? notes : lastUnpaidOrder?.notes || '';
  const hasItems = items.length > 0;

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tipAmount = tipIncluded ? Math.round(subtotal * 0.1) : 0;
  const totalWithTip = subtotal + tipAmount;
  const estimatedTime = items.reduce((s, i) => s + i.quantity * 3, 0);

  const showWaiter = () => {
    setWaiterModal(true);
    setTimeout(() => {
      setWaiterModal(false);
      limpiarCarrito();
      router.replace('/estado');
    }, 2000);
  };

  async function iniciarPagoWebpay(total: number, orderId: number) {
    try {
      const payUrl = `${Config.API_URL}/pay?total=${total}&orderId=${orderId}`;

      if (Platform.OS === 'web') {
        window.open(payUrl, '_blank');
        return;
      }

      const redirectUrl = Linking.createURL('/payment-complete');
      const result = await WebBrowser.openAuthSessionAsync(payUrl, redirectUrl);

      if (result.type === 'success' && result.url) {
        const { queryParams } = Linking.parse(result.url);
        const token_ws = String(queryParams?.token_ws);
        const approved = String(queryParams?.approved) === 'true';

        if (approved) {
          markAsPaid(orderId);
          limpiarCarrito();
        }

        router.replace({
          pathname: '/estado',
          params: { token_ws, approved: String(approved) },
        });
      } else {
        Alert.alert('Pago cancelado', 'No se completó la transacción.');
      }
    } catch (err) {
      console.error('[Pago] Error AuthSession:', err);
      Alert.alert('Error', 'No se pudo iniciar el pago');
    }
  }
//confirmar pedido modal
  const confirmarPedido = () => {
    setConfirmModal(false);

    if (hasPendingOrder && lastUnpaidOrder) {
      // Pedido ya hecho, solo pagar
      if (method === 'tarjeta') {
        iniciarPagoWebpay(totalWithTip, lastUnpaidOrder.id);
      } else if (method === 'efectivo') {
        markAsPaid(lastUnpaidOrder.id);
        showWaiter();
      } else {
        markAsPaid(lastUnpaidOrder.id);
        Alert.alert('QR', 'Funcionalidad no implementada aún.');
        limpiarCarrito();
        router.replace('/estado');
      }
    } else {
      // Crear nuevo pedido antes de pagar
      const newOrderId = addOrder(items, notesToShow, tipIncluded, estimatedTime);

      if (method === 'tarjeta') {
        iniciarPagoWebpay(totalWithTip, newOrderId);
      } else if (method === 'efectivo') {
        markAsPaid(newOrderId);
        showWaiter();
      } else {
        markAsPaid(newOrderId);
        Alert.alert('QR', 'Funcionalidad no implementada aún.');
        limpiarCarrito();
        router.replace('/estado');
      }
    }
  };

  const handlePagar = () => {
    if (!hasItems) return Alert.alert('Carrito vacío', 'Agrega productos antes de pagar.');
    if (!method) return Alert.alert('Selecciona método', 'Elige efectivo, tarjeta o QR.');
    setConfirmModal(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>PAGO</Text>
      {!hasItems ? (
        <Text style={styles.emptyText}>No hay productos en el carrito</Text>
      ) : (
        <>
          {items.map((item: CartItem, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.itemText}>{item.name} ×{item.quantity}</Text>
              <Text style={styles.itemText}>
                ${(item.price * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />
          <View style={styles.pricing}>
            <Text>Subtotal</Text><Text>${subtotal.toLocaleString()}</Text>
          </View>

          <View style={styles.tipRow}>
            <Text>Incluir propina (10%)</Text>
            <Switch value={tipIncluded} onValueChange={setTipIncluded} />
          </View>
          {tipIncluded && (
            <View style={styles.pricing}>
              <Text>Propina</Text><Text>${tipAmount.toLocaleString()}</Text>
            </View>
          )}

          <View style={[styles.pricing, { marginBottom: SPACING.lg }]}>
            <Text style={{ fontWeight: 'bold' }}>TOTAL</Text>
            <Text style={{ fontWeight: 'bold' }}>${totalWithTip.toLocaleString()}</Text>
          </View>

          {notesToShow && <Text style={styles.notes}>📋 Notas: {notesToShow}</Text>}

          <Text style={styles.subheader}>Método de pago</Text>
          <View style={styles.methods}>
            {(['tarjeta', 'qr', 'efectivo'] as const).map(m => (
              <TouchableOpacity
                key={m}
                style={[styles.methodButton, method === m && { borderColor: COLORS.primary }]}
                onPress={() => setMethod(m)}
              >
                <Text style={styles.methodText}>
                  {m === 'tarjeta' && '💳 Tarjeta'}
                  {m === 'qr' && '📷 QR'}
                  {m === 'efectivo' && '💵 Efectivo'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.payButton, { backgroundColor: COLORS.primary }]}
            onPress={handlePagar}
          >
            <Text style={styles.payText}>Pagar ahora</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Modal 1: Confirmación del pedido */}
      <Modal visible={confirmModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>¿Confirmar pedido?</Text>
            <Text style={styles.modalMsg}>Total a pagar: ${totalWithTip}</Text>
            <TouchableOpacity
              onPress={confirmarPedido}
              style={[styles.payButton, { backgroundColor: COLORS.primary, marginTop: SPACING.sm }]}
            >
              <Text style={styles.payText}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setConfirmModal(false)}
              style={{ marginTop: SPACING.sm }}
            >
              <Text style={{ color: COLORS.grayDark }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Esperando atención */}
      <Modal visible={waiterModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Mesero en camino</Text>
            <Text style={styles.modalMsg}>⏰ Tiempo estimado: {estimatedTime} minutos</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
});

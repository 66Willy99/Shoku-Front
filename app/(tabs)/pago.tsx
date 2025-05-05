import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  Modal,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCarrito, CartItem } from '../../context/CarritoContext';
import { useOrders } from '../../context/OrdersContext';
import { COLORS, FONT_SIZES, SPACING } from '../../theme';

type PayMethod = 'efectivo' | 'tarjeta' | 'qr' | null;

export default function Pago() {
  const router = useRouter();
  const { carrito, notes, limpiarCarrito } = useCarrito();
  const { addOrder } = useOrders();

  const [method, setMethod]           = useState<PayMethod>(null);
  const [waiterModal, setWaiterModal] = useState(false);
  const [tipIncluded, setTipIncluded] = useState(true);

  const hasItems     = carrito.length > 0;
  const subtotal     = carrito.reduce((s, i) => s + i.price * i.quantity, 0);
  const tipAmount    = tipIncluded ? Math.round(subtotal * 0.1) : 0;
  const totalWithTip = subtotal + tipAmount;
  const estimatedTime= carrito.reduce((s, i) => s + i.quantity * 3, 0);

  const showWaiter = () => {
    setWaiterModal(true);
    setTimeout(() => {
      setWaiterModal(false);
      limpiarCarrito();
      router.replace('/estado');
    }, 2000);
  };

  const handlePagar = () => {
    if (!hasItems) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de pagar.');
      return;
    }
    if (!method) {
      Alert.alert('Selecciona método', 'Elige efectivo, tarjeta o QR.');
      return;
    }

    // Registramos el pedido
    addOrder(carrito, notes, method === 'efectivo', estimatedTime);

    if (method === 'efectivo') {
      showWaiter();
    } else if (method === 'tarjeta') {
      // Abre WebPay
      Linking.openURL('https://tu-webpay-sandbox.example.com/checkout')
        .catch(() => Alert.alert('Error', 'No se pudo abrir WebPay'));
      limpiarCarrito();
      router.replace('/estado');
    } else if (method === 'qr') {
      Alert.alert('Escaneo QR', 'Abriendo cámara para código QR…');
      // aquí meterías tu lógica de cámara
      limpiarCarrito();
      router.replace('/estado');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>PAGO</Text>

      {!hasItems ? (
        <Text style={styles.emptyText}>No hay productos en el carrito</Text>
      ) : (
        <>
          {carrito.map((item: CartItem, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.itemText}>
                {item.name} ×{item.quantity}
              </Text>
              <Text style={styles.itemText}>
                ${(item.price * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />
          <View style={styles.pricing}>
            <Text>Subtotal</Text>
            <Text>${subtotal.toLocaleString()}</Text>
          </View>

          <View style={styles.tipRow}>
            <Text>Incluir propina (10%)</Text>
            <Switch value={tipIncluded} onValueChange={setTipIncluded} />
          </View>
          {tipIncluded && (
            <View style={styles.pricing}>
              <Text>Propina</Text>
              <Text>${tipAmount.toLocaleString()}</Text>
            </View>
          )}

          <View style={[styles.pricing, { marginBottom: SPACING.lg }]}>
            <Text style={{ fontWeight: 'bold' }}>TOTAL</Text>
            <Text style={{ fontWeight: 'bold' }}>
              ${totalWithTip.toLocaleString()}
            </Text>
          </View>

          {notes ? <Text style={styles.notes}>📋 Notas: {notes}</Text> : null}

          <Text style={styles.subheader}>Método de pago</Text>
          <View style={styles.methods}>
            {(['tarjeta','qr','efectivo'] as PayMethod[]).map(m => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.methodButton,
                  method === m && { borderColor: COLORS.primary },
                ]}
                onPress={() => setMethod(m)}
              >
                <Text style={styles.methodText}>
                  {m === 'tarjeta'  && '💳 Tarjeta'}
                  {m === 'qr'       && '📷 QR'}
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

      <Modal
        visible={waiterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setWaiterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Mesero en camino</Text>
            <Text style={styles.modalMsg}>
              ⏰ Tiempo estimado: {estimatedTime} minutos
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, padding: SPACING.md, backgroundColor: COLORS.white },
  header:       { fontSize: FONT_SIZES.subtitle, fontWeight: 'bold', marginBottom: SPACING.sm },
  row:          { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.xs },
  itemText:     { fontSize: FONT_SIZES.body },
  divider:      { height: 1, backgroundColor: COLORS.grayLight, marginVertical: SPACING.sm },
  pricing:      { flexDirection: 'row', justifyContent: 'space-between' },
  tipRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: SPACING.sm },
  notes:        { fontStyle: 'italic', color: COLORS.grayDark, marginVertical: SPACING.sm },
  subheader:    { fontSize: FONT_SIZES.body, fontWeight: 'bold', marginTop: SPACING.lg },
  methods:      { flexDirection: 'row', justifyContent: 'space-around', marginVertical: SPACING.md },
  methodButton: { borderWidth: 2, borderColor: COLORS.grayLight, borderRadius: 8, padding: SPACING.sm, flex: 1, marginHorizontal: SPACING.xs, alignItems: 'center' },
  methodText:   { fontSize: FONT_SIZES.body, fontWeight: 'bold' },
  payButton:    { padding: SPACING.md, borderRadius: 8, alignItems: 'center', marginTop: SPACING.md },
  payText:      { color: COLORS.white, fontSize: FONT_SIZES.body, fontWeight: 'bold' },
  emptyText:    { textAlign: 'center', color: COLORS.grayDark, marginTop: SPACING.lg },

  /* Modal mesero */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalBox:     { backgroundColor: COLORS.white, padding: SPACING.lg, borderRadius: 12, alignItems: 'center', width: '80%' },
  modalTitle:   { fontSize: FONT_SIZES.subtitle, fontWeight: 'bold', marginBottom: SPACING.sm },
  modalMsg:     { fontSize: FONT_SIZES.body, color: COLORS.grayDark },
});

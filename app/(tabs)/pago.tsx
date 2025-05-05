// app/(tabs)/pago.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCarrito, CartItem } from '../../context/CarritoContext';
import { useOrders } from '../../context/OrdersContext';
import { COLORS, FONT_SIZES, SPACING } from '../../theme';

export default function Pago() {
  const router = useRouter();
  const { carrito, notes, limpiarCarrito } = useCarrito();
  const { addOrder } = useOrders();

  const [tipIncluded, setTipIncluded] = useState<boolean>(true);
  const hasItems = carrito.length > 0;

  const subtotal       = carrito.reduce((s, i) => s + i.price * i.quantity, 0);
  const tipAmount      = tipIncluded ? Math.round(subtotal * 0.10) : 0;
  const total          = subtotal + tipAmount;
  const estimatedTime  = carrito.reduce((s, i) => s + i.quantity * 3, 0);

  const handlePagar = () => {
    if (!hasItems) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de pagar.');
      return;
    }
    addOrder(carrito, notes, tipIncluded, estimatedTime);
    Alert.alert('Pago procesado', '¡Gracias por tu compra!');
    limpiarCarrito();
    router.replace('/estado');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>PAGO</Text>

      {hasItems ? (
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
            <Switch
              value={tipIncluded}
              onValueChange={setTipIncluded}
            />
          </View>

          {tipIncluded && (
            <View style={styles.pricing}>
              <Text>Propina</Text>
              <Text>${tipAmount.toLocaleString()}</Text>
            </View>
          )}

          <View style={[styles.pricing, { marginBottom: SPACING.lg }]}>
            <Text style={{ fontWeight: 'bold' }}>TOTAL</Text>
            <Text style={{ fontWeight: 'bold' }}>${total.toLocaleString()}</Text>
          </View>

          <Text style={styles.info}>
            Tiempo estimado: {estimatedTime} minutos
          </Text>
          {notes ? (
            <Text style={styles.info}>
              Notas: {notes}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.payButton,
              hasItems
                ? { backgroundColor: COLORS.primary }
                : { backgroundColor: COLORS.grayLight },
            ]}
            onPress={handlePagar}
          >
            <Text
              style={[
                styles.payText,
                hasItems ? { color: COLORS.white } : { color: COLORS.grayDark },
              ]}
            >
              Pagar ahora
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.emptyText}>No hay productos en el carrito</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, padding: SPACING.md, backgroundColor: COLORS.white },
  header:      { fontSize: FONT_SIZES.subtitle, fontWeight: 'bold', marginBottom: SPACING.sm },
  row:         { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.xs },
  itemText:    { fontSize: FONT_SIZES.body },
  divider:     { height: 1, backgroundColor: COLORS.grayLight, marginVertical: SPACING.sm },
  pricing:     { flexDirection: 'row', justifyContent: 'space-between' },
  tipRow:      {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  info:        { fontSize: FONT_SIZES.body, color: COLORS.grayDark, marginVertical: SPACING.sm },
  payButton:   { padding: SPACING.md, borderRadius: 8, alignItems: 'center', marginTop: SPACING.md },
  payText:     { fontSize: FONT_SIZES.body, fontWeight: 'bold' },
  emptyText:   { textAlign: 'center', color: COLORS.grayDark, marginTop: SPACING.lg },
});

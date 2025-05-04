// app/(tabs)/pago.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCarrito, CartItem } from '../../context/CarritoContext';
import { useOrders } from '../../context/OrdersContext';
import { COLORS, FONT_SIZES, SPACING } from '../../theme';

export default function Pago() {
  const router = useRouter();
  const { carrito, limpiarCarrito } = useCarrito();
  const { addOrder } = useOrders();

  const hasItems = carrito.length > 0;
  const subtotal = carrito.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tip      = Math.round(subtotal * 0.10);
  const total    = subtotal + tip;
  // Tiempo estimado: 3 min por unidad
  const estimatedTime = carrito.reduce((sum, i) => sum + i.quantity * 3, 0);

  const handlePagar = () => {
    if (!hasItems) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de pagar.');
      return;
    }
    // Agregar el pedido al historial con su tiempo estimado
    addOrder(carrito, estimatedTime);

    Alert.alert('Pago procesado', 'Gracias por tu compra');
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
          <View style={styles.pricing}>
            <Text>Propina (10%)</Text>
            <Text>${tip.toLocaleString()}</Text>
          </View>
          <View style={[styles.pricing, { marginBottom: SPACING.lg }]}>
            <Text style={{ fontWeight: 'bold' }}>TOTAL</Text>
            <Text style={{ fontWeight: 'bold' }}>${total.toLocaleString()}</Text>
          </View>

          <Text style={styles.info}>
            Tiempo estimado: {estimatedTime} minutos
          </Text>

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
  container: { flex: 1, padding: SPACING.md, backgroundColor: COLORS.white },
  header:    { fontSize: FONT_SIZES.subtitle, fontWeight: 'bold', marginBottom: SPACING.sm },
  row:       {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  itemText:  { fontSize: FONT_SIZES.body },
  divider:   {
    height: 1,
    backgroundColor: COLORS.grayLight,
    marginVertical: SPACING.sm,
  },
  pricing:   { flexDirection: 'row', justifyContent: 'space-between' },
  info:      {
    fontSize: FONT_SIZES.body,
    color: COLORS.grayDark,
    marginVertical: SPACING.sm,
  },
  payButton: {
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  payText:   { fontSize: FONT_SIZES.body, fontWeight: 'bold' },
  emptyText: {
    textAlign: 'center',
    color: COLORS.grayDark,
    marginTop: SPACING.lg,
  },
});

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCarrito, CartItem } from '../../context/CarritoContext';
import { COLORS, FONT_SIZES, SPACING } from '../../theme';

export default function Carrito() {
  const router = useRouter();
  const { carrito } = useCarrito();
  const hasItems = carrito.length > 0;

  // Generar orden y mesa solo una vez:
  const orderId = useMemo(
    () => Math.floor(1000 + Math.random() * 9000),
    []
  );
  const table = 5;

  // Calcular subtotal
  const subtotal = carrito.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tu Pedido</Text>

      {hasItems ? (
        <>
          <Text style={styles.subtitle}>
            Orden #{orderId} — Mesa {table}
          </Text>

          <ScrollView style={styles.list}>
            {carrito.map((item: CartItem, idx) => (
              <View key={idx} style={styles.row}>
                <Text style={styles.itemText}>
                  {item.name} ×{item.quantity}
                </Text>
                <Text style={styles.itemText}>
                  ${(item.price * item.quantity).toLocaleString()}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.pricing}>
            <Text>Subtotal</Text>
            <Text>${subtotal.toLocaleString()}</Text>
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => router.push('/pago')}
          >
            <Text style={styles.nextText}>✅ Continuar a Pagar</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.emptyText}>Tu carrito está vacío</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/carta')}
          >
            <Text style={styles.emptyText}>🛒 Ir a la Carta</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, padding: SPACING.md, backgroundColor: COLORS.white },
  header:      { fontSize: FONT_SIZES.subtitle, fontWeight: 'bold' },
  subtitle:    { fontSize: FONT_SIZES.body, color: COLORS.grayDark, marginBottom: SPACING.sm },
  list:        { flex: 1, marginBottom: SPACING.md },
  row:         {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: COLORS.grayLight,
    paddingVertical: SPACING.xs,
  },
  itemText:    { fontSize: FONT_SIZES.body },
  pricing:     {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  nextButton:  {
    backgroundColor: COLORS.secondary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextText:    {
    color: COLORS.white,
    fontSize: FONT_SIZES.body,
    fontWeight: 'bold',
  },
  emptyText:   {
    textAlign: 'center',
    color: COLORS.grayDark,
    padding: SPACING.md,
  },
  emptyButton: {
    backgroundColor: COLORS.grayLight,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
});

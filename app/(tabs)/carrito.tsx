import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCarrito, CartItem } from '../../context/CarritoContext';
import { useOrders } from '../../context/OrdersContext';
import { COLORS, FONT_SIZES, SPACING } from '../../theme';

export default function Carrito() {
  const router = useRouter();
  const { carrito, notes, setNotes, removeProducto, limpiarCarrito } = useCarrito();
  const { addOrder } = useOrders();

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const hasItems = carrito.length > 0;
  const subtotal = carrito.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const estimatedTime = carrito.reduce((sum, i) => sum + i.quantity * 3, 0);

  const handleConfirmar = () => {
    if (!hasItems) {
      Platform.OS === 'web'
        ? window.alert('Carrito vacío. Agrega productos antes de confirmar.')
        : Alert.alert('Carrito vacío', 'Agrega productos antes de confirmar.');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmarPedido = () => {
    setShowConfirmModal(false);
    addOrder(carrito, notes, false, estimatedTime);
    limpiarCarrito();
    router.replace('/estado');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛒 Tu Pedido</Text>

      {hasItems ? (
        <>
          <ScrollView style={styles.list}>
            {carrito.map((item: CartItem, idx) => (
              <View key={idx} style={styles.row}>
                <View>
                  <Text style={styles.itemName}>{item.name} × {item.quantity}</Text>
                  <Text style={styles.itemPrice}>${(item.price * item.quantity).toLocaleString()}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => removeProducto(item.name)}
                >
                  <Text style={styles.deleteText}>🗑 Eliminar</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <Text style={styles.subheader}>📋 Notas del pedido</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Sin cebolla / Alérgico a frutos secos"
            multiline
            value={notes}
            onChangeText={setNotes}
          />

          <View style={styles.pricing}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${subtotal.toLocaleString()}</Text>
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleConfirmar}
          >
            <Text style={styles.nextText}>✅ Confirmar pedido</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.emptyText}>Tu carrito está vacío.</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/carta')}
          >
            <Text style={styles.emptyBtnText}>🍽 Ver Carta</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Modal personalizado */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>¿Confirmar pedido?</Text>
            <Text style={styles.modalMsg}>Total a pagar: ${subtotal.toLocaleString()}</Text>
            <TouchableOpacity
              onPress={confirmarPedido}
              style={[styles.nextButton, { marginTop: SPACING.sm }]}
            >
              <Text style={styles.nextText}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowConfirmModal(false)}
              style={{ marginTop: SPACING.sm }}
            >
              <Text style={{ color: COLORS.grayDark }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  header: {
    fontSize: FONT_SIZES.subtitle,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    textAlign: 'center',
    color: COLORS.primary,
  },
  list: {
    flex: 1,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderColor: COLORS.grayLight,
  },
  itemName: {
    fontSize: FONT_SIZES.body,
    fontWeight: 'bold',
    color: COLORS.grayDark,
  },
  itemPrice: {
    fontSize: FONT_SIZES.body,
    color: COLORS.grayDark,
  },
  deleteBtn: {
    padding: SPACING.xs,
  },
  deleteText: {
    color: COLORS.secondary,
    fontSize: FONT_SIZES.body,
  },
  subheader: {
    fontSize: FONT_SIZES.body,
    fontWeight: 'bold',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 6,
    padding: SPACING.sm,
    minHeight: 60,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  pricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  totalLabel: {
    fontSize: FONT_SIZES.body,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: FONT_SIZES.body,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.body,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.grayDark,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    fontSize: FONT_SIZES.body,
  },
  emptyButton: {
    backgroundColor: COLORS.grayLight,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyBtnText: {
    color: COLORS.grayDark,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: FONT_SIZES.subtitle,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  modalMsg: {
    fontSize: FONT_SIZES.body,
    color: COLORS.grayDark,
  },
});

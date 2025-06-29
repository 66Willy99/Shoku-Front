// app/(tabs)/carrito.tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Modal, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCarrito, CartItem } from '../../context/CarritoContext';
import { useOrders } from '../../context/OrdersContext';
import { COLORS, FONT_SIZES, SPACING } from '../../theme';

export default function Carrito() {
  const router = useRouter();
  const { userId, restauranteId, mesaId, sillaId } = useLocalSearchParams<{
    userId?: string;
    restauranteId?: string;
    mesaId?: string;
    sillaId?: string;
  }>();

  const { carrito, notes, setNotes, removeProducto, limpiarCarrito, total } = useCarrito();
  const { addOrder } = useOrders();

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const hasItems = carrito.length > 0;
  const estimatedTime = carrito.reduce((sum, i) => sum + i.quantity * 3, 0);

  const handleConfirmar = () => {
    if (!hasItems) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de confirmar.');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmarPedido = async () => {
    if (!mesaId || !sillaId || !userId || !restauranteId) {
      Alert.alert('Error', 'Faltan datos para enviar el pedido.');
      return;
    }

    try {
      setShowConfirmModal(false);

      await addOrder({
        user_id: userId.toString(),
        restaurante_id: restauranteId.toString(),
        mesa_id: mesaId.toString(),
        silla_id: sillaId.toString(),
        platos: carrito.map(item => ({
          id: item.dish.id,
          name: item.dish.name,
          price: item.dish.price,
          quantity: item.quantity,
        })),
        detalle: notes,
      });

      limpiarCarrito();

      // ✅ Navegación hacia /estado con parámetros completos
      router.replace({
        pathname: '/estado',
        params: {
          mesa_id: mesaId,
          silla_id: sillaId,
          user_id: userId,
          restaurante_id: restauranteId,
        },
      });
    } catch (error) {
      console.error('❌ Error al confirmar pedido:', error);
      Alert.alert('Error', 'No se pudo enviar el pedido. Por favor, intenta nuevamente.');
    }
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
                  <Text style={styles.itemName}>
                    {item.dish.name} × {item.quantity}
                  </Text>
                  <Text style={styles.itemPrice}>
                    ${(item.dish.price * item.quantity).toLocaleString()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => removeProducto(item.dish.name)}
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
            <Text style={styles.totalValue}>${total.toLocaleString()}</Text>
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={handleConfirmar}>
            <Text style={styles.nextText}>✅ Confirmar pedido</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.emptyText}>Tu carrito está vacío.</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => {
              if (mesaId && sillaId && userId && restauranteId) {
                router.push({
                  pathname: '/carta',
                  params: {
                    mesa_id: mesaId,
                    silla_id: sillaId,
                    user_id: userId,
                    restaurante_id: restauranteId,
                  },
                });
              } else {
                router.push('/carta');
              }
            }}
          >
            <Text style={styles.emptyBtnText}>🍽 Ver Carta</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>¿Confirmar pedido?</Text>
            <Text style={styles.modalMsg}>Total: ${total.toLocaleString()}</Text>
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
  container: { flex: 1, padding: SPACING.md, backgroundColor: COLORS.background },
  header: { fontSize: FONT_SIZES.subtitle, fontWeight: 'bold', marginBottom: SPACING.md, textAlign: 'center', color: COLORS.primary },
  list: { flex: 1, marginBottom: SPACING.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.xs, borderBottomWidth: 1, borderColor: COLORS.grayLight },
  itemName: { fontSize: FONT_SIZES.body, fontWeight: 'bold', color: COLORS.grayDark },
  itemPrice: { fontSize: FONT_SIZES.body, color: COLORS.grayDark },
  deleteBtn: { padding: SPACING.xs },
  deleteText: { color: COLORS.secondary, fontSize: FONT_SIZES.body },
  subheader: { fontSize: FONT_SIZES.body, fontWeight: 'bold', marginTop: SPACING.md, marginBottom: SPACING.sm },
  input: { borderWidth: 1, borderColor: COLORS.grayLight, borderRadius: 6, padding: SPACING.sm, minHeight: 60, marginBottom: SPACING.md, backgroundColor: COLORS.white },
  pricing: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md },
  totalLabel: { fontSize: FONT_SIZES.body, fontWeight: 'bold' },
  totalValue: { fontSize: FONT_SIZES.body, fontWeight: 'bold' },
  nextButton: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: 8, alignItems: 'center' },
  nextText: { color: COLORS.white, fontSize: FONT_SIZES.body, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: COLORS.grayDark, marginTop: SPACING.lg, marginBottom: SPACING.md, fontSize: FONT_SIZES.body },
  emptyButton: { backgroundColor: COLORS.grayLight, padding: SPACING.md, borderRadius: 8, alignItems: 'center' },
  emptyBtnText: { color: COLORS.grayDark, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: COLORS.white, padding: SPACING.lg, borderRadius: 12, alignItems: 'center', width: '80%' },
  modalTitle: { fontSize: FONT_SIZES.subtitle, fontWeight: 'bold', marginBottom: SPACING.sm },
  modalMsg: { fontSize: FONT_SIZES.body, color: COLORS.grayDark },
});

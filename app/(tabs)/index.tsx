import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONT_SIZES, SPACING } from '../../theme';
import { useOrders } from '../../context/OrdersContext';

export default function Home() {
  const router = useRouter();
  const [waiterModal, setWaiterModal] = useState(false);
  const { orders } = useOrders();

  const showWaiter = () => {
    setWaiterModal(true);
    setTimeout(() => setWaiterModal(false), 2000);
  };

  // ✅ Mostrar botón si hay un pedido NO PAGADO, sin importar el estado
  const tienePedidoNoPagado = orders.some(o => !o.paid);

  return (
    <View style={styles.container}>
      {/* Logo principal */}
      <Image
        source={require('../../assets/images/shoku-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Ver Carta */}
      <TouchableOpacity
        onPress={() => router.push('/carta')}
        style={styles.button}
      >
        <Text style={styles.buttonText}>📋 Ver Carta</Text>
      </TouchableOpacity>

      {/* Llamar al mesero */}
      <TouchableOpacity
        onPress={showWaiter}
        style={[styles.button, styles.secondaryButton]}
      >
        <Text style={styles.buttonText}>🔔 Llamar a Mesero</Text>
      </TouchableOpacity>

      {/* Pagar pedido si hay alguno no pagado */}
      {tienePedidoNoPagado && (
        <TouchableOpacity
          onPress={() => router.push('/pago')}
          style={[styles.button, styles.payButton]}
        >
          <Text style={styles.buttonText}>💳 Pagar pedido actual</Text>
        </TouchableOpacity>
      )}

      {/* Modal de mesero en camino */}
      <Modal
        visible={waiterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setWaiterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>🧑‍🍳 Mesero en camino</Text>
            <Text style={styles.modalMsg}>⏰ Tiempo estimado: 3 minutos</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: SPACING.xl,
  },
  button: {
    width: '80%',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  payButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.body,
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

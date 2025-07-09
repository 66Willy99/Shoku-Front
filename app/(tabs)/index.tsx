import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONT_SIZES, SPACING } from '../../theme';
import { useOrders } from '../../context/OrdersContext';
import { useQRParams } from '../../context/QRParamsContext';
import { Config } from '../../constants/config';

export default function Home() {
  const router = useRouter();
  const { qrParams } = useQRParams();
  // Usar parámetros del contexto QR para identificación de mesa/usuario
  const mesa_id = qrParams?.mesaId || '';
  const silla_id = qrParams?.sillaId || '';
  const user_id = qrParams?.userId || '';
  const restaurante_id = qrParams?.restauranteId || '';

  const [waiterModal, setWaiterModal] = useState(false);
  const [isCallinguWaiter, setIsCallingWaiter] = useState(false);
  const { orders } = useOrders();

  const callWaiter = async () => {
    if (!user_id || !restaurante_id || !mesa_id) {
      Alert.alert(
        'Error',
        'No se puede llamar al mesero. Faltan parámetros de mesa o usuario.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsCallingWaiter(true);

    try {
      console.log('📞 Llamando mesero para mesa:', { user_id, restaurante_id, mesa_id });

      const response = await fetch(`${Config.API_URL}/mesa/llamar-garzon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user_id,
          restaurante_id: restaurante_id,
          mesa_id: mesa_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Mesero llamado exitosamente:', data);

      // Mostrar modal solo si el POST fue exitoso
      setWaiterModal(true);
      setTimeout(() => setWaiterModal(false), 3000);

    } catch (error) {
      console.error('❌ Error al llamar al mesero:', error);
      Alert.alert(
        'Error',
        'No se pudo notificar al mesero. Verifica tu conexión e intenta nuevamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCallingWaiter(false);
    }
  };

  const tienePedidoNoPagado = orders.some(o => !o.paid);

  const irACarta = () => {
    router.push('/carta');
  };

  const irAPago = () => {
    router.push('/pago');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/shoku-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <TouchableOpacity onPress={irACarta} style={styles.button}>
        <Text style={styles.buttonText}>📋 Ver Carta</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={callWaiter} style={[styles.button, styles.secondaryButton]}>
        <Text style={styles.buttonText}>🔔 Llamar a Mesero</Text>
      </TouchableOpacity>

      {tienePedidoNoPagado && (
        <TouchableOpacity onPress={irAPago} style={[styles.button, styles.payButton]}>
          <Text style={styles.buttonText}>💳 Pagar pedido actual</Text>
        </TouchableOpacity>
      )}

      <Modal visible={waiterModal} transparent animationType="fade">
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

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

export default function Home() {
  const router = useRouter();
  const [waiterModal, setWaiterModal] = useState(false);

  const showWaiter = () => {
    setWaiterModal(true);
    setTimeout(() => setWaiterModal(false), 2000);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/shoku-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Llamar a Mesero */}
      <TouchableOpacity
        onPress={showWaiter}
        style={[styles.button, { backgroundColor: COLORS.primary }]}
      >
        <Text style={styles.buttonText}>🔔 Llamar a Mesero</Text>
      </TouchableOpacity>
      {/* Pagar (deshabilitado si no hay productos) */}
      <TouchableOpacity
        onPress={() => router.push('/pago')}
        style={[styles.button, { backgroundColor: COLORS.primary }]}
      >
        <Text style={styles.buttonText}>💳 Pagar</Text>
      </TouchableOpacity>

      {/* Ver Carta */}
      <TouchableOpacity
        onPress={() => router.push('/carta')}
        style={[styles.button, { backgroundColor: COLORS.primary }]}
      >
        <Text style={styles.buttonText}>🛒 Ver Carta</Text>
      </TouchableOpacity>

      <Modal
        visible={waiterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setWaiterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Mesero en camino</Text>
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
    width: 120,
    height: 120,
    marginBottom: SPACING.xl,
  },
  button: {
    width: '70%',
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: SPACING.lg,
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

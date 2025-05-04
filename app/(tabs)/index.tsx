import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCarrito } from '../../context/CarritoContext';
import { COLORS, FONT_SIZES, SPACING } from '../../theme';

export default function Home() {
  const router = useRouter();
  const { carrito } = useCarrito();
  const hasItems = carrito.length > 0;

  const llamarMesero = () => {
    const title = 'Mesero en camino';
    const message = 'Tiempo estimado: 3 minutos.';
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handlePago = () => {
    if (!hasItems) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de pagar.');
      return;
    }
    router.push('/pago');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/shoku-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <TouchableOpacity
        onPress={llamarMesero}
        style={[styles.button, { backgroundColor: COLORS.primary }]}
      >
        <Text style={styles.buttonText}>🔔 Llamar a Mesero</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handlePago}
        style={{
          ...styles.button,
          backgroundColor: hasItems ? COLORS.primary : COLORS.grayLight,
        }}
      >
        <Text
          style={{
            ...styles.buttonText,
            color: hasItems ? COLORS.white : COLORS.grayDark,
          }}
        >
          💳 Pagar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/carta')}
        style={[styles.button, { backgroundColor: COLORS.primary }]}
      >
        <Text style={styles.buttonText}>🛒 Ver Carta</Text>
      </TouchableOpacity>
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
    fontSize: FONT_SIZES.body,
    fontWeight: 'bold',
  },
});

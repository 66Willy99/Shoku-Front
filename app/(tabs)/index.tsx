import { View, Text, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONT_SIZES, SPACING } from '../../theme';

export default function Home() {
  const router = useRouter();

  const llamarMesero = () =>
    Alert.alert('Llamar a Mesero', 'Un garzón ha sido notificado.');

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/shoku-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <TouchableOpacity
        onPress={llamarMesero}
        style={{ ...styles.button, backgroundColor: COLORS.primary }}
      >
        <Text style={styles.buttonText}>🔔 Llamar a Mesero</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/pago')}
        style={{ ...styles.button, backgroundColor: COLORS.primary }}
      >
        <Text style={styles.buttonText}>💳 Pagar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/carta')}
        style={{ ...styles.button, backgroundColor: COLORS.primary }}
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
    color: COLORS.white,
    fontSize: FONT_SIZES.body,
    fontWeight: 'bold',
  },
});

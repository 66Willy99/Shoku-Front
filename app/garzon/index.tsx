import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONT_SIZES, SPACING } from '../../theme';

export default function GarzonHome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/shoku-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/garzon/mesas')}
      >
        <Text style={styles.buttonText}>Mesas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/garzon/mesas abiertas')}
      >
        <Text style={styles.buttonText}>Mesas Abiertas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => router.push('/garzon/estado')}
      >
        <Text style={styles.buttonText}>Ver pedido</Text>
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
    width: 140,
    height: 140,
    marginBottom: SPACING.xl,
  },
  button: {
    width: '80%',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.body,
    fontWeight: 'bold',
  },
});

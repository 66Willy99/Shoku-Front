import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQRParams } from '../context/QRParamsContext';
import { COLORS, FONT_SIZES, SPACING } from '../theme';

export function QRParamsIndicator() {
  const { qrParams, hasValidParams, isLoading } = useQRParams();

  if (isLoading) {
    return null;
  }

  if (!hasValidParams) {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons name="qrcode-scan" size={16} color="#f39c12" />
        <Text style={styles.warningText}>
          Accede mediante QR para obtener la experiencia completa
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.validContainer]}>
      <MaterialCommunityIcons name="check-circle" size={16} color="#27ae60" />
      <Text style={styles.successText}>
        Mesa {qrParams?.mesaId} - Silla {qrParams?.sillaId}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xs,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.xs,
    borderRadius: 8,
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  validContainer: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  warningText: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.small,
    color: '#f39c12',
    textAlign: 'center',
    flex: 1,
  },
  successText: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.small,
    color: '#27ae60',
    fontWeight: '600',
  },
});

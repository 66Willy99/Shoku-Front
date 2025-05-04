import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet
  } from 'react-native';
  import * as WebBrowser from 'expo-web-browser';
  import { COLORS, FONT_SIZES, SPACING } from '../../theme';
  
  export default function Pago() {
    const handlePago = () =>
      WebBrowser.openBrowserAsync('https://tu-pasarela.com/checkout?monto=1000');
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>💳 Selecciona método</Text>
        <View style={styles.methods}>
          <TouchableOpacity style={styles.method}><Text>📱 QR</Text></TouchableOpacity>
          <TouchableOpacity style={styles.method}><Text>💵 Efectivo</Text></TouchableOpacity>
          <TouchableOpacity style={styles.method}><Text>➗ Dividir</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.payNow} onPress={handlePago}>
          <Text style={styles.payText}>Pagar ahora</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: { flex: 1, padding: SPACING.md, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' },
    title:     { fontSize: FONT_SIZES.subtitle, fontWeight: 'bold', marginBottom: SPACING.lg },
    methods:   { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: SPACING.lg },
    method:    { flex: 1, marginHorizontal: SPACING.xs, padding: SPACING.sm, backgroundColor: COLORS.grayLight, borderRadius: 8, alignItems: 'center' },
    payNow:    { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: 8 },
    payText:   { color: COLORS.white, fontSize: FONT_SIZES.body, fontWeight: 'bold' },
  });
  
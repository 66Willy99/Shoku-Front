import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet
  } from 'react-native';
  import { useRouter } from 'expo-router';
  import { COLORS, FONT_SIZES, SPACING } from '../../theme';
  
  export default function Estado() {
    const router = useRouter();
  
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>✅ Pedido realizado</Text>
        <Text style={styles.subtitle}>ORDEN #1234 — Mesa 5</Text>
        <Text style={styles.info}>Tiempo estimado: 15 minutos</Text>
  
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.backText}>← Volver al inicio</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
  
  const styles = StyleSheet.create({
    container:  { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.background },
    title:      { fontSize: FONT_SIZES.title, fontWeight: 'bold', marginBottom: SPACING.sm },
    subtitle:   { fontSize: FONT_SIZES.body, marginBottom: SPACING.xs },
    info:       { fontSize: FONT_SIZES.body, marginBottom: SPACING.lg },
    backButton: { padding: SPACING.sm, backgroundColor: COLORS.primary, borderRadius: 6 },
    backText:   { color: COLORS.white, fontSize: FONT_SIZES.body },
  });
  
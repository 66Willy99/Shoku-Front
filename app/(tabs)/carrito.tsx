import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet
  } from 'react-native';
  import { useRouter } from 'expo-router';
  import { useCarrito } from '../../context/CarritoContext';
  import { COLORS, FONT_SIZES, SPACING } from '../../theme';
  
  export default function Carrito() {
    const router = useRouter();
    const { carrito, limpiarCarrito } = useCarrito();
    const totalItems = carrito.length;
  
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Tu Pedido ({totalItems})</Text>
  
        <ScrollView style={styles.list}>
          {carrito.map((item, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.itemText}>{item}</Text>
              <Text style={styles.itemText}>$X.XXX</Text>
            </View>
          ))}
        </ScrollView>
  
        <TouchableOpacity
          style={styles.orderButton}
          onPress={() => {
            limpiarCarrito();
            router.push('/estado');
          }}
        >
          <Text style={styles.orderText}>✅ Realizar Pedido</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container:   { flex: 1, padding: SPACING.md, backgroundColor: COLORS.white },
    header:      { fontSize: FONT_SIZES.subtitle, fontWeight: 'bold', marginBottom: SPACING.sm },
    list:        { flex: 1 },
    row:         {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderColor: COLORS.grayLight,
      paddingVertical: SPACING.xs,
    },
    itemText:    { fontSize: FONT_SIZES.body },
    orderButton: {
      backgroundColor: COLORS.secondary,
      padding: SPACING.md,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: SPACING.sm,
    },
    orderText:   {
      color: COLORS.white,
      fontSize: FONT_SIZES.body,
      fontWeight: 'bold',
    },
  });
  
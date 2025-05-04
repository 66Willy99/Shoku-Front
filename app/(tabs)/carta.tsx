import { useState } from 'react';
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

const DATA = {
  Pastas:     ['Pasta Boloñesa','Pasta Carbonara','Lasaña','Canelones'],
  Bocadillos: ['Sándwich mixto','Sándwich vegetal','Bocadillo de jamón','Bocadillo de tortilla'],
  Ensaladas:  ['Ensalada César','Ensalada de Quesos','Ensalada Mixta','Ensalada de Verano'],
} as const;
type Category = keyof typeof DATA;

export default function Carta() {
  const router = useRouter();
  const cats = Object.keys(DATA) as Category[];
  const [sel, setSel] = useState<Category>(cats[0]);
  const { agregarProducto } = useCarrito();

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {cats.map(c => (
          <TouchableOpacity
            key={c}
            onPress={() => setSel(c)}
            style={
              sel === c
                ? { ...styles.catButton, backgroundColor: COLORS.primary }
                : styles.catButton
            }
          >
            <Text style={
              sel === c
                ? { ...styles.catText, color: COLORS.white }
                : styles.catText
            }>
              {c.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.list}>
        {DATA[sel].map(p => (
          <View key={p} style={styles.productRow}>
            <Text style={styles.productText}>{p}</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => agregarProducto(p)}
            >
              <Text style={styles.addText}>+ Agregar</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => router.push('/carrito')}
      >
        <Text style={styles.cartText}>🛒 Ver Pedido</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.white },
  catScroll:    { backgroundColor: COLORS.grayLight, padding: SPACING.sm },
  catButton:    {
    marginRight: SPACING.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    backgroundColor: COLORS.grayLight,
  },
  catText:      { fontSize: FONT_SIZES.small, color: COLORS.grayDark },
  list:         { flex: 1, padding: SPACING.md },
  productRow:   {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  productText:  { fontSize: FONT_SIZES.body },
  addButton:    {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 6,
  },
  addText:      { color: COLORS.white },
  cartButton:   {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    alignItems: 'center',
  },
  cartText:     {
    color: COLORS.white,
    fontSize: FONT_SIZES.body,
    fontWeight: 'bold',
  },
});

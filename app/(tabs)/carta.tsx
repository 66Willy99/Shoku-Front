import React, { useState } from 'react';
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
  Pastas: [
    'Pasta Boloñesa',
    'Pasta Carbonara',
    'Lasaña',
    'Canelones'
  ],
  Bocadillos: [
    'Sándwich mixto',
    'Sándwich vegetal',
    'Bocadillo de jamón',
    'Bocadillo de tortilla'
  ],
  Ensaladas: [
    'Ensalada César',
    'Ensalada de Quesos',
    'Ensalada Mixta',
    'Ensalada de Verano'
  ],
} as const;

const PRICE_LIST: Record<string, number> = {
  'Pasta Boloñesa': 8990,
  'Pasta Carbonara': 7990,
  Lasaña: 9500,
  Canelones: 9200,
  'Sándwich mixto': 4990,
  'Sándwich vegetal': 4490,
  'Bocadillo de jamón': 3990,
  'Bocadillo de tortilla': 3790,
  'Ensalada César': 5500,
  'Ensalada de Quesos': 6000,
  'Ensalada Mixta': 5200,
  'Ensalada de Verano': 5800,
};

type Category = keyof typeof DATA;

export default function Carta() {
  const router = useRouter();
  const { carrito, agregarProducto } = useCarrito();
  const categorias = Object.keys(DATA) as Category[];
  const [sel, setSel] = useState<Category>(categorias[0]);

  const hasItems = carrito.length > 0;

  return (
    <View style={styles.container}>
      {/* Selector de categorías */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
      >
        {categorias.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setSel(c)}
            style={[
              styles.catButton,
              sel === c && { backgroundColor: COLORS.primary },
            ]}
          >
            <Text
              style={[
                styles.catText,
                sel === c && { color: COLORS.white },
              ]}
            >
              {c.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista de productos con precio */}
      <ScrollView style={styles.list}>
        {DATA[sel].map((producto) => (
          <View key={producto} style={styles.productRow}>
            <View>
              <Text style={styles.productText}>{producto}</Text>
              <Text style={styles.priceText}>
                ${PRICE_LIST[producto].toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => agregarProducto(producto)}
            >
              <Text style={styles.addText}>+ Agregar</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Ver Pedido o aviso si está vacío */}
      {hasItems ? (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push('/carrito')}
        >
          <Text style={styles.cartText}>🛒 Ver Pedido ({carrito.length})</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.emptyText}>Agrega productos para ver tu pedido</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.white },
  catScroll:  { backgroundColor: COLORS.grayLight, padding: SPACING.sm },
  catButton:  {
    marginRight: SPACING.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    backgroundColor: COLORS.grayLight,
  },
  catText:    { fontSize: FONT_SIZES.small, color: COLORS.grayDark },
  list:       { flex: 1, padding: SPACING.md },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  productText:{ fontSize: FONT_SIZES.body },
  priceText:  { fontSize: FONT_SIZES.small, color: COLORS.grayDark },
  addButton:  {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 6,
  },
  addText:    { color: COLORS.white },
  cartButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    alignItems: 'center',
  },
  cartText:   {
    color: COLORS.white,
    fontSize: FONT_SIZES.body,
    fontWeight: 'bold',
  },
  emptyText:  {
    textAlign: 'center',
    color: COLORS.grayDark,
    padding: SPACING.md,
  },
});

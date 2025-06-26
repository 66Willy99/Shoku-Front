import React, { useRef, useEffect, useState } from 'react';
import {
  ScrollView, View, Text, Image, TouchableOpacity,
  StyleSheet, Dimensions, Animated,
} from 'react-native';
import { useMenu } from '../../context/MenuContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useCarrito } from '../../context/CarritoContext';
import { dishImages } from '../../assets/images';
import { COLORS, FONT_SIZES, SPACING } from '../../theme';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PAD = SPACING.md;
const GAP = SPACING.sm;
const CARD_W = (SCREEN_WIDTH - H_PAD * 2 - GAP) / 2;

type Dish = {
  name: string;
  price: number;
  description?: string;
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function Carta() {
  const { platos: allDishes } = useMenu();
  const { carrito } = useCarrito();
  const router = useRouter();

  // ✅ Parámetros completos
  const {
    mesa_id,
    silla_id,
    user_id,
    restaurante_id,
  } = useLocalSearchParams<{
    mesa_id?: string;
    silla_id?: string;
    user_id?: string;
    restaurante_id?: string;
  }>();

  const recommended = allDishes.slice(0, 6);
  const carouselRef = useRef<ScrollView>(null);
  let idx = 0;

  useEffect(() => {
    if (recommended.length < 2) return;
    const iv = setInterval(() => {
      idx = (idx + 1) % recommended.length;
      carouselRef.current?.scrollTo({
        x: idx * (CARD_W + GAP),
        animated: true,
      });
    }, 3000);
    return () => clearInterval(iv);
  }, [recommended]);

  const irAlCarrito = () => {
    if (mesa_id && silla_id && user_id && restaurante_id) {
      router.push({
        pathname: '/carrito',
        params: {
          mesa_id,
          silla_id,
          user_id,
          restaurante_id,
        },
      });
    } else {
      alert('Faltan parámetros para continuar el pedido');
    }
  };

  return (
    <View style={styles.fullScreen}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.mainTitle}>CARTA</Text>

        <Text style={styles.sectionTitle}>Recomendados</Text>
        <ScrollView
          ref={carouselRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_W + GAP}
          decelerationRate="fast"
          contentContainerStyle={styles.carouselContent}
        >
          {recommended.map((dish, i) => (
            <View
              key={dish.name}
              style={[styles.carouselItem, { marginRight: i < recommended.length - 1 ? GAP : 0 }]}
            >
              <Card dish={dish} />
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Todos los platos</Text>
        <View style={styles.grid}>
          {allDishes.map((dish) => (
            <View key={dish.name} style={styles.gridItem}>
              <Card dish={dish} />
            </View>
          ))}
        </View>
      </ScrollView>

      {carrito.length > 0 && (
        <TouchableOpacity style={styles.continuarBtn} onPress={irAlCarrito}>
          <Text style={styles.continuarText}>🧾 Continuar pedido</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function Card({ dish }: { dish: Dish }) {
  const { favorites, toggle } = useFavorites();
  const { agregarProducto } = useCarrito();
  const isFav = favorites.includes(dish.name);

  const scale = useRef(new Animated.Value(1)).current;
  const [feedback, setFeedback] = useState('');
  const fbOpacity = useRef(new Animated.Value(0)).current;

  const bump = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.2, friction: 3, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    Animated.sequence([
      Animated.timing(fbOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.delay(600),
      Animated.timing(fbOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const onAdd = () => {
    bump();
    agregarProducto(dish.name);
    showFeedback('¡Agregado!');
  };

  const onFav = () => {
    bump();
    toggle(dish.name);
    showFeedback(isFav ? 'Quitado' : 'Favorito');
  };

  return (
    <View style={styles.card}>
      <Image source={dishImages[dish.name]} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{dish.name}</Text>
        <Text style={styles.price}>${dish.price.toLocaleString()}</Text>
      </View>
      {dish.description && <Text style={styles.description}>{dish.description}</Text>}
      <View style={styles.actions}>
        <AnimatedTouchable onPress={onFav} style={{ transform: [{ scale }] }}>
          <Text style={[styles.icon, isFav && { color: COLORS.secondary }]}>
            {isFav ? '★' : '☆'}
          </Text>
        </AnimatedTouchable>
        <AnimatedTouchable onPress={onAdd} style={[styles.addBtn, { transform: [{ scale }] }]}>
          <Text style={styles.addText}>+ Agregar</Text>
        </AnimatedTouchable>
      </View>
      <Animated.View style={[styles.feedback, { opacity: fbOpacity }]}>
        <Text style={styles.feedbackText}>{feedback}</Text>
      </Animated.View>
    </View>
  );
}

// despues sigue los StyleSheet 


const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingHorizontal: H_PAD,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl + 80, // espacio extra para el botón flotante
  },
  mainTitle: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.subtitle,
    fontWeight: '600',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  carouselContent: {
    paddingVertical: SPACING.sm,
  },
  carouselItem: {
    width: CARD_W,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  gridItem: {
    width: CARD_W,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: {
    width: '100%',
    height: CARD_W,
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
  },
  name: {
    flex: 1,
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
  },
  price: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZES.small,
    color: COLORS.grayDark,
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  icon: {
    fontSize: 22,
    color: COLORS.grayDark,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 4,
  },
  addText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  feedback: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  feedbackText: {
    backgroundColor: COLORS.grayDark + '80',
    color: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    fontWeight: '600',
  },
  continuarBtn: {
    position: 'absolute',
    bottom: 20,
    left: '10%',
    right: '10%',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  continuarText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.body,
    fontWeight: 'bold',
  },
});

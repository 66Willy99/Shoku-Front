// app/_layout.tsx

import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts, Baloo2_400Regular, Baloo2_700Bold } from '@expo-google-fonts/baloo-2';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { MenuProvider } from '../context/MenuContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { OrdersProvider } from '../context/OrdersContext';
import { CarritoProvider } from '../context/CarritoContext';
import { StatusBar as RNStatusBar } from 'react-native';
import { useEffect } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { CarritoProvider } from '../context/CarritoContext';
import { AuthProvider } from '../context/authContext';


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [mounted, setMounted] = useState(false);
  const [ToastComponent, setToastComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    setMounted(true);

    if (Platform.OS !== 'web') {
      // Carga dinámica de Toast solo en móvil
      const T = require('react-native-toast-message').default;
      setToastComponent(() => T);
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <MenuProvider>
      <FavoritesProvider>
        <OrdersProvider>
          <CarritoProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                {/* Este maneja los colores principales de la barra*/}
                <RNStatusBar 
                barStyle="dark-content" 
                backgroundColor="transparent" 
                />
              <Stack
                screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" options={{ title: 'No encontrado' }} />
              </Stack>
              <StatusBar style="auto" />
              {/* Monta Toast solo en cliente móvil */}
              {mounted && ToastComponent && <ToastComponent />}
            </ThemeProvider>
          </CarritoProvider>
        </OrdersProvider>
      </FavoritesProvider>
    </MenuProvider>
  );
}

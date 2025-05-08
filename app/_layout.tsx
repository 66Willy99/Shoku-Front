import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts, Baloo2_400Regular, Baloo2_700Bold } from '@expo-google-fonts/baloo-2';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar as RNStatusBar } from 'react-native';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { CarritoProvider } from '../context/CarritoContext';
import { AuthProvider } from '../context/authContext';

// Evitamos que la splash screen se oculte antes de cargar todo
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [fontsLoaded] = useFonts({
        BalooRegular: Baloo2_400Regular,
        BalooBold: Baloo2_700Bold,
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <AuthProvider>
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
                <Stack.Screen name="+not-found" />
                </Stack>
            </ThemeProvider>
            </CarritoProvider>
        </AuthProvider>
    );
}

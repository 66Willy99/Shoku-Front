import { Stack, useSegments ,Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../../components/ui/CustomHeader';
import { useAuth } from '@/context/authContext';

export default function AdminLayout() {
    const { isAuthenticated, loading } = useAuth();
    const segments = useSegments();
    const [readyToRedirect, setReadyToRedirect] = useState(false);

    useEffect(() => {
        if (!loading) {
            // Espera unos milisegundos para que el router esté montado
            setTimeout(() => {
                setReadyToRedirect(true);
            }, 50);
        }
    }, [loading]);

    
    const isOnLoginPage = segments.join('/') === 'admin' || segments.join('/') === 'admin/index';

    if (loading || !readyToRedirect) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    if (!isAuthenticated && !isOnLoginPage) {
        console.log('No autenticado, redirigiendo a /admin');
        return <Redirect href="/admin" />;
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#eee9e5' }}>
        <CustomHeader excludeRoutes={['/admin']} />
        <Stack
            screenOptions={{
            headerShown: false,
            }}
        >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="add-restaurant" />
            <Stack.Screen name="reports" />
            <Stack.Screen name="restaurant" />
        </Stack>
        </View>
    );
}

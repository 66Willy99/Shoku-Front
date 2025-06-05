import { Stack, useSegments ,Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import CustomHeader from '../../components/ui/CustomHeader';
import { useAuth } from '@/context/authContext';
import { getSession } from '@/services/sessionService'; 
import { Colors } from '@/constants/Colors'; 

export default function AdminLayout() {
    const { isAuthenticated, loading } = useAuth();
    const segments = useSegments();
    const [readyToRedirect, setReadyToRedirect] = useState(false);
    const [hasRestaurants, setHasRestaurants] = useState<boolean | null>(null);

    useEffect(() => {
        const checkRestaurants = async () => {
            if (!loading) {
                try {
                    const session = await getSession();
                    if (session) {
                        setHasRestaurants(session.restaurantIds.length > 0);
                    } else {
                        setHasRestaurants(false);
                    }
                } catch (error) {
                    console.error('Error checking restaurants:', error);
                    setHasRestaurants(false);
                } finally {
                    setTimeout(() => {
                        setReadyToRedirect(true);
                    }, 50);
                }
            }
        };
        checkRestaurants();
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
    if (isAuthenticated && isOnLoginPage) {
        console.log('Autenticado, redirigiendo según restaurantes');
            return hasRestaurants 
                ? <Redirect href="/admin/restaurant" /> 
                : <Redirect href="/admin/add-restaurant" />;
    }

    return (
        <View style={{ flex: 1, backgroundColor: Colors.bg_light }}>
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
            <Stack.Screen name="workers" />
            <Stack.Screen name="tables" />
        </Stack>
        </View>
    );
}

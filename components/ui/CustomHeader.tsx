// components/CustomHeader.tsx
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import '../../global.css';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import { getSession } from '../../services/sessionService'; 
import BoldText from './CustomText';
import { Config } from '../../constants/config';


export default function CustomHeader({ excludeRoutes = [] }: { excludeRoutes?: string[] }) {
    const pathname = usePathname();
    const [userName, setUserName] = useState<string>('');
    const { isAuthenticated, logout } = useAuth();
    const [hasRestaurants, setHasRestaurants] = useState<boolean>(false);

    useEffect(() => {
        let isMounted = true; // Para evitar actualizar el estado si el componente se desmontó

        const loadUserData = async () => {
            try {
                const session = await getSession();
                if (session && isMounted) {
                    const response = await fetch(`${Config.API_URL}/user/?userId=${session.userId}`);

                    if (!response.ok) {
                        console.log('Error al obtener datos del usuario');
                    }

                    const userData = await response.json();
                    const userDetails = userData[session.userId];

                    setUserName(userDetails.nombre);
                    setHasRestaurants(session.restaurantIds.length > 0);
                }
            } catch (error) {
                console.error('Error al cargar datos del usuario header', error);
            }
        };

        if (isAuthenticated) {
            loadUserData();
        } else {
            setUserName('');
            setHasRestaurants(false);
        }

        return () => {
            isMounted = false;
        };
    }, [isAuthenticated]);

    const handleLogout = async () => {
        try {
            await logout();
            setUserName('');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    if(excludeRoutes.includes(pathname)) {
        return null;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <BoldText style={styles.title}>Shoku Admin</BoldText>
                <View style={styles.nav}>
                    <Link href="/admin/reports" style={styles.navLink}>
                        <BoldText>Reportes</BoldText>
                    </Link>
                    {hasRestaurants ? (
                        <Link href="/admin/restaurant" style={styles.navLink}>
                            <BoldText>Restaurante</BoldText>
                        </Link>
                    ) : (
                        <Link href="/admin/add-restaurant" style={styles.navLink}>
                            <BoldText>Añadir Restaurante</BoldText>
                        </Link>
                    )}
                </View>
                <View style={styles.logoutContainer}>
                    {userName && (
                        <BoldText style={styles.userName}>
                            {userName.charAt(0).toUpperCase() + userName.slice(1)}
                        </BoldText>
                    )}
                    <TouchableOpacity onPress={handleLogout}>
                        <Ionicons name="power" size={24} color={'white'} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: Colors.primary,
    },
    header: {
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: Colors.primary,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 20,
        fontFamily: 'BalooBold',
        color: 'white',
        paddingRight: 20,
    },
    nav: {
        flexDirection: 'row',
        gap: 10,
        flex: 1,
    },
    navLink: {
        fontSize: 20,
        fontFamily: 'BalooBold',
        padding: 8,
        borderRadius: 4,
        color: 'white',
    },
    logoutContainer: {
        marginLeft: 'auto',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    userName: {
        color: 'white',
        fontSize: 24,
        fontFamily: 'BalooBold',
    },
});
// components/CustomHeader.tsx
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import '../../global.css';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';

export default function CustomHeader({ excludeRoutes = [] }: { excludeRoutes?: string[] }) {
    const pathname = usePathname();
    const [userName, setUserName] = useState<string>('');
    const { logout } = useAuth();

    useEffect(() => {
        let isMounted = true; // Para evitar actualizar el estado si el componente se desmontó

        const fetchUserData = async () => {
            try {
                const userDataString = await AsyncStorage.getItem("userData");
                
                if (userDataString) {
                    const userData = JSON.parse(userDataString);
                    if (isMounted && userData.nombre) {
                        setUserName(userData.nombre);
                    }
                }
            } catch (error) {
                console.error("Error al cargar datos del usuario:", error);
            }
        };
        fetchUserData();
        const retryTimer = setTimeout(() => {
            fetchUserData();
        }, 300);

        return () => {
            isMounted = false;
            clearTimeout(retryTimer);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            await AsyncStorage.removeItem('userData');
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
                <Text style={styles.title}>Shoku Admin</Text>
                <View style={styles.nav}>
                    <Link href="/admin/reports" style={styles.navLink}>
                        <Text>Reportes</Text>
                    </Link>
                    <Link href="/admin/add-restaurant" style={styles.navLink}>
                        <Text>Añadir Restaurante</Text>
                    </Link>
                    <Link href="/admin/restaurant" style={styles.navLink}>
                        <Text>Restaurante</Text>
                    </Link>
                </View>
                <View style={styles.logoutContainer}>
                    {userName ? (
                        <Text style={styles.userName}>
                            {userName.charAt(0).toUpperCase() + userName.slice(1)}
                        </Text>
                    ) : null}
                    <TouchableOpacity onPress={handleLogout}>
                        <Ionicons name="power" size={24} color={Colors.light_primary} />
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
        color: Colors.light_primary,
    },
    logoutContainer: {
        marginLeft: 'auto',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    userName: {
        color: Colors.light_primary,
        fontSize: 24,
        fontFamily: 'BalooBold',
    },
});
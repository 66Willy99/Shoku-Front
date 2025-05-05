// components/CustomHeader.tsx
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { Colors } from '../../constants/Colors'

export default function CustomHeader({ excludeRoutes = [] }: { excludeRoutes?: string[] }) {
    const pathname = usePathname();

    if(excludeRoutes.includes(pathname)){
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
    },
    navLink: {
        fontSize: 20,
        fontFamily: 'BalooBold',
        padding: 8,
        borderRadius: 4,
        color: Colors.light_primary,
        paddingRight: 0,
    },
});
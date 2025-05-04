// components/CustomHeader.tsx
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';

export default function CustomHeader() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.title}>Shoku Admin</Text>
                <View style={styles.nav}>
                    <Link href="/admin" style={styles.navLink}>
                        <Text>Inicio</Text>
                    </Link>
                    <Link href="/admin/add-restaurant" style={styles.navLink}>
                        <Text>Añadir Restaurante</Text>
                    </Link>
                    <Link href="/admin/reports" style={styles.navLink}>
                        <Text>Reportes</Text>
                    </Link>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#ee7b6c',
    },
    header: {
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#ee7b6c',
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
        color: '#f3d5b3',
        paddingRight: 0,
    },
});
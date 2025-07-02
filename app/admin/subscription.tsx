import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSubscription } from '@/context/subscriptionContext';
import { SubscriptionLimits } from '@/constants/subscriptions';
import { Colors } from '@/constants/Colors';

const SubscriptionScreen = () => {
    const { nivel, cambiarNivel } = useSubscription();

    const niveles: (0 | 1 | 2)[] = [0, 1, 2];

    const formatearValor = (valor: number) => {
        return valor === Infinity ? 'Ilimitado' : valor;
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
        {niveles.map((n) => {
            const limites = SubscriptionLimits[n];
            const esActual = nivel === n;

            return (
            <View key={n} style={styles.card}>
                <Text style={styles.titulo}>{limites.nombre}</Text>
                <Text style={styles.detalle}>Mesas: {formatearValor(limites.mesas)}</Text>
                <Text style={styles.detalle}>Sillas: {formatearValor(limites.sillas)}</Text>
                <Text style={styles.detalle}>Platos: {formatearValor(limites.platos)}</Text>
                <Text style={styles.detalle}>Categorías: {formatearValor(limites.categorias)}</Text>

                <Pressable
                    style={[styles.boton, esActual && styles.botonDeshabilitado]}
                    disabled={esActual}
                    onPress={() => cambiarNivel(n)}
                    >
                    <Text style={styles.botonTexto}>
                        {esActual ? 'Suscripción actual' : `Cambiar a ${limites.nombre}`}
                    </Text>
                </Pressable>
            </View>
            );
        })}
        </ScrollView>
    );
};

export default SubscriptionScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 20,
        alignItems: 'center',
        backgroundColor: Colors.bg_light,
        width: '100%',
        height: '100%'
    },
    card: {
        width: '90%',
        padding: 20,
        borderRadius: 12,
        backgroundColor: '#fff',
        elevation: 4,
        borderColor: Colors.primary,
        borderWidth: 1,
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        color: Colors.primary,
        textAlign: 'center',
    },
    detalle: {
        fontSize: 16,
        marginVertical: 2,
        color: '#333',
    },
    boton: {
        marginTop: 15,
        backgroundColor: Colors.primary,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    botonTexto: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    botonDeshabilitado: {
        backgroundColor: '#999',
    },
});

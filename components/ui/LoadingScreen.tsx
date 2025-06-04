import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface LoadingScreenProps {
    message?: string;
}

export default function LoadingScreen({ message = 'Cargando...' }: LoadingScreenProps) {
    return (
        <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.text}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.bg_light,
    },
    text: {
        marginTop: 10,
        color: Colors.primary,
        fontSize: 16,
    },
});
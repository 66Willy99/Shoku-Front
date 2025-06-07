import React, { useState } from 'react'
import { Platform, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import "../../global.css";
import { Redirect } from 'expo-router';
import { Config } from '@/constants/config';

const _layout = () => {
    const [restaurantId, setrestaurantId] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async () => {
        try {
            const response = await fetch(`${Config.API_URL}/trabajador/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ restaurante_id: restaurantId, user: username, password : password })
            });
            if (!response.ok) {
                Alert.alert('Credenciales incorrectas');
                return;
            }
            const data = await response.json();
            localStorage.setItem('trabajador', JSON.stringify(data));
            if (data.rol === 'cocinero') {
                window.location.href = '/cocina';
            } else {
                Alert.alert('Login exitoso, pero no eres cocinero');
            }
        } catch (error) {
            Alert.alert('Error de conexión');
        }
    };

    if (Platform.OS !== "web") {
        return <Redirect href="/" />;
    }
    return (
        <View style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.title}>Login Trabajador</Text>
                <Text style={styles.label}>User ID del Dueño</Text>
                <TextInput
                    style={styles.input}
                    value={restaurantId}
                    onChangeText={setrestaurantId}
                    placeholder="Ingrese el user_id del dueño"
                    autoCapitalize="none"
                />
                <Text style={styles.label}>Usuario</Text>
                <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Ingrese su usuario"
                    autoCapitalize="none"
                />
                <Text style={styles.label}>Clave</Text>
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Ingrese su clave"
                    secureTextEntry
                />
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Ingresar</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: 320,
        backgroundColor: '#fff',
        padding: 32,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    title: {
        textAlign: 'center',
        marginBottom: 24,
        fontSize: 22,
        fontWeight: 'bold',
    },
    label: {
        marginTop: 8,
        marginBottom: 4,
        fontWeight: '500',
    },
    input: {
        width: '100%',
        padding: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 8,
    },
    button: {
        marginTop: 16,
        padding: 12,
        borderRadius: 4,
        backgroundColor: '#0070f3',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default _layout
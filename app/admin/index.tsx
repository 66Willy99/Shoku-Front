import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Colors } from '../../constants/Colors'; // Asegúrate de que la ruta sea correcta
import Icon from '../../components/ui/Icon'; // Asegúrate de que la ruta sea correcta
import { Config } from '../../constants/config'; // Asegúrate de que la ruta sea correcta
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authContext';

const LoginScreen = () => {
const router = useRouter();
const { login } = useAuth();
const [email, setEmail] = useState<string>('');
const [password, setPassword] = useState<string>('');

const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
    Alert.alert('Error', 'Por favor, completa todos los campos');
    console.log('Error', 'Por favor, completa todos los campos')
    return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
    Alert.alert('Error', 'Ingresa un correo electrónico válido');
    console.log('Error', 'Ingresa un correo electrónico válido')
    return;
    }

    try {
    // 1. Primero hacemos login para obtener el UID
    const loginResponse = await fetch(`${Config.API_URL}/user/auth`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        email: email.trim(),
        password: password.trim(),
        }),
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
        throw new Error(loginData.detail || 'Error en el inicio de sesión');
    }

    await AsyncStorage.setItem('userId', loginData.userId);
    await login(loginData.userId); 

    console.log('Login exitoso, UID:', loginData.uid);
    router.push({
        pathname: '/admin/add-restaurant'
    });

    // 2. Luego obtenemos los datos del usuario usando el UID
    const userResponse = await fetch(`${Config.API_URL}/user?userId=${loginData.uid}`);
    
    if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.detail || 'Error al obtener datos del usuario');
    }

    const userData = await userResponse.json();
    const userInfo = userData[loginData.uid]; // Extraemos los datos del objeto

    console.log('Datos del usuario:', userInfo); 

    // Guardamos los datos importantes
    await AsyncStorage.multiSet([
        ['authToken', loginData.token || ''], // Si tu API devuelve un token
        ['userId', loginData.uid],
        ['userData', JSON.stringify(userInfo)]
    ]);

    // Redirigimos según el nivel de suscripción
    

    } catch (error: any) {
    console.error('Error completo:', error);
    Alert.alert(
        'Error', 
        error.message || 'Ocurrió un error durante el proceso'
    );
    }
};

return (
    <View style={styles.container}>
        <View style={styles.primarySection}>
            <Icon color={Colors.light_primary} size={350} />
            <View style={{marginTop: 100 }}>
            <Text style={styles.titleText}>Shoku - 1.0.0</Text>
            <Text style={styles.titleText}>Gestor de restaurante</Text>
            </View>
        </View>

        <View style={styles.secondarySection}>
            <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Ingresar</Text>
            </TouchableOpacity>
        </View>
    </View>
);
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: Colors.bg_light,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginHorizontal: 150,
        marginBottom: 15,
        backgroundColor: '#fff',
        color: '#a4a3a3',
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 15,
        marginHorizontal: 150,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: Colors.bg_light,
        fontWeight: 'bold',
        fontSize: 16,
    },
    primarySection: {
        flex: 1,
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
    },
        secondarySection: {
            flex: 1,
            backgroundColor: Colors.bg_light,
            padding: 20,
            justifyContent: 'center',
        },
    titleText: {
        fontSize: 28,
        color: Colors.bg_light,
        fontFamily: 'BalooBold',
}

});

export default LoginScreen; // Exportamos como componente de pantalla
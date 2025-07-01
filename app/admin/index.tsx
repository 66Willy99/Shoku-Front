import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Colors } from '../../constants/Colors'; 
import Icon from '../../components/ui/Icon';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/authContext';
import BoldText from '@/components/ui/CustomText';
import { saveSession } from '../../services/sessionService'; 
import { Config } from '../../constants/config';
import LoadingScreen from '@/components/ui/LoadingScreen';


const LoginScreen = () => {
const router = useRouter();
const { login } = useAuth();
const [email, setEmail] = useState<string>('');
const [password, setPassword] = useState<string>('');
const [isSubmitting, setIsSubmitting] = useState(false);

const API_URL = Config.API_URL;
const API_URL_WS = Config.API_URL_LOCAL_WS;

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
    setIsSubmitting(true);
    try {
        // 1. Primero hacemos login para obtener el UID
        const loginResponse = await fetch(`${API_URL}/user/auth`, {
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

        console.log('Login exitoso, UID:', loginData.localId);

        const restaurantesResponse = await fetch(`${API_URL}/restaurants/?user_id=${loginData.localId}`);
        
        if (!restaurantesResponse.ok) {
            throw new Error('Error al obtener restaurantes');
        }

        const restaurantes = await restaurantesResponse.json();
        
        // Extraer solo los IDs (asumiendo que la API devuelve objeto con IDs como claves)
        const restaurantIds = Object.keys(restaurantes);

        console.log('Restaurantes:', restaurantIds);

        await login(loginData.localId, restaurantIds[0] || undefined);

        // Guardamos los datos importantes
        await saveSession({
            token: loginData.idToken,
            uid: loginData.localId,
            restaurantIds // Enviamos el array completo
        });
        

    } catch (error: any) {
        console.error('Error completo:', error);
        Alert.alert(
            'Error', 
            error.message || 'Ocurrió un error durante el proceso'
        );
    }finally{
        setIsSubmitting(false);
    }
};  

if (isSubmitting) {
    return (<LoadingScreen message="Iniciando sesion..." />);
}  

return (
    <View style={styles.container}>
        <View style={styles.primarySection}>
            <Icon color={Colors.light_primary} size={300} />
            <View style={{marginTop: 100 }}>
            <BoldText style={styles.titleText}>Shoku - 1.0.0</BoldText>
            <BoldText style={styles.titleText}>Gestor de restaurante</BoldText>
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
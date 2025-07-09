import React, { useState } from 'react';
import { Platform, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import "../../global.css";
import { Redirect, useRouter } from 'expo-router';
import { Config } from '@/constants/config';
import { Colors } from '../../constants/Colors';
import Icon from '../../components/ui/Icon';
import BoldText from '@/components/ui/CustomText';

const _layout = () => {
    const [restaurantId, setrestaurantId] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [redirect, setRedirect] = useState<string | null>(null);
    const router = useRouter();
    
    const { width, height } = Dimensions.get('window');
    const isTablet = width > 768;
    const isMobile = width <= 768;

    const handleSubmit = async () => {
        try {
            const response = await fetch(`${Config.API_URL}/trabajador/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ restaurante_id: restaurantId, user: username, password: password })
            });
            if (!response.ok) {
                Alert.alert('Credenciales incorrectas');
                return;
            }
            const data = await response.json();
            localStorage.setItem('trabajador', JSON.stringify(data));
            if (data.rol === 'cocinero') {
                setRedirect('/cocina');
            } else if (data.rol === 'garzon') {
                setRedirect('/garzon');
            } else {
                Alert.alert('Login exitoso, pero tu rol no tiene acceso.');
            }
        } catch (error) {
            Alert.alert('Error de conexión');
        }
    };

    if (Platform.OS !== "web") {
        return <Redirect href="/" />;
    }

    if (redirect) {
        router.replace(redirect as any);
        return null;
    }

    return (
        <View style={[styles.container, isMobile && styles.containerMobile]}>
            <View style={[styles.primarySection, isMobile && styles.primarySectionMobile]}>
                <Icon color={Colors.light_primary} size={isMobile ? 120 : 300} />
                <View style={isMobile ? styles.titleContainerMobile : {marginTop: 100}}>
                    <BoldText style={[styles.titleText, isMobile && styles.titleTextMobile]}>Shoku - 1.0.0</BoldText>
                    <BoldText style={[styles.titleText, isMobile && styles.titleTextMobile]}>Login Trabajador</BoldText>
                </View>
            </View>

            <View style={[styles.secondarySection, isMobile && styles.secondarySectionMobile]}>
                <Text style={[styles.label, isMobile && styles.labelMobile]}>Restaurante ID</Text>
                <TextInput
                    style={[styles.input, isMobile && styles.inputMobile]}
                    value={restaurantId}
                    onChangeText={setrestaurantId}
                    placeholder="Ingrese el ID del restaurante"
                    autoCapitalize="none"
                />
                
                <Text style={[styles.label, isMobile && styles.labelMobile]}>Usuario</Text>
                <TextInput
                    style={[styles.input, isMobile && styles.inputMobile]}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Ingrese su usuario"
                    autoCapitalize="none"
                />
                
                <Text style={[styles.label, isMobile && styles.labelMobile]}>Clave</Text>
                <TextInput
                    style={[styles.input, isMobile && styles.inputMobile]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Ingrese su clave"
                    secureTextEntry
                />
                
                <TouchableOpacity style={[styles.button, isMobile && styles.buttonMobile]} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Ingresar</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: Colors.bg_light,
    },
    containerMobile: {
        flexDirection: 'column',
    },
    primarySection: {
        flex: 1,
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
    },
    primarySectionMobile: {
        flex: 0.4,
        flexDirection: 'column',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    secondarySection: {
        flex: 1,
        backgroundColor: Colors.bg_light,
        padding: 20,
        justifyContent: 'center',
    },
    secondarySectionMobile: {
        flex: 0.6,
        paddingHorizontal: 30,
        paddingVertical: 20,
    },
    titleText: {
        fontSize: 28,
        color: Colors.bg_light,
        fontFamily: 'BalooBold',
    },
    titleTextMobile: {
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 5,
    },
    titleContainerMobile: {
        marginTop: 20,
        alignItems: 'center',
    },
    label: {
        marginTop: 8,
        marginBottom: 4,
        fontWeight: '500',
        color: Colors.light.text,
        marginHorizontal: 150,
    },
    labelMobile: {
        marginHorizontal: 0,
        fontSize: 16,
        marginBottom: 8,
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
    inputMobile: {
        marginHorizontal: 0,
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 15,
        marginHorizontal: 150,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonMobile: {
        marginHorizontal: 0,
        marginTop: 10,
        paddingVertical: 18,
    },
    buttonText: {
        color: Colors.bg_light,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default _layout;
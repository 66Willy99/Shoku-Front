import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Colors } from '../../constants/Colors'; // Asegúrate de que la ruta sea correcta

const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }
    // Validación básica de email (opcional)
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert('Error', 'Ingresa un correo electrónico válido');
      return;
    }
    Alert.alert('Éxito', 'Inicio de sesión exitoso');
    navigation.navigate('Home'); // Redirige a Home después del login
  };

  return (
    <View style={styles.container}>
        <View style={styles.primarySection} />

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
    backgroundColor: Colors.primary
  },
    secondarySection: {
        flex: 1,
        backgroundColor: Colors.bg_light,
        padding: 20,
        justifyContent: 'center',
    },
});

export default LoginScreen; // Exportamos como componente de pantalla
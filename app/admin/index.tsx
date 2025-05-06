import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Colors } from '../../constants/Colors'; // Asegúrate de que la ruta sea correcta
import Icon from '../../components/ui/Icon'; // Asegúrate de que la ruta sea correcta
import { Config } from '../../constants/config'; // Asegúrate de que la ruta sea correcta

const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }
  
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert('Error', 'Ingresa un correo electrónico válido');
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:8000/user/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.detail || 'Error en el inicio de sesión');
      }
  
      // Si llega aquí, la respuesta fue exitosa (2xx)
      console.log('Inicio de sesión exitoso:', data);
      // navigation.navigate('/admin/home'); // Navega a la pantalla de inicio del administrador
      
    } catch (error: any) {
      console.error('Error completo:', error);
      Alert.alert(
        'Error', 
        error.message || 'No se pudo conectar al servidor. Verifica tu conexión.'
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
import { Platform, View, Text, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { Pressable, TextInput } from 'react-native-gesture-handler';
import { Colors } from '../../constants/Colors';
import BoldText from '@/components/ui/CustomText';
import React from 'react';

export default function AdminScreen() {
    if (Platform.OS !== 'web') {
        return <Redirect href="/" />; 
    }
    const [formData, setFormData] = React.useState({
        nombre: '',
        direccion: '',
        telefono: ''
    });
    
    const handleSubmit = () => {
        console.log('Datos enviados:', formData);
        // Lógica para guardar
    };
    

    return (
        <View style={styles.container}>
            <BoldText style={styles.title}>Crea tu restaurante</BoldText>
            <View style={styles.formContainer}>
                <BoldText style={styles.textForm}>Nombre del restaurante</BoldText>
                <TextInput 
                    style={styles.input}
                    placeholder='Nombre'
                    value={formData.nombre}
                    onChangeText={(text) => setFormData({...formData, nombre: text})} />
                <BoldText style={styles.textForm}>Dirección</BoldText>
                <TextInput 
                    style={styles.input}
                    placeholder='Dirección' 
                    value={formData.direccion}
                    onChangeText={(text) => setFormData({...formData, direccion: text})} />
                <BoldText style={styles.textForm}>Teléfono</BoldText>
                <TextInput 
                    style={styles.input}
                    placeholder='Teléfono' 
                    value={formData.telefono}
                    keyboardType="phone-pad"
                    onChangeText={(text) => setFormData({...formData, telefono: text})} />
            </View>
            <Pressable style={styles.button} onPress={handleSubmit}>
                <BoldText style={styles.textButton}>Crear</BoldText>
            </Pressable>
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
    title: {
        fontSize: 50,
        color: Colors.primary, 
        padding: 20
    },
    formContainer:{
        alignItems: 'center',
        backgroundColor: Colors.primary,
        padding: 20,
        borderRadius: 10,
    },
    textForm:{
        fontSize: 25,
        color: Colors.light_primary,
    },
    input: {
        height: 50,
        width: '95%',
        borderColor: '#cccccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginHorizontal: 130,
        marginBottom: 15,
        backgroundColor: '#ffffff',
        color: Colors.grey,
        textAlign: 'center',
        fontFamily: 'BalooBold',
        fontSize: 20,
    },
    button: {
        backgroundColor: Colors.primary,
        height: 50,
        marginTop: 30,
        paddingHorizontal: 250,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 90,
    },
    textButton: {
        fontSize: 20,
        color: '#ffffff'
    }
});
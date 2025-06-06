import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Animated, Easing, ActivityIndicator  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '@/constants/config';
import { Colors } from '@/constants/Colors';
import BoldText from '@/components/ui/CustomText';
import { Pressable } from 'react-native-gesture-handler';
import LoadingScreen from '@/components/ui/LoadingScreen';

type Mesa = {
    capacidad: number;
    numero: number;
    estado: string;
};

export default function MesaTable() {
    const [mesas, setMesas] = useState<{ [id: string]: Mesa }>({});
    const [loading, setLoading] = useState(true);
    const [selectedMesaId, setSelectedMesaId] = useState<string | null>(null);
    const [formValues, setFormValues] = useState<Mesa>({ capacidad: 0, numero: 0, estado: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);


    const tablePosition = useRef(new Animated.Value(0)).current;
    const formOpacity = useRef(new Animated.Value(0)).current;

    const fetchMesas = async () => {
        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const restauranteId = await AsyncStorage.getItem('restaurantId');
            const response = await fetch(`${Config.API_URL}/mesa/all?user_id=${userId}&restaurante_id=${restauranteId}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail);
            setMesas(data.mesas);
        } catch (err) {
            console.error('Error al obtener mesas:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id: string) => {
        const mesa = mesas[id];
        setSelectedMesaId(id);
        setFormValues(mesa);
        Animated.parallel([
            Animated.timing(tablePosition, {
                toValue: -100,
                duration: 200,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.ease),
            }),
            Animated.timing(formOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleCancel = () => {
        Animated.parallel([
            Animated.timing(tablePosition, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease),
            }),
            Animated.timing(formOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setSelectedMesaId(null);
        });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const restauranteId = await AsyncStorage.getItem('restaurantId');
            if (!selectedMesaId) return;

            await fetch(`${Config.API_URL}/mesa/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                user_id: userId,
                restaurante_id: restauranteId,
                mesa_id: selectedMesaId,
                ...formValues,
                }),
            });

            await fetchMesas();
            handleCancel();
        } catch (error) {
            console.error('Error al actualizar la mesa:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchMesas();
    }, []);

    if (isSubmitting) {
        return (<LoadingScreen message="Actualizando mesa..." />);
    }   

    if (loading) {
        return (<LoadingScreen message="Cargando mesas..." />);
    }   

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <Animated.View style={[styles.tableContainer, { transform: [{ translateX: tablePosition }] }]}>
                    <BoldText style={styles.title}>Mesas</BoldText>
                    <ScrollView horizontal>
                        <View>
                            <View style={styles.headerRow}>
                                <BoldText style={styles.headerCell}>Número</BoldText>
                                <BoldText style={styles.headerCell}>Sillas</BoldText>
                                <BoldText style={styles.headerCell}>Estado</BoldText>
                                <BoldText style={styles.headerCell}>Opciones</BoldText>
                            </View>
                            {Object.entries(mesas).map(([id, mesa], index, array) => {
                                const isLast = index === array.length - 1;
                                return (
                                <View key={id} style={[styles.row, isLast && styles.lastRow]}>
                                    <BoldText style={styles.cell}>{mesa.numero}</BoldText>
                                    <BoldText style={styles.cell}>{mesa.capacidad}</BoldText>
                                    <BoldText style={styles.cell}>
                                        {mesa.estado.charAt(0).toUpperCase() + mesa.estado.slice(1)}
                                    </BoldText>
                                    <View style={styles.cellButtonContainer}>
                                    <Pressable style={styles.button} onPress={() => handleEdit(id)}>
                                        <BoldText style={styles.textButton}>Editar</BoldText>
                                    </Pressable>
                                    </View>
                                </View>
                                );
                            })}
                        </View>
                    </ScrollView>
                </Animated.View>

                {selectedMesaId && (
                    <Animated.View style={[styles.formContainer, { opacity: formOpacity }]}>
                        <BoldText style={styles.titleForm}>Editar Mesa {String(formValues.numero)}</BoldText>
                        <BoldText style={styles.camposForm}>Nº Mesa:</BoldText>
                        <TextInput
                        style={styles.input}
                        value={String(formValues.numero)}
                        onChangeText={(val) => setFormValues({ ...formValues, numero: parseInt(val) || 0 })}
                        placeholder="Número"
                        keyboardType="numeric"
                        />
                        <BoldText style={styles.camposForm}>Capacidad:</BoldText>
                        <TextInput
                        style={styles.input}
                        value={String(formValues.capacidad)}
                        onChangeText={(val) => setFormValues({ ...formValues, capacidad: parseInt(val) || 0 })}
                        placeholder="Capacidad"
                        keyboardType="numeric"
                        />
                        <BoldText style={styles.camposForm}>Estado:</BoldText>
                        <TextInput
                        style={styles.input}
                        value={formValues.estado}
                        onChangeText={(val) => setFormValues({ ...formValues, estado: val })}
                        placeholder="Estado"
                        />
                        <View style={styles.formButtons}>
                        <Pressable style={[styles.button, { backgroundColor: 'gray' }]} onPress={handleCancel}>
                            <BoldText style={styles.textButton}>Cancelar</BoldText>
                        </Pressable>
                        <Pressable style={styles.button} onPress={handleSubmit}>
                            <BoldText style={styles.textButton}>Guardar</BoldText>
                        </Pressable>
                        </View>
                    </Animated.View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bg_light,
        alignItems: 'center',
    },
    title: {
        fontSize: 34,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 10,
        textAlign: 'center',
    },
    titleForm: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 5,
        textAlign: 'center',
    },
    camposForm: {
        fontSize: 18,
        color: Colors.primary,
        textAlign: 'center',
    },
    contentContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 100,
    },
    tableContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderTopStartRadius: 10,
        borderTopEndRadius: 10,
        minWidth: 450,
        paddingHorizontal: 10,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: Colors.primary,
        minWidth: 500,
        minHeight: 60,
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    lastRow: {
        borderBottomStartRadius: 10,
        borderBottomEndRadius: 10,
    },
    headerCell: {
        textAlign: 'center',
        fontSize: 16,
        padding: 20,
        flex: 1,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    cell: {
        flex: 1,
        textAlign: 'center',
        fontSize: 16,
        color: Colors.primary,
        paddingVertical: 10,
    },
    cellButtonContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
    },
    button: {
        backgroundColor: Colors.primary,
        width: 100,
        height: 50,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
    },
    textButton: {
        fontSize: 16,
        color: '#ffffff',
    },
    formContainer: {
        width: 250,
        padding: 10,
        marginLeft: 20,
        marginRight: 150,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 3,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 8,
        padding: 10,
        marginVertical: 5,
    },
    formButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
});

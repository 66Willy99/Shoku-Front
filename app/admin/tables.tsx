import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Animated, Easing, ActivityIndicator  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '@/constants/config';
import { Colors } from '@/constants/Colors';
import BoldText from '@/components/ui/CustomText';
import { Pressable } from 'react-native-gesture-handler';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Picker } from "@react-native-picker/picker";
import Icon from 'react-native-vector-icons/FontAwesome';
import Swal from 'sweetalert2';
import { useSweetAlertWatcher } from '@/hooks/sweetAlertWatcher';
import { useSubscription } from '@/context/subscriptionContext';

type Mesa = {
    capacidad: number;
    numero: number;
    estado: string;
};

export default function MesaTable() {
    const [mesas, setMesas] = useState<{ [id: string]: Mesa }>({});
    const [loading, setLoading] = useState(true);
    const [selectedMesaId, setSelectedMesaId] = useState<string | null>(null);
    const [formValues, setFormValues] = useState<Mesa>({ capacidad: 0, numero: 0, estado: 'disponible' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [showTable, setShowTable] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [totalSillasActuales, setTotalSillasActuales] = useState<number>(0);

    const tableMargin = useRef(new Animated.Value(0)).current;
    const formOpacity = useRef(new Animated.Value(0)).current;
    interface Silla {
        numero: number;
        mesa_id: string;
    }
    interface SillasResponse {
        sillas: { [id: string]: Silla };
    }

    const { puedeCrearMesa, puedeCrearSilla ,limites } = useSubscription();

    useSweetAlertWatcher(
        () => {
            setShowTable(false);
            setShowForm(false); 
        },
        () => {
            setTimeout(() => {
            setShowTable(true);
            setShowForm(true); 
            }, 150);
        }
    );

    //region Obtener mesas
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

    const fetchSillasTotales = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const restauranteId = await AsyncStorage.getItem('restaurantId');
            const res = await fetch(`${Config.API_URL}/silla/all?user_id=${userId}&restaurante_id=${restauranteId}`);
            const data = await res.json();
            const total = Object.keys(data.sillas || {}).length;
            setTotalSillasActuales(total);
        } catch (error) {
            console.error('Error obteniendo sillas:', error);
        }
    };

    const noHayMesas = Object.keys(mesas).length === 0;
    //endregion Obtener mesas

    //region Animaciones de tabla
    const handleEdit = (id: string) => {
        const mesa = mesas[id];
        setSelectedMesaId(id);
        setFormValues(mesa);
        Animated.parallel([
            Animated.timing(tableMargin, {
                toValue: -100,
                duration: 200,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.ease),
            }),
            Animated.timing(formOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: false,
            }),
        ]).start();
    };
    //endregion Animacion de tabla

    //region Restablecer animaciones
    const handleCancel = () => {
        Animated.parallel([
            Animated.timing(tableMargin, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
                easing: Easing.out(Easing.ease),
            }),
            Animated.timing(formOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setSelectedMesaId(null);
            setIsCreating(false);
        });
    };
    //endregion Restablecer animaciones

    //region Editar o crear mesa
    const handleSubmitMesa = async () => {
        //region Validaciones del formulario
        if (!formValues.numero || !formValues.capacidad || !formValues.estado) {
            Swal.fire({
                title: 'Campos incompletos',
                text: 'Por favor, completa todos los campos.',
                icon: 'warning',
                timer: 1500,
            });
            setIsSubmitting(false);
            return;
        }
        if (!formValues.numero || formValues.numero <= 0) {
            Swal.fire({
                title: 'Número inválido',
                text: 'Por favor, ingresa un número de mesa válido.',
                icon: 'warning',
                timer: 1500,
            });
            setIsSubmitting(false);
            return;
        }
        if (!formValues.capacidad || formValues.capacidad <= 0) {
            Swal.fire({
                title: 'Capacidad inválida',
                text: 'Por favor, ingresa una capacidad de mesa válida.',
                icon: 'warning',
                timer: 1500,
            });
            setIsSubmitting(false);
            return;
        }
        //endregion Validaciones del formulario

        //region Manejo de datos
        setIsSubmitting(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const restauranteId = await AsyncStorage.getItem('restaurantId');

            let mesaId = selectedMesaId;
            //endregion Manejo de datos
            //region Fetch Crear o actualizar
            const method = mesaId ? 'PUT' : 'POST';
            const response = await fetch(`${Config.API_URL}/mesa/`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    restaurante_id: restauranteId,
                    ...(mesaId ? { mesa_id: mesaId } : {}),
                    ...formValues,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Error en la respuesta de la API');
            }
            //endregion Fetch Crear o actualizar

            // Si es creación, obtener el nuevo ID de mesa
            if (!mesaId) {
                const data = await response.json();
                mesaId = data.mesa_id;
            }

            //region Fetch obtener sillas actuales
            const res = await fetch(`${Config.API_URL}/silla/silla_mesa/?user_id=${userId}&restaurante_id=${restauranteId}&mesa_id=${mesaId}`);
            const sillaData: SillasResponse = await res.json();
            const sillasActuales = Object.entries(sillaData.sillas || {}).map(([id, silla]) => ({
                id,
                numero: silla.numero,
                mesa_id: silla.mesa_id,
            }));
            //endregion Fetch obtener sillas actuales

            const cantidadActual = sillasActuales.length;
            const nuevaCantidad = formValues.capacidad;

            //region Crear sillas
            if (nuevaCantidad > cantidadActual) {
                const sillasPorCrear = nuevaCantidad - cantidadActual;
                if (!puedeCrearSilla(totalSillasActuales, sillasPorCrear)) {
                    Swal.fire({
                        title: 'Límite de sillas alcanzado',
                        text: `Tu plan solo permite hasta ${limites.sillas} sillas totales.`,
                        icon: 'warning',
                    });
                    setIsSubmitting(false);
                    return;
                }
                for (let i = 0; i < sillasPorCrear; i++) {
                    const numeroSilla = cantidadActual + i + 1;
                    await fetch(`${Config.API_URL}/silla/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: userId,
                            restaurante_id: restauranteId,
                            mesa_id: mesaId,
                            numero: numeroSilla,
                        }),
                    });
                }
            }
            //endregion Crear sillas

            //region Eliminar sillas
            if (nuevaCantidad < cantidadActual) {
                const sillasPorEliminar = sillasActuales
                    .sort((a, b) => b.numero - a.numero)
                    .slice(0, cantidadActual - nuevaCantidad);

                for (const silla of sillasPorEliminar) {
                    await fetch(`${Config.API_URL}/silla/`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: userId,
                            restaurante_id: restauranteId,
                            silla_id: silla.id,
                        }),
                    });
                }
            }
            //endregion Eliminar sillas

            //region Sweetalerts finales
            await fetchMesas();
            handleCancel();
            Swal.fire({
                title: 'Mesa procesada con éxito',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error('Error al procesar la mesa:', error);
            Swal.fire({
                title: 'Error al procesar mesa',
                text: 'Te recomendamos verificar que el numero de mesa no esté duplicado',
                icon: 'error',
            });
            //endregion Sweetalerts finales
        } finally {
            setIsSubmitting(false);
        }
    };
    //endregion Editar o crear mesa

    //region Eliminar mesa
    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: '¿Quieres eliminar esta mesa?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (!result.isConfirmed) {
            return;
        }
        //region Fetch eliminar mesa
        setIsSubmitting(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const restauranteId = await AsyncStorage.getItem('restaurantId');

            await fetch(`${Config.API_URL}/mesa/`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    restaurante_id: restauranteId,
                    mesa_id: id,
                }),
            });
            //endregion Fetch eliminar mesa

            await fetchMesas();
            Swal.fire({
                title: 'Mesa eliminada',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error('Error al eliminar la mesa:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar la mesa.',
                icon: 'error',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    //endregion Eliminar mesa

    useEffect(() => {
        fetchMesas();
        fetchSillasTotales();
    }, []);

    //region Pantallas de carga
    if (isSubmitting) {
        return (<LoadingScreen message="Actualizando mesas..." />);
    }   

    if (loading) {
        return (<LoadingScreen message="Cargando mesas..." />);
    }   
    //endregion Pantallas de carga

    //region Frontend
    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                {showTable && (
                    noHayMesas ? (
                        //region Mensaje si no hay mesas
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <BoldText style={styles.title}>No hay mesas registradas</BoldText>
                            <BoldText style={styles.title}>Debes crear una mesa en el boton de  "Crear Mesa"</BoldText>
                        </View>
                        //endregion Mensaje si no hay mesas
                    ) : (
                        <Animated.View style={[styles.tableContainer, { marginLeft: tableMargin }]}>
                            {
                            //region Tabla de mesas
                            }
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
                                                <Pressable
                                                    style={[styles.button, { backgroundColor: 'red', width: 50 }]}
                                                    onPress={() => handleDelete(id)}
                                                >
                                                    <Icon name="trash" size={20} color="#fff" />
                                                </Pressable>
                                            </View>
                                        </View>
                                        );
                                    })}
                                </View>
                            </ScrollView>
                        </Animated.View>
                    )
                )}

                {
                //endregion Tabla de mesas
                //region Formulario de mesa
                }

                {((selectedMesaId || isCreating) && showForm) && (
                    <Animated.View style={[styles.formContainer, { opacity: formOpacity }]}>
                        <BoldText style={styles.titleForm}>{isCreating ? 'Crear Mesa' : `Editar Mesa ${String(formValues.numero)}`}</BoldText>
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
                        <View style={[styles.pickerContainer, isCreating ? { opacity: 0.5 } : {}]}>
                            <Picker
                                selectedValue={ isCreating ? 'disponible' : formValues.estado}
                                enabled={!isCreating}
                                onValueChange={(itemValue) =>
                                setFormValues({ ...formValues, estado: itemValue })
                                }>
                                <Picker.Item label="Disponible" value="disponible" />
                                <Picker.Item label="Ocupado" value="ocupado" />
                                <Picker.Item label="Pagado" value="pagado" />
                            </Picker>
                        </View>
                        <View style={styles.formButtons}>
                        <Pressable style={[styles.button, { backgroundColor: 'gray' }]} onPress={handleCancel}>
                            <BoldText style={styles.textButton}>Cancelar</BoldText>
                        </Pressable>
                        <Pressable style={styles.button} onPress={handleSubmitMesa}>
                            <BoldText style={styles.textButton}>Guardar</BoldText>
                        </Pressable>
                        </View>
                    </Animated.View>
                )}
            </View>
            {
            //endregion Formulario de mesa
            //region Botón flotante para crear mesa
            }
            {showTable && (
                <Pressable
                    style={styles.floatingButton}
                    onPress={() => {
                        if (!puedeCrearMesa(Object.keys(mesas).length)) {
                            Swal.fire({
                                title: 'Límite alcanzado',
                                text: `Tu plan actual solo permite hasta ${limites.mesas} mesas.`,
                                icon: 'warning',
                            });
                            return;
                        }
                        setFormValues({ capacidad: 0, numero: 0, estado: 'disponible' });
                        setSelectedMesaId(null);
                        setIsCreating(true);
                        setShowForm(true);
                        Animated.parallel([
                            Animated.timing(tableMargin, { toValue: -100, duration: 200, useNativeDriver: true }),
                            Animated.timing(formOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
                        ]).start();
                    }}>
                    <BoldText style={styles.textButton}>+ Crear Mesa</BoldText>
                </Pressable>
            )}
            {
            //endregion Botón flotante para crear mesa
            }
        </View>
        
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bg_light,
        alignItems: 'center',
        position: 'relative',
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
        paddingHorizontal: 65,
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
        flexDirection: 'row', 
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        gap: 10, 
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
    pickerContainer: {
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 8,
        marginVertical: 5,
        padding: 8,
        overflow: 'hidden',
        },
    formButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    floatingButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 100,
        height: 50,
        marginHorizontal: 10,
        borderRadius: 8, 
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        cursor: 'pointer',
        },
    floatingButtonText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
        lineHeight: 24,
    },
});

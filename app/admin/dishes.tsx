import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Animated, Easing, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '@/constants/config';
import { Colors } from '@/constants/Colors';
import BoldText from '@/components/ui/CustomText';
import { Pressable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome';
import LoadingScreen from '@/components/ui/LoadingScreen'; 
import Swal from 'sweetalert2';
import { useSweetAlertWatcher } from '@/hooks/sweetAlertWatcher';


type Plato = {
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    categoria_id: string;
};

type PlatoConId = Plato & { id: string};

export default function PlatosScreen() {
    const [platos, setPlatos] = useState<{ [id: string]: Plato }>({});
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedPlatoId, setSelectedPlatoId] = useState<string | null>(null);
    const [CatId, setCatId] = useState<string | null>(null);
    const [formValues, setFormValues] = useState<Plato>({ nombre: '', descripcion: '', precio: 0, stock: 0, categoria_id: '' });
    const [showPage, setShowPage] = useState(true);

    const formOpacity = useRef(new Animated.Value(0)).current;

    useSweetAlertWatcher(
        () => {
            setShowPage(false);
        },
        () => {
            setTimeout(() => {
            setShowPage(true);
            }, 150);
        }
    );

    const fetchPlatos = async () => {
        const userId = await AsyncStorage.getItem('userId');
        const restauranteId = await AsyncStorage.getItem('restaurantId');
        setLoading(true);
        try {
            const res = await fetch(`${Config.API_URL}/platos/?user_id=${userId}&restaurante_id=${restauranteId}`);
            const data = await res.json();
            setPlatos(data.platos);
        } catch (error) {
            console.error('Error fetching platos:', error);
        } finally {
            setLoading(false);
        }
    };

    const noHayPlatos = Object.keys(platos).length === 0;

    useEffect(() => {
        fetchPlatos();
    }, []);

    const handleOpenCreate = () => {
        setIsCreating(true);
        setSelectedPlatoId(null);
        setFormValues({ nombre: '', descripcion: '', precio: 0, stock: 0, categoria_id: '' });
        Animated.timing(formOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
        }).start(() => {});
    };

    const handleOpenEdit = (plato : PlatoConId) => {
        setIsCreating(false);
        setSelectedPlatoId(plato.id);
        setFormValues({
            nombre: plato.nombre,
            descripcion: plato.descripcion,
            precio: plato.precio,
            stock: plato.stock,
            categoria_id: plato.categoria_id
        });
        setCatId(plato.categoria_id);
        Animated.timing(formOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
        }).start(() => {});
    };

    const handleCloseForm = () => {
        setSelectedPlatoId(null);
        setIsCreating(false);
        Animated.timing(formOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
        }).start(() => {});
    };

    const handleSubmitPlato = async () => {
        setIsSubmitting(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const restauranteId = await AsyncStorage.getItem('restaurantId');
            let platoId = selectedPlatoId;
            let catId = CatId;

            const createBody = {
                user_id: userId,
                restaurante_id: restauranteId,
                categoria_id: "",
                descripcion: formValues.descripcion,
                imagenUrl: [ "" ],
                nombre: formValues.nombre,
                precio: formValues.precio,
                stock: formValues.stock
            };

            const updateBody = {
                user_id: userId,
                restaurante_id: restauranteId,
                plato_id: platoId,
                categoria_id: catId,
                descripcion: formValues.descripcion,
                imagenUrl: [ "" ],
                nombre: formValues.nombre,
                precio: formValues.precio,
                stock: formValues.stock
            };

            const response = await fetch(`${Config.API_URL}/plato/`, {
                method: isCreating ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...(isCreating ? createBody : updateBody),
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Error al guardar el plato');
            }

            if (isCreating) {
                const data = await response.json();
                platoId = data.plato_id;  // si el backend devuelve el ID nuevo
            }

            // Actualizar la lista de platos después de guardar
            await fetchPlatos();

            handleCloseForm(); // cerrar el formulario después de guardar
        } catch (error) {
            console.error('Error al guardar el plato:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: '¿Quieres eliminar plato?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (!result.isConfirmed) {
            return;
        }
        setIsSubmitting(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const restauranteId = await AsyncStorage.getItem('restaurantId');

            const response = await fetch(`${Config.API_URL}/plato/`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    restaurante_id: restauranteId,
                    plato_id: id
                }),
            })

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Error al eliminar el plato');
            }

            await fetchPlatos();
            Swal.fire({
                title: 'Plato eliminado con éxito',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (err) {
            console.error('Error al eliminar el plato:', err);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar el plato.',
                icon: 'error',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitting) {
            return (<LoadingScreen message="Actualizando platos..." />);
        }   
    
    if (loading) {
        return (<LoadingScreen message="Cargando platos..." />);
    }   

    return (
        <View style={styles.container}>
            <BoldText style={styles.title}>Platos</BoldText>
            {showPage && (
                noHayPlatos ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <BoldText style={styles.title}>No hay platos registrados</BoldText>
                        <BoldText style={styles.title}>Debes crear un plato en el boton de  "Crear Plato"</BoldText>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.cardsContainer}>
                        {Object.entries(platos).map(([id, plato]) => (
                            <View key={id} style={styles.card}>
                                <BoldText style={styles.cardTitle}>{plato.nombre}</BoldText>
                                <Text style={styles.cardDescription}>{plato.descripcion}</Text>
                                <BoldText style={styles.cardPrice}>${plato.precio.toFixed(0)}</BoldText>
                                <View style={styles.removeButtonContainer}>
                                    <Pressable style={styles.removeButton} onPress={() => handleDelete(id)}>
                                        <Icon name="trash" size={18} color="#fff" />
                                    </Pressable>
                                </View>
                                <View style={styles.editButtonContainer}>
                                    <Pressable style={styles.editButton} onPress={() => handleOpenEdit( {...plato, id})}>
                                        <Icon name="pencil" size={18} color="#fff" />
                                    </Pressable>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                )
            )}
            {showPage && (
                <Pressable style={styles.fab} onPress={handleOpenCreate}>
                    <View style={styles.fabContent}>
                        <Icon name="plus" size={20} color="#fff" style={{ marginRight: 5 }} />
                        <BoldText style={styles.fabText}>
                            Crear plato
                        </BoldText>
                    </View>
                </Pressable>
            )}

            {selectedPlatoId !== null || isCreating ?  (
                <Animated.View style={[styles.formContainer, { opacity: formOpacity }]}>
                    <BoldText style={styles.formTitle}>
                        {isCreating ? 'Crear plato' : 'Editar plato'}
                    </BoldText>

                    <BoldText style={styles.camposForm}>Nombre: </BoldText>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre"
                        value={formValues.nombre}
                        onChangeText={(text) => setFormValues({ ...formValues, nombre: text })}
                    />
                    <BoldText style={styles.camposForm}>Descripción: </BoldText>
                    <TextInput
                        style={styles.input}
                        placeholder="Descripción"
                        value={formValues.descripcion}
                        onChangeText={(text) => setFormValues({ ...formValues, descripcion: text })}
                    />
                    <BoldText style={styles.camposForm}>Precio: </BoldText>
                    <TextInput
                        style={styles.input}
                        placeholder="Precio"
                        value={String(formValues.precio)}
                        onChangeText={(text) => setFormValues({ ...formValues, precio: parseInt(text) || 0 })}
                        keyboardType="numeric"
                    />
                    <BoldText style={styles.camposForm}>Stock: </BoldText>
                    <TextInput
                        style={styles.input}
                        placeholder="Stock"
                        value={String(formValues.stock)}
                        onChangeText={(text) => setFormValues({ ...formValues, stock: parseInt(text) || 0 })}
                        keyboardType="numeric"
                    />

                    <View style={styles.formButtons}>
                        <Pressable style={[styles.button, { backgroundColor: 'gray' }]} onPress={handleCloseForm}>
                            <BoldText style={styles.textButton}>Cancelar</BoldText>
                        </Pressable>
                        <Pressable style={styles.button} onPress={handleSubmitPlato}>
                            <BoldText style={styles.textButton}>Guardar</BoldText>
                        </Pressable>
                    </View>
                </Animated.View>
            ): null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bg_light,
        padding: 20,
    },
    title: {
        fontSize: 34,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 20,
        textAlign: 'center',
    },
    createButton: {
        backgroundColor: Colors.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    createButtonText: {
        fontSize: 18,
        color: '#fff',
    },
    cardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 15,
    },
    card: {
        position: 'relative',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        width: 160,
        minHeight: 200,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: Colors.primary,
    },
    cardDescription: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10,
    },
    cardPrice: {
        fontSize: 16,
        color: Colors.primary,
    },
    formContainer: {
        position: 'absolute',
        top: 100,
        alignSelf: 'center',
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
    },
    formTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 10,
        textAlign: 'center',
    },
    camposForm: {
        fontSize: 18,
        color: Colors.primary,
        textAlign: 'center',
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
    button: {
        backgroundColor: Colors.primary,
        padding: 10,
        borderRadius: 8,
        width: '48%',
        alignItems: 'center',
    },
    textButton: {
        color: '#fff',
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: Colors.primary,
        width: 150,
        height: 60,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5, // sombra para Android
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    fabContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fabText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 3,
    },
    editButtonContainer: {
        marginTop: 15,
        position: 'absolute',
        bottom: 10,
        right: 10,
    },
    removeButtonContainer: {
        marginTop: 15,
        position: 'absolute',
        bottom: 10,
        left: 10,
    },
    editButton: {
        width: 40,
        height: 40,
        backgroundColor: Colors.primary,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeButton: {
        width: 40,
        height: 40,
        backgroundColor: 'red',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

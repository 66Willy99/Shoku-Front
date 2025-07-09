import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Animated, Pressable } from 'react-native';
import { Config } from '@/constants/config';
import BoldText from '@/components/ui/CustomText';
import Checkbox from 'expo-checkbox'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import LoadingScreen from '@/components/ui/LoadingScreen'; 
import Swal from 'sweetalert2';
import { useSweetAlertWatcher } from '@/hooks/sweetAlertWatcher';
import { useSubscription } from '@/context/subscriptionContext';

type Categoria = { nombre: string; descripcion: string };
interface Plato {
    id: string;
    nombre: string;
    descripcion: string;
    imagenUrl: string[];
    precio: number;
    stock: number;
    categoria_id?: string;
}

export default function CategoriaScreen() {
    const [categorias, setCategorias] = useState<{ [id: string]: Categoria }>({});
    const [platos, setPlatos] = useState<{ [id: string]: Plato }>({});
    const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
    const [formValues, setFormValues] = useState<Categoria>({ nombre: '', descripcion: '' });
    const [categoriaPlatos, setCategoriaPlatos] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showTable, setShowTable] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const { limites, puedeCrearCategoria } = useSubscription();

    const formOpacity = useRef(new Animated.Value(0)).current;
    const showTableBeforeAlert = useRef(false);

    //region SweetAlert Watcher
    useSweetAlertWatcher(
        () => {
            showTableBeforeAlert.current = showTable; 
            setShowTable(false);
            setShowForm(false);
        },
        () => {
            setTimeout(() => {
                if (showTableBeforeAlert.current) {
                    setShowTable(true); 
                }
                setShowForm(true);
            }, 1500);
        }
    );
    //endregion SweetAlert Watcher

    useEffect(() => {
        setShowForm(false);
        fetchCategorias();
    }, []);

    //region Fetchs
    //region Fetch Categorias
    const fetchCategorias = async () => {
        const userId = await AsyncStorage.getItem('userId');
        const restauranteId = await AsyncStorage.getItem('restaurantId');
        setLoading(true);
        try {
            const res = await fetch(`${Config.API_URL}/category/all?user_id=${userId}&restaurante_id=${restauranteId}`);
            const data = await res.json();
            setCategorias(data.categorias);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
            setShowTable(true);
        }
    };

    const noHayCats = Object.keys(categorias).length === 0;
    //endregion Fetch Categorias

    //region Fetch Platos
    const fetchPlatos = async () => {
        const userId = await AsyncStorage.getItem('userId');
        const restauranteId = await AsyncStorage.getItem('restaurantId');
        setLoading(true);
        try {
            const res = await fetch(`${Config.API_URL}/platos/?user_id=${userId}&restaurante_id=${restauranteId}`);
            const data = await res.json();
            setPlatos(data.platos);
            return data.platos;
        } catch (error) {
            console.error('Error fetching platos:', error);
        } finally {
            setLoading(false);
        }
    };
    //endregion Fetch Platos
    //endregion Fetchs

    //region Acciones
    //region Boton editar
    const handleEdit = async (id: string) => {
        const cat = categorias[id];
        setLoading(true);
        try {
            const fetchedPlatos = await fetchPlatos(); // ✅ uso directo de datos

            setSelectedCatId(id);
            setFormValues(cat);
            setIsCreating(false);

            const platosAsociados = Object.entries(fetchedPlatos as { [id: string]: Plato })
                .filter(([_, plato]) => plato.categoria_id === id)
                .map(([pid]) => pid);

            setCategoriaPlatos(platosAsociados);
            setShowForm(true);
            setShowTable(false);
        } catch (error) {
            console.error('Error al traer los platos');
        } finally {
            setLoading(false);
            Animated.parallel([
                Animated.timing(formOpacity, { toValue: 1, duration: 300, useNativeDriver: false }),
            ]).start();
        }
    };
    //endregion Boton editar

    //region Boton crear
    const handleCreate = async () => {
        const cantidadActual = Object.keys(categorias).length;

        if (!puedeCrearCategoria(cantidadActual)) {
            Swal.fire({
                title: 'Límite alcanzado',
                text: `Tu plan actual solo permite hasta ${limites.categorias} categorías.`,
                icon: 'warning',
            });
            return;
        }
        setLoading(true);
        try {
            await fetchPlatos(); // solo obtener y setear los platos
            setFormValues({ nombre: '', descripcion: '' });
            setCategoriaPlatos([]);
            setSelectedCatId(null);
            setIsCreating(true);
            setShowTable(false);
            setShowForm(true);
            Animated.parallel([
                Animated.timing(formOpacity, { toValue: 1, duration: 300, useNativeDriver: false }),
            ]).start();
        } catch (error) {
            console.error('Error al cargar platos para crear categoría');
        } finally {
            setLoading(false);
        }
    };
    //endregion Boton crear

    //region Boton cancelar
    const handleCancel = () => {
        setShowForm(false);
        fetchCategorias();
        Animated.parallel([
            Animated.timing(formOpacity, { toValue: 0, duration: 300, useNativeDriver: false }),
        ]).start(() => {
            setSelectedCatId(null);
            setIsCreating(false);
            setShowTable(true);
        });
    };
    //endregion Boton cancelar

    //region Crear o actualizar categoria
    const handleSubmitCategoria = async () => {
        setIsSubmitting(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const restauranteId = await AsyncStorage.getItem('restaurantId');

            const bodyBase = {
                user_id: userId,
                restaurante_id: restauranteId,
                nombre: formValues.nombre,
                descripcion: formValues.descripcion,
            };

            let categoriaId = selectedCatId;

            //region Fetch crear o actualizar
            const response = await fetch(`${Config.API_URL}/category/`, {
                method: isCreating ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...bodyBase,
                    ...(isCreating ? {} : { categoria_id: categoriaId }),
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Error en la operación');
            }
            //endregion Fetch crear o actualizar

            if (isCreating) {
                const data = await response.json();
                categoriaId = data.category_id; 
            }

            //region Gestion de platos
            // Obtener lista de platos que ya tenían esta categoría antes de editar
            const platosAnteriores = Object.entries(platos)
                .filter(([_, plato]) => plato.categoria_id === categoriaId)
                .map(([id]) => id);

            //region Añadir categoria a plato
            // Platos que se deben desvincular
            const platosRemovidos = platosAnteriores.filter(id => !categoriaPlatos.includes(id));

             // Asignar categoría a los platos seleccionados
            if (categoriaPlatos.length > 0) {
                for (const platoId of categoriaPlatos) {
                    const plato = platos[platoId];
                    if (!plato) continue;
                    await fetch(`${Config.API_URL}/plato/`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: userId,
                            restaurante_id: restauranteId,
                            plato_id: platoId,
                            categoria_id: categoriaId,
                            descripcion: plato.descripcion,
                            imagenUrl: plato.imagenUrl,
                            nombre: plato.nombre,
                            precio: plato.precio,
                            stock: plato.stock,
                        }),
                    });
                }
            }
            //endregion Añadir categoria a plato

            //region Eliminar categoria a plato
            // Quitar la categoría de los platos que fueron desmarcados
            for (const platoId of platosRemovidos) {
                const plato = platos[platoId];
                if (!plato) continue;

                await fetch(`${Config.API_URL}/plato/`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: userId,
                        restaurante_id: restauranteId,
                        plato_id: platoId,
                        categoria_id: "", // Remover categoría
                        descripcion: plato.descripcion,
                        imagenUrl: plato.imagenUrl,
                        nombre: plato.nombre,
                        precio: plato.precio,
                        stock: plato.stock,
                    }),
                });
            }
            //endregion Eliminar categoria a plato
            //endregion Gestion de platos

            await fetchCategorias();
            handleCancel();

            Swal.fire({
                title: isCreating ? 'Categoría creada con éxito' : 'Categoría actualizada con éxito',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (err) {
            console.error('Error al guardar categoría:', err);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo guardar la categoría.',
                icon: 'error',
            });
        } finally {
            setIsSubmitting(false);
        }
    }
    //endregion Crear o actualizar categoria

    //region Eliminar categoria
    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: '¿Quieres eliminar esta categoria?',
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

            const response = await fetch(`${Config.API_URL}/category/?user_id=${userId}&restaurante_id=${restauranteId}&categoria_id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Error al eliminar la categoría');
            }

            await fetchCategorias();
            Swal.fire({
                title: 'Categoría eliminada con éxito',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (err) {
            console.error('Error al eliminar categoría:', err);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar la categoría.',
                icon: 'error',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    //endregion Eliminar categoria
    //endregion Acciones

    //region Pantallas de carga
    if (isSubmitting) {
        return (<LoadingScreen message="Actualizando categorias..." />);
    }   

    if (loading) {
        return (<LoadingScreen message="Cargando categorias..." />);
    }   
    //endregion Pantallas de carga

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                {
                    //region Tabla Categorias
                }
                {((!selectedCatId || !isCreating) && showTable) && (
                    noHayCats ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <BoldText style={styles.title}>No hay categorias registradas</BoldText>
                            <BoldText style={styles.title}>Debes crear una categoría en el boton de  "Crear Categoría"</BoldText>
                        </View>
                    ) : (
                        <Animated.View style={styles.tableContainer}>
                            <BoldText style={styles.title}>Categorías</BoldText>
                            {/* Tabla de categorías aquí */}
                            <View style={styles.headerRow}>
                                <BoldText style={styles.headerCell}>Nombre</BoldText>
                                <BoldText style={styles.headerCell}>Descripción</BoldText>
                                <BoldText style={styles.headerCell}>Opciones</BoldText>
                            </View>
                            {Object.entries(categorias).map(([id, cat], index, array) => {
                                const isLast = index === array.length - 1;
                                return (
                                <View key={id} style={[styles.row, isLast && styles.lastRow]}>
                                    <BoldText style = {styles.cell}>{cat.nombre}</BoldText>
                                    <BoldText style = {styles.cell}>{cat.descripcion}</BoldText>
                                    {
                                        //region Botones 
                                    }
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
                                    {
                                        //endregion Botones
                                    }
                                </View>
                                );
                            })}
                        </Animated.View>
                    )
                )}
                {
                    //endregion Tabla Categorias
                    //region Formulario Categoria
                }

                {((selectedCatId || isCreating) && showForm) && (
                    <Animated.View style={[styles.formContainer, { opacity: formOpacity }]}>
                        <View style={styles.formInnerContainer}>
                            {/* Formulario a la izquierda */}
                            <View style={styles.formSection}>
                                <BoldText style={styles.titleForm}>
                                    {isCreating ? 'Crear Categoría' : 'Editar Categoría'}
                                </BoldText>
                                <BoldText style={styles.camposForm}>Nombre:</BoldText>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nombre"
                                    value={formValues.nombre}
                                    onChangeText={(val) => setFormValues({ ...formValues, nombre: val })}
                                />
                                <BoldText style={styles.camposForm}>Descripcion:</BoldText>
                                <TextInput
                                    style={styles.inputDescripcion}
                                    multiline
                                    numberOfLines={4}
                                    placeholder="Descripción"
                                    value={formValues.descripcion}
                                    onChangeText={(val) => setFormValues({ ...formValues, descripcion: val })}
                                />

                                <View style={styles.formButtons}>
                                    <Pressable style={[styles.button, { backgroundColor: 'gray' }]} onPress={handleCancel}>
                                        <BoldText style={styles.textButton}>Cancelar</BoldText>
                                    </Pressable>
                                    <Pressable style={styles.button} 
                                        onPress={handleSubmitCategoria}
                                    >
                                        <BoldText style={styles.textButton}>Guardar</BoldText>
                                    </Pressable>
                                </View>
                            </View>

                            {/* Cards de platos a la derecha */
                                //region Checks de platos
                            }
                            <View style={styles.platosSection}>
                                <BoldText style={styles.title}>Platos</BoldText>
                                <ScrollView style={styles.platosScroll}>
                                    {Object.entries(platos).map(([id, plato]) => (
                                    <View key={id} style={styles.platoCard}>
                                        <Checkbox
                                        value={categoriaPlatos.includes(id)}
                                        onValueChange={(checked) => {
                                            setCategoriaPlatos((prev) =>
                                                checked ? [...prev, id] : prev.filter((pid) => pid !== id)
                                            );
                                        }}
                                        />
                                        <Text style={{ marginLeft: 10 }}>{plato.nombre}</Text>
                                    </View>
                                    ))}
                                </ScrollView>
                            </View>
                            {
                                //endregion Checks de platos
                                //endregion Formulario Categoria
                            }
                        </View>
                    </Animated.View>
                )}
            </View>
            {
                //region Boton de crear
            }
            {showTable && (
                <Pressable style={styles.floatingButton} onPress={handleCreate}>
                    <BoldText style={styles.floatingButtonText}>+ Crear Categoría</BoldText>
                </Pressable>
            )}
            {
                //endregion Boton de crear
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
        minWidth: 705,
        paddingHorizontal: 10,
    },
    headerCell: { 
        textAlign: 'center',
        fontSize: 16,
        paddingVertical: 20,
        paddingHorizontal: 20,
        flex: 1,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    row: { 
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: Colors.primary,
        width: 705,
        minHeight: 60,
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    lastRow: {
        borderBottomStartRadius: 10,
        borderBottomEndRadius: 10,
    },
    cell: {
        flex: 1,
        textAlign: 'center',
        fontSize: 16,
        color: Colors.primary,
        padding: 20,
        paddingHorizontal: 40,
    },
    cellButtonContainer: {
        flex: 1,
        flexDirection: 'row', 
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 50,
        gap: 5, 
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
        color: '#fff' 
    },
    title: { 
        fontSize: 34,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 10,
        textAlign: 'center',
    },
    titleForm: { 
        fontSize: 22, 
        marginBottom: 10 
    },
    subTitle: { 
        fontSize: 18, 
        marginVertical: 10 
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 6,
        marginVertical: 5,
    },
    inputDescripcion: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 6,
        marginVertical: 5,
        height: 100,
        textAlignVertical: 'top',
    },
    platosContainer: { 
        maxHeight: 300 
    },
    formButtons: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginTop: 10 
    },
    floatingButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 200,
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
    formContainer: { 
        width: '100%', 
        marginLeft: 20 
    },
    formInnerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 30,
        width: '100%',
    },
    formSection: {
        alignItems: 'center',
        minWidth: 250,
        width: '15%',
        padding: 10,
        marginLeft: '15%',
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 3,
    },
    camposForm: {
        fontSize: 18,
        color: Colors.primary,
        textAlign: 'center',
    },
    platosSection: {
        width: '50%',
    },
    platosScroll: {
        maxHeight: 400,
        paddingTop: 10,
    },
    platoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#fff',
    },
});

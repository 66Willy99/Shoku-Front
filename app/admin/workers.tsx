import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Animated, Easing } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Config } from "@/constants/config";
import { Colors } from "@/constants/Colors";
import { Pressable } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/FontAwesome";
import Swal from "sweetalert2";
import { Picker } from "@react-native-picker/picker";
import { Image } from "react-native";
import LoadingScreen from '@/components/ui/LoadingScreen'; 

type Employee = {
    id: string;
    email: string;
    nombre: string;
    rol: string;
    user: string;
};

export default function Workers() {
    const [employees, setEmployees] = useState<{ [id: string]: Employee }>({});
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [formValues, setFormValues] = useState<Employee  & { password_hash?: string }>({
        id: "",
        email: "",
        nombre: "",
        rol: "",
        user: "",
        password_hash: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [showTable, setShowTable] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const tableMargin = useRef(new Animated.Value(0)).current;
    const formOpacity = useRef(new Animated.Value(0)).current;

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem("userId");
            const restauranteId = await AsyncStorage.getItem("restaurantId");
            const response = await fetch(
                `${Config.API_URL}/trabajadores/?user_id=${userId}&restaurante_id=${restauranteId}`
            );
            const data = await response.json();
            setEmployees(data);
        } catch (err) {
            console.error("Error al obtener trabajadores:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id: string) => {
        const emp = employees[id];
        setSelectedId(id);
        setFormValues({ ...emp, id });
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
        setShowForm(true);
    };

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
            setSelectedId(null);
            setIsCreating(false);
            setShowForm(false);
        });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const userId = await AsyncStorage.getItem("userId");
            const restauranteId = await AsyncStorage.getItem("restaurantId");
            const method = isCreating ? "POST" : "PUT";
            const url = `${Config.API_URL}/trabajador/`;
            const body = {
                user_id: userId,
                restaurante_id: restauranteId,
                ...(isCreating ? {} : { trabajador_id: formValues.id }),
                email: formValues.email,
                nombre: formValues.nombre,
                rol: formValues.rol,
                user: formValues.user,
                ...(isCreating ? { password_hash: formValues.user } : {}), // Solo para crear, puedes pedir el password real
            };
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Error en la respuesta de la API");
            }
            await fetchEmployees();
            handleCancel();
            Swal.fire({
                title: isCreating ? "Trabajador creado" : "Trabajador actualizado",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error("Error al procesar trabajador:", error);
            Swal.fire({
                title: "Error",
                text: "No se pudo procesar el trabajador.",
                icon: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: "¿Quieres eliminar este trabajador?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (!result.isConfirmed) return;

        setIsSubmitting(true);
        try {
            const userId = await AsyncStorage.getItem("userId");
            const restauranteId = await AsyncStorage.getItem("restaurantId");
            await fetch(`${Config.API_URL}/trabajador/`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    restaurante_id: restauranteId,
                    trabajador_id: id,
                }),
            });
            await fetchEmployees();
            Swal.fire({
                title: "Trabajador eliminado",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error("Error al eliminar trabajador:", error);
            Swal.fire({
                title: "Error",
                text: "No se pudo eliminar el trabajador.",
                icon: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    if (isSubmitting) {
        return (<LoadingScreen message="Actualizando trabajadores..." />);
    }   

    if (loading) {
        return (<LoadingScreen message="Cargando trabajadores..." />);
    }   

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                {showTable && (
                    <Animated.View style={[styles.tableContainer, { marginLeft: tableMargin }]}>
                        <Text style={styles.title}>Personal</Text>
                        <ScrollView style={{ width: "60%" }} contentContainerStyle={{ flexGrow: 1 }}>
                            <View>
                                <View style={styles.headerRow}>
                                    <Text style={styles.headerCell}>Nombre</Text>
                                    <Text style={styles.headerCell}>Rol</Text>
                                    <Text style={styles.headerCell}>Usuario</Text>
                                    <Text style={styles.headerCell}>Email</Text>
                                    <Text style={styles.headerCell}>Opciones</Text>
                                </View>
                                {Object.entries(employees).map(([id, emp], index, array) => {
                                    const isLast = index === array.length - 1;
                                    return (
                                        <View key={id} style={[styles.row, isLast && styles.lastRow]}>
                                            <View style={{ flexDirection: "row", flex: 1, marginLeft: 20, alignItems: "center" }}>
                                                <Image
                                                    source={{ uri: "https://dummyimage.com/40" }}
                                                    style={{ width: 40, height: 40, borderRadius: 20, marginRight: 8 }}
                                                />
                                                <Text style={styles.cell}>{emp.nombre}</Text>
                                            </View>
                                            <Text style={styles.cell}>{emp.rol}</Text>
                                            <Text style={styles.cell}>{emp.user}</Text>
                                            <Text style={styles.cell}>{emp.email}</Text>
                                            <View style={styles.cellButtonContainer}>
                                                <Pressable style={styles.button} onPress={() => { handleEdit(id); setIsCreating(false); }}>
                                                    <Text style={styles.textButton}>Editar</Text>
                                                </Pressable>
                                                <Pressable
                                                    style={[styles.button, { backgroundColor: "red", width: 50 }]}
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
                )}

                {(showForm || isCreating) && (
                    <Animated.View style={[styles.formContainer, { opacity: formOpacity }]}>
                        <Text style={styles.titleForm}>{isCreating ? "Crear Trabajador" : `Editar Trabajador`}</Text>
                        <Text style={styles.camposForm}>Nombre:</Text>
                        <TextInput
                            style={styles.input}
                            value={formValues.nombre ?? ""}
                            onChangeText={(val) => setFormValues({ ...formValues, nombre: val })}
                            placeholder="Nombre"
                        />
                        <Text style={styles.camposForm}>Rol:</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formValues.rol ?? ""}
                                onValueChange={(itemValue) =>
                                    setFormValues({ ...formValues, rol: itemValue })
                                }
                            >
                                <Picker.Item label="Selecciona un rol" value="" />
                                <Picker.Item label="Administrador" value="admin" />
                                <Picker.Item label="Cocinero" value="cocinero" />
                                <Picker.Item label="Garzón" value="garzon" />
                            </Picker>
                        </View>
                        <Text style={styles.camposForm}>Email:</Text>
                        <TextInput
                            style={styles.input}
                            value={formValues.email ?? ""}
                            onChangeText={(val) => setFormValues({ ...formValues, email: val })}
                            placeholder="Email"
                        />
                        <Text style={styles.camposForm}>Usuario:</Text>
                        <TextInput
                            style={styles.input}
                            value={formValues.user ?? ""}
                            onChangeText={(val) => setFormValues({ ...formValues, user: val })}
                            placeholder="Usuario"
                        />
                        {isCreating && (
                            <>
                                <Text style={styles.camposForm}>Contraseña:</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formValues.password_hash ?? ""}
                                    onChangeText={(val) => setFormValues({ ...formValues, password_hash: val })}
                                    placeholder="Contraseña"
                                    secureTextEntry
                                />
                            </>
                        )}
                        <View style={styles.formButtons}>
                            <Pressable style={[styles.button, { backgroundColor: "gray" }]} onPress={handleCancel}>
                                <Text style={styles.textButton}>Cancelar</Text>
                            </Pressable>
                            <Pressable style={styles.button} onPress={handleSubmit}>
                                <Text style={styles.textButton}>Guardar</Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                )}
            </View>
            {showTable && (
                <Pressable
                    style={styles.floatingButton}
                    onPress={() => {
                        setFormValues({ id: "", email: "", nombre: "", rol: "", user: "" });
                        setSelectedId(null);
                        setIsCreating(true);
                        setShowForm(true);
                        Animated.parallel([
                            Animated.timing(tableMargin, { toValue: -100, duration: 200, useNativeDriver: true }),
                            Animated.timing(formOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
                        ]).start();
                    }}
                >
                    <Text style={styles.textButton}>+ Crear Trabajador</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bg_light,
        alignItems: "center",
        position: "relative",
    },
    title: {
        fontSize: 34,
        fontWeight: "bold",
        color: Colors.primary,
        marginBottom: 10,
        textAlign: "center",
    },
    titleForm: {
        fontSize: 24,
        fontWeight: "bold",
        color: Colors.primary,
        marginBottom: 5,
        textAlign: "center",
    },
    camposForm: {
        fontSize: 18,
        color: Colors.primary,
        textAlign: "center",
    },
    contentContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        paddingHorizontal: 20,
        marginBottom: 100,
    },
    tableContainer: {
        flex: 1,
        alignItems: "center",
    },
    headerRow: {
        flexDirection: "row",
        backgroundColor: Colors.primary,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderTopStartRadius: 10,
        borderTopEndRadius: 10,
        minWidth: 450,
        paddingHorizontal: 10,
    },
    row: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: Colors.primary,
        minWidth: 500,
        minHeight: 60,
        alignItems: "center",
        backgroundColor: "#ffffff",
    },
    lastRow: {
        borderBottomStartRadius: 10,
        borderBottomEndRadius: 10,
    },
    headerCell: {
        textAlign: "center",
        fontSize: 16,
        padding: 20,
        paddingHorizontal: 40,
        flex: 1,
        fontWeight: "bold",
        color: "#ffffff",
    },
    cell: {
        flex: 1,
        textAlign: "center",
        fontSize: 16,
        color: Colors.primary,
        paddingVertical: 10,
    },
    cellButtonContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 10,
        gap: 10,
    },
    button: {
        backgroundColor: Colors.primary,
        width: 100,
        height: 50,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 5,
    },
    textButton: {
        fontSize: 16,
        color: "#ffffff",
    },
    formContainer: {
        width: 300,
        padding: 10,
        marginLeft: 20,
        marginRight: 150,
        backgroundColor: "#fff",
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
        overflow: "hidden",
    },
    formButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    floatingButton: {
        position: "absolute",
        bottom: 30,
        right: 30,
        width: 150,
        height: 50,
        marginHorizontal: 10,
        borderRadius: 8,
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
        cursor: "pointer",
    },
    floatingButtonText: {
        fontSize: 24,
        color: "#fff",
        fontWeight: "bold",
        lineHeight: 24,
    },
});
import React, { useState, useEffect } from "react";
import { Platform, View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Config } from "../../constants/config";

// Tipo para los empleados en el estado local
type Employee = {
    id: string;
    email: string;
    nombre: string;
    rol: string;
    user: string;
};

export default function Workers() {
    if (Platform.OS !== "web") {
        return <Redirect href="/" />;
    }

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Formulario de edición
    const [formData, setFormData] = useState<Employee>({
        id: "",
        email: "",
        nombre: "",
        rol: "",
        user: "",
    });

    // Modal para nuevo usuario
    const [showNewUserModal, setShowNewUserModal] = useState(false);
    const [newUserData, setNewUserData] = useState({
        email: "",
        nombre: "",
        rol: "",
        user: "",
        password_hash: "",
    });
    const roles = ['admin', 'cocinero', 'garzon'];

    useEffect(() => {
        const fetchEmployees = async () => {
            setLoading(true);
            setError(null);
            try {
                const userId = await AsyncStorage.getItem('userId');
                const restauranteId = await AsyncStorage.getItem('restaurantId');
                if (!userId || !restauranteId) {
                    setError("No se encontraron credenciales.");
                    setLoading(false);
                    return;
                }
                const response = await fetch(
                    `${Config.API_URL}/trabajadores/?user_id=${userId}&restaurante_id=${restauranteId}`
                );
                const data = await response.json();
                const empleados: Employee[] = Object.entries(data).map(([id, emp]: [string, any]) => ({
                    id,
                    email: emp.email,
                    nombre: emp.nombre,
                    rol: emp.rol,
                    user: emp.user,
                }));
                console.log(empleados);
                setEmployees(empleados);
            } catch (error) {
                setError("Error al cargar trabajadores.");
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    const handleChange = (name: keyof Employee, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectEmployee = (employee: Employee) => {
        setFormData(employee);
    };

    // --- NUEVO USUARIO ---
    const handleNewUserChange = (name: string, value: string) => {
        setNewUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateUser = async () => {
        const user_id = await AsyncStorage.getItem('userId');
        const restaurante_id = await AsyncStorage.getItem('restaurantId');
        if (!user_id || !restaurante_id) {
            alert("No se encontraron credenciales.");
            return;
        }
        const { email, nombre, rol, user, password_hash } = newUserData;
        if (!email || !nombre || !rol || !user || !password_hash) {
            alert("Completa todos los campos.");
            return;
        }
        try {
            const response = await fetch(`${Config.API_URL}/trabajador/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id,
                    restaurante_id,
                    email,
                    nombre,
                    rol,
                    user,
                    password_hash
                })
            });
            if (response.ok) {
                alert("Usuario creado correctamente");
                setShowNewUserModal(false);
                setNewUserData({ email: "", nombre: "", rol: "", user: "", password_hash: "" });
                // Refresca la lista
                const empleadosResponse = await fetch(
                    `${Config.API_URL}/trabajadores/?user_id=${user_id}&restaurante_id=${restaurante_id}`
                );
                const data = await empleadosResponse.json();
                const empleados: Employee[] = Object.entries(data).map(([id, emp]: [string, any]) => ({
                    id,
                    email: emp.email,
                    nombre: emp.nombre,
                    rol: emp.rol,
                    user: emp.user,
                }));
                setEmployees(empleados);
            } else {
                alert("Error al crear usuario");
            }
        } catch (e) {
            alert("Error al crear usuario");
        }
    };

    const handleSubmit = async () => {
        const user_id = await AsyncStorage.getItem('userId');
        const restaurante_id = await AsyncStorage.getItem('restaurantId');
        if (!user_id || !restaurante_id) {
            alert("No se encontraron credenciales.");
            return;
        }
        if (!formData.id) {
            alert("Selecciona un empleado para editar.");
            return;
        }
        const { email, nombre, rol, user } = formData;
        if (!email || !nombre || !rol || !user) {
            alert("Completa todos los campos.");
            return;
        }
        try {
            const response = await fetch(`${Config.API_URL}/trabajador/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id,
                    restaurante_id,
                    trabajador_id: formData.id,
                    email,
                    nombre,
                    rol,
                    user
                })
            });
            if (response.ok) {
                alert("Cambios guardados correctamente");
                // Refresca la lista de empleados
                const empleadosResponse = await fetch(
                    `${Config.API_URL}/trabajadores/?user_id=${user_id}&restaurante_id=${restaurante_id}`
                );
                const data = await empleadosResponse.json();
                const empleados: Employee[] = Object.entries(data).map(([id, emp]: [string, any]) => ({
                    id,
                    email: emp.email,
                    nombre: emp.nombre,
                    rol: emp.rol,
                    user: emp.user,
                }));
                setEmployees(empleados);
            } else {
                alert("Error al guardar cambios");
            }
        } catch (e) {
            alert("Error al guardar cambios");
        }
    };

    // --- FIN NUEVO USUARIO ---

    return (
        <View style={{ flex: 1, flexDirection: "row", backgroundColor: "#ede8e4" }}>
            {/* Tabla de Trabajadores */}
            <View style={{ flex: 1, backgroundColor: "#f1f5f9", borderRadius: 8, margin: 16, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4 }}>
                {/* Botón para nuevo usuario */}
                <TouchableOpacity
                    style={{ backgroundColor: "#64748b", padding: 10, borderRadius: 4, alignItems: "center", margin: 12 }}
                    onPress={() => setShowNewUserModal(true)}
                >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>Nuevo usuario</Text>
                </TouchableOpacity>
                {/* Encabezado de la tabla */}
                <View style={{ flexDirection: "row", backgroundColor: "#64748b", padding: 12 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "bold", color: "#fff" }}>Nombre</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "bold", color: "#fff" }}>Rol</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "bold", color: "#fff" }}>Usuario</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "bold", color: "#fff" }}>Email</Text>
                    </View>
                </View>
                {/* Cuerpo de la tabla */}
                <ScrollView>
                    {loading && (
                        <Text style={{ padding: 16 }}>Cargando...</Text>
                    )}
                    {error && (
                        <Text style={{ color: "red", padding: 16 }}>{error}</Text>
                    )}
                    {employees.map((employee) => (
                        <TouchableOpacity
                            key={employee.id}
                            style={{
                                flexDirection: "row",
                                padding: 12,
                                borderBottomWidth: 1,
                                borderBottomColor: "#e2e8f0",
                                backgroundColor: formData.id === employee.id ? "#cbd5e1" : "transparent"
                            }}
                            onPress={() => handleSelectEmployee(employee)}
                        >
                            <View style={{ flex: 1 }}>
                                <Text>{employee.nombre}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text>{employee.rol}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text>{employee.user}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text>{employee.email}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            {/* Formulario de edición */}
            <View style={{ flex: 1, padding: 20, backgroundColor: "#f1f5f9", borderRadius: 8, margin: 16, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4 }}>
                <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 16 }}>Editar Personal</Text>
                <Text>Nombre</Text>
                <TextInput
                    style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 4, marginBottom: 12, padding: 8 }}
                    value={formData.nombre ?? ""}
                    onChangeText={text => handleChange("nombre", text)}
                />
                <Text>Rol</Text>
                <Picker
                    selectedValue={formData.rol}
                    onValueChange={value => handleChange("rol", value)}
                    style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 4, marginBottom: 12 }}
                >
                    <Picker.Item label="Selecciona un rol" value="" />
                    {roles.map(role => (
                        <Picker.Item key={role} label={role} value={role} />
                    ))}
                </Picker>
                <Text>Usuario</Text>
                <TextInput
                    style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 4, marginBottom: 12, padding: 8 }}
                    value={formData.user ?? ""}
                    onChangeText={text => handleChange("user", text)}
                />
                <Text>Email</Text>
                <TextInput
                    style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 4, marginBottom: 12, padding: 8 }}
                    value={formData.email ?? ""}
                    onChangeText={text => handleChange("email", text)}
                />
                <TouchableOpacity
                    style={{ backgroundColor: "#64748b", padding: 12, borderRadius: 4, alignItems: "center" }}
                    onPress={handleSubmit}
                >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>Guardar Cambios</Text>
                </TouchableOpacity>
            </View>
            {/* Modal para nuevo usuario */}
            <Modal
                visible={showNewUserModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowNewUserModal(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.3)",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <View style={{
                        backgroundColor: "#fff",
                        padding: 24,
                        borderRadius: 8,
                        width: 400,
                        shadowColor: "#000",
                        shadowOpacity: 0.2,
                        shadowRadius: 8
                    }}>
                        <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 16 }}>Nuevo Usuario</Text>
                        <Text>Email</Text>
                        <TextInput
                            style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 4, marginBottom: 12, padding: 8 }}
                            value={newUserData.email ?? ""}
                            onChangeText={text => handleNewUserChange("email", text)}
                        />
                        <Text>Nombre</Text>
                        <TextInput
                            style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 4, marginBottom: 12, padding: 8 }}
                            value={newUserData.nombre}
                            onChangeText={text => handleNewUserChange("nombre", text)}
                        />
                        <Text>Rol</Text>
                        <Picker
                            selectedValue={newUserData.rol}
                            onValueChange={value => handleNewUserChange("rol", value)}
                            style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 4, marginBottom: 12 }}
                        >
                            <Picker.Item label="Selecciona un rol" value="" />
                            {roles.map(role => (
                                <Picker.Item key={role} label={role} value={role} />
                            ))}
                        </Picker>
                        <Text>Usuario</Text>
                        <TextInput
                            style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 4, marginBottom: 12, padding: 8 }}
                            value={newUserData.user}
                            onChangeText={text => handleNewUserChange("user", text)}
                        />
                        <Text>Clave</Text>
                        <TextInput
                            style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 4, marginBottom: 12, padding: 8 }}
                            value={newUserData.password_hash}
                            onChangeText={text => handleNewUserChange("password_hash", text)}
                            secureTextEntry
                        />
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <TouchableOpacity
                                style={{ backgroundColor: "#64748b", padding: 12, borderRadius: 4, alignItems: "center", flex: 1, marginRight: 8 }}
                                onPress={handleCreateUser}
                            >
                                <Text style={{ color: "#fff", fontWeight: "bold" }}>Crear</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ backgroundColor: "#e2e8f0", padding: 12, borderRadius: 4, alignItems: "center", flex: 1 }}
                                onPress={() => setShowNewUserModal(false)}
                            >
                                <Text style={{ color: "#64748b", fontWeight: "bold" }}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
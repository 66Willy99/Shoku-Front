import React, { useState } from "react";
import "../../global.css";
import { Platform, View, Text, Image, ScrollView, Touchable, TouchableOpacity, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Redirect } from "expo-router";

export default function Workers() {
    if (Platform.OS !== "web") {
        return <Redirect href="/" />;
    }

    const [employees, setEmployees] = useState([
    {
        id: 1,
        name: "Juan Perez",
        role: "Chef",
        shift: "Diurno",
        status: "Activo",
        image: "https://dummyimage.com/40",
    },
    {
        id: 2,
        name: "Maria Garcia",
        role: "Mesero",
        shift: "Nocturno",
        status: "Activo",
        image: "https://dummyimage.com/40",
    },
    {
        id: 3,
        name: "Carlos Lopez",
        role: "Bartender",
        shift: "Diurno",
        status: "Inactivo",
        image: "https://dummyimage.com/40",
    },
]);

    const [formData, setFormData] = useState({
        nombre: '',
        rol: '',
        turno: '',
        estado: ''
    });

    // Opciones para los dropdowns
    const roles = ['Chef', 'Mesero', 'Bartender', 'Administrador'];
    const turnos = ['Diurno', 'Nocturno', 'Mixto'];
    const estados = ['Activo', 'Inactivo', 'Vacaciones', 'Licencia'];

const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
        ...prev,
        [name]: value
    }));
};

    const handleSubmit = () => {
    console.log('Datos guardados:', formData);
    setEmployees(prevEmployees =>
        prevEmployees.map(emp =>
            emp.name === formData.nombre
                ? {
                    ...emp,
                    role: formData.rol,
                    shift: formData.turno,
                    status: formData.estado,
                }
                : emp
        )
    );
};

    return (
        <View className="flex flex-row bg-[#ede8e4] flex-1">
            {/* Tabla de Trabajadores */}

            <View className="basis-3/6 bg-slate-100 rounded-lg shadow-md overflow-hidden">
                {/* Encabezado de la tabla */}
                <View className="flex-row bg-slate-500 p-3">
                    <View className="flex-1">
                        <Text className="font-bold text-white">Nombre</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="font-bold text-white">Rol</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="font-bold text-white">Turno</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="font-bold text-white">Estado</Text>
                    </View>
                </View>

                {/* Cuerpo de la tabla */}
                <ScrollView>
                    {employees.map((employee) => (
                        <TouchableOpacity
                            key={employee.id}
                            className="flex-row p-3 border-b border-slate-200 items-center hover:bg-slate-200"
                            onPress={() => {
                                setFormData({
                                    nombre: employee.name,
                                    rol: employee.role,
                                    turno: employee.shift,
                                    estado: employee.status
                                });
                            }}
                        >
                            <View className="flex-1 flex-row items-center">
                                <Image
                                    source={{ uri: employee.image }}
                                    className="w-10 h-10 rounded-full mr-2"
                                />
                                <Text className="text-slate-800">{employee.name}</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-800">{employee.role}</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-800">{employee.shift}</Text>
                            </View>
                            <View className="flex-1">
                                <Text
                                    className={`font-medium ${employee.status === "Activo"
                                        ? "text-green-600"
                                        : "text-red-600"
                                        }`}
                                >
                                    {employee.status}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Crear Personal */}
            <View className="basis-2/6 p-4 bg-white rounded-lg shadow-md">
                <Text className="text-2xl font-bold mb-6 text-center">Editar Personal</Text>

                {/* Campo Nombre */}
                <View className="mb-4">
                    <Text className="text-sm font-medium mb-1">Nombre</Text>
                    <TextInput
                        className="border border-gray-300 rounded-md p-2"
                        value={formData.nombre}
                        onChangeText={(text) => handleChange('nombre', text)}
                    />
                </View>

                {/* Dropdown Rol */}
                <View className="mb-4">
                    <Text className="text-sm font-medium mb-1">Rol</Text>
                    <View className="border border-gray-300 rounded-md">
                        <Picker
                            selectedValue={formData.rol}
                            onValueChange={(itemValue: string) => handleChange('rol', itemValue)}
                        >
                            {roles.map((role) => (
                                <Picker.Item key={role} label={role} value={role} />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Dropdown Turno */}
                <View className="mb-4">
                    <Text className="text-sm font-medium mb-1">Turno</Text>
                    <View className="border border-gray-300 rounded-md">
                        <Picker
                            selectedValue={formData.turno}
                            onValueChange={(itemValue: string) => handleChange('turno', itemValue)}
                        >
                            {turnos.map((turno) => (
                                <Picker.Item key={turno} label={turno} value={turno} />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Dropdown Estado */}
                <View className="mb-6">
                    <Text className="text-sm font-medium mb-1">Estado</Text>
                    <View className="border border-gray-300 rounded-md">
                        <Picker
                            selectedValue={formData.estado}
                            onValueChange={(itemValue: string) => handleChange('estado', itemValue)}
                        >
                            {estados.map((estado) => (
                                <Picker.Item key={estado} label={estado} value={estado} />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Botón Guardar */}
                <TouchableOpacity
                    className="bg-blue-600 py-3 rounded-md"
                    onPress={handleSubmit}
                >
                    <Text className="text-white text-center font-medium">Guardar cambios</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

import React from "react";
import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";
import { Redirect } from "expo-router";
import "../../global.css";
import { Colors } from "@/constants/Colors"; // Asegúrate de que la ruta sea correcta

export default function AdminScreen() {
    if (Platform.OS !== "web") {
        return <Redirect href="/" />;
    }

    const data = [
        { name: "Pedro Roa", orders: "11", avg_time: "8" },
        { name: "Luis Lopez", orders: "8", avg_time: "10" },
        { name: "Diego Lara", orders: "6", avg_time: "11" },
        { name: "María González", orders: "14", avg_time: "7" },
        { name: "Carlos Mendoza", orders: "9", avg_time: "9" },
        { name: "Ana Torres", orders: "12", avg_time: "6" },
        { name: "Javier Ruiz", orders: "7", avg_time: "12" },
    ];

    const data2 = [
        { name: "Ventas del dia", value: "169980" },
        { name: "Pedidos Completados", value: "39" },
        { name: "Tiempo promedio de entrega", value: "16" },
        { name: "Clientes atendidos", value: "35" },
        { name: "Propinas recibidas", value: "169980" },
        { name: "Plato estrella del dia", value: "Pasta" },
    ];

    interface DataWorkers {
        name: string;
        orders: string;
        avg_time: string;
    }

    const ScrollableWorkesTable: React.FC<{ data: DataWorkers[] }> = ({ data }) => {
        return (
                <View className="flex-1 col-span-2 rounded-md">
                    <Text className="text-center" style={{ color: Colors.coffee, fontSize: 24 }}> Desempeño del Personal</Text>
                    <View className="bg-gray-200 m-2 p-2 rounded-md grid grid-cols-1 gap-4" style={{ backgroundColor: Colors.primary}}>
                        {/* Encabezados */}
                        <View className="grid grid-cols-3">
                            <Text style={{ color: Colors.bg_light, fontWeight: "700" }}>Nombre</Text>
                            <Text style={{ color: Colors.bg_light, fontWeight: "700" }}>Pedidos Entregados</Text>
                            <Text style={{ color: Colors.bg_light, fontWeight: "700" }}>Tiempo Promedio</Text>
                        </View>
                        
                        {data.map((item, index) => (
                            <View key={index} className="grid grid-cols-3">
                                <Text style={{ color: Colors.bg_light }}>{item.name}</Text>
                                <Text style={{ color: Colors.bg_light }}>{item.orders}</Text>
                                <Text style={{ color: Colors.bg_light }}>{item.avg_time} min</Text>
                            </View>
                        ))}
                    </View>
                </View>
        );
    };

    const ScrollableDiaryTable: React.FC<{
        data: { name: string; value: string }[];
    }> = ({ data }) => {
        return (
                <View className="grid grid-cols-3 gap-4 col-span-2">
                    {data.map((item, index) => (
                        <View key={index} className="bg-gray-200 p-2 rounded-md place-content-center" style={{ backgroundColor: Colors.primary }}>
                            <Text style={{ color: Colors.bg_light }} className="text-center">{item.value}</Text>
                            <Text style={{ color: Colors.bg_light }} className="text-center">{item.name}</Text>
                        </View>
                    ))}
                </View>
        );
    };

    return (
        <View className="flex-1 bg-white p-4 gap-5">
            <Text className="text-center col-span-3"> Reportes </Text>
            
            {/* Primera fila */}
            <View className="grid grid-cols-3 gap-4 col-span-3" >
                    <ScrollableDiaryTable data={data2}/>
                <View className="bg-gray-200 p-2 rounded-md place-content-center">
                    <Text className="text-center"> Pedidos Completados por hora</Text>
                    <Text className="text-center"> 29 </Text>
                </View>
            </View>
            
            {/* Segunda fila */}
            <View className="grid grid-cols-3 gap-4 col-span-3" >
                    <ScrollableWorkesTable data={data} />
                    <View className="bg-gray-200 p-2 rounded-md place-content-center">
                        <Text className="text-center"> Ventas por dia de la semana</Text>
                        
                    </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({


});
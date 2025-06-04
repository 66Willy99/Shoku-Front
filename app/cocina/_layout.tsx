import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CocinaLayout = ({ children }: { children: React.ReactNode }) => {
    const ws = useRef<WebSocket | null>(null);

    const [pedidos, setPedidos] = useState<
        {
            pedido_id: string;
            mesa_numero: number | string;
            platos: { nombre: string; cantidad: number }[];
        }[]
    >([]);

    // Obtener pedidos confirmados al montar el componente
    useEffect(() => {
        const fetchPedidosConfirmados = async () => {
            const trabajadorStr = await AsyncStorage.getItem("trabajador");
            if (!trabajadorStr) return;
            const trabajador = JSON.parse(trabajadorStr);
            const user_id = trabajador.user_id;
            const restaurante_id = trabajador.restaurante_id;
            if (!user_id || !restaurante_id) return;

            const response = await fetch(
                `http://127.0.0.1:8000/pedidos?user_id=${user_id}&restaurante_id=${restaurante_id}`
            );
            
            const data = await response.json();
            console.log(data.pedidos);
            // Filtrar solo los pedidos cuyo estado_actual sea "confirmado"
            const pedidosConfirmados = Object.entries(data.pedidos)
                .filter(([_, pedido]: any) => pedido.estados?.estado_actual === "confirmado")
                .map(([pedido_id, pedido]: any) => ({
                    ...pedido,
                    pedido_id,
                }));

            // Para cada pedido confirmado, obtener mesa y platos igual que con el websocket
            const pedidosCards = await Promise.all(
                pedidosConfirmados.map(async (pedido: any) => {
                    // Fetch mesa
                    const mesaRes = await fetch(
                        `http://127.0.0.1:8000/mesa?user_id=${user_id}&restaurante_id=${restaurante_id}&mesa_id=${pedido.mesa_id}`
                    );
                    const mesaData = await mesaRes.json();

                    // Fetch platos
                    const platosObj: Record<string, { cantidad: number }> = pedido.platos;
                    const platosArr = await Promise.all(
                        Object.entries(platosObj).map(async ([platoId, { cantidad }]) => {
                            const platoRes = await fetch(
                                `http://127.0.0.1:8000/plato?user_id=${user_id}&restaurante_id=${restaurante_id}&plato_id=${platoId}`
                            );
                            const platoData = await platoRes.json();
                            return { nombre: platoData.nombre, cantidad };
                        })
                    );

                    return {
                        pedido_id: pedido.pedido_id,
                        mesa_numero: mesaData.numero,
                        platos: platosArr,
                    };
                })
            );

            setPedidos(pedidosCards);
        };

        fetchPedidosConfirmados();
    }, []);

    // WebSocket para nuevos pedidos
    useEffect(() => {
        const connectWebSocket = async () => {
            try {
                const trabajadorStr = await AsyncStorage.getItem("trabajador");
                if (!trabajadorStr) return;
                const trabajador = JSON.parse(trabajadorStr);
                const user_id = trabajador.user_id;
                const restaurante_id = trabajador.restaurante_id;
                if (!user_id || !restaurante_id) return;

                ws.current = new WebSocket(`ws://localhost:8000/ws/kitchen/${user_id}/${restaurante_id}`);

                ws.current.onopen = () => {
                    console.log("WebSocket conectado");
                };

                ws.current.onmessage = async (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.evento === "nuevo_pedido") {
                            // Obtén datos del localStorage
                            const trabajadorStr = localStorage.getItem("trabajador");
                            if (!trabajadorStr) return;
                            const trabajador = JSON.parse(trabajadorStr);
                            const user_id = trabajador.user_id;
                            const restaurante_id = trabajador.restaurante_id;

                            // Obtén mesa y platos usando los IDs del mensaje
                            const mesa_id = data.pedido.mesa_id;
                            const platosObj: Record<string, { cantidad: number }> = data.pedido.platos;

                            // Fetch número de mesa
                            const mesaRes = await fetch(
                                `http://127.0.0.1:8000/mesa?user_id=${user_id}&restaurante_id=${restaurante_id}&mesa_id=${mesa_id}`
                            );
                            const mesaData = await mesaRes.json();

                            // Fetch nombres de platos
                            const platosArr = await Promise.all(
                                Object.entries(platosObj).map(async ([platoId, { cantidad }]) => {
                                    const platoRes = await fetch(
                                        `http://127.0.0.1:8000/plato?user_id=${user_id}&restaurante_id=${restaurante_id}&plato_id=${platoId}`
                                    );
                                    const platoData = await platoRes.json();
                                    return { nombre: platoData.nombre, cantidad };
                                })
                            );

                            // Aquí puedes actualizar el estado para mostrar la card
                            setPedidos(prev => [
                                {
                                    pedido_id: data.pedido_id,
                                    mesa_numero: mesaData.numero,
                                    platos: platosArr,
                                },
                                ...prev,
                            ]);
                        }
                    } catch (err) {
                        console.log("Error procesando mensaje:", err);
                    }
                };

                ws.current.onerror = (error) => {
                    console.log("WebSocket error:", error);
                };

                ws.current.onclose = () => {
                    console.log("WebSocket cerrado");
                };
            } catch (e) {
                console.log("Error al conectar WebSocket:", e);
            }
        };

        connectWebSocket();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);

    const childrenArray = React.Children.toArray(children);
    return (
        <View className="flex-1 flex-row bg-neutral-100">
            <View className="flex-1 p-4">
                {pedidos.map((pedido) => (
                    <View key={pedido.pedido_id} className="bg-white rounded-lg shadow p-4 mb-4">
                        <Text className="font-bold text-lg mb-2">Pedido #{pedido.pedido_id}</Text>
                        <Text className="mb-1">Mesa: {pedido.mesa_numero}</Text>
                        <Text className="font-semibold">Platos:</Text>
                        {pedido.platos.map((plato, idx) => (
                            <Text key={idx}>
                                {plato.nombre} x {plato.cantidad}
                            </Text>
                        ))}
                        <TouchableOpacity
                            className="mt-2 bg-blue-500 text-white text-center py-2 rounded"
                            onPress={() => {
                                // Aquí puedes manejar la acción de marcar el pedido como listo
                                console.log(`Pedido ${pedido.pedido_id} marcado como listo`);
                            }}
                        >
                            <Text className="text-white text-center">Marcar como listo</Text>
                        </TouchableOpacity>
                    </View>
                ))}
                {childrenArray[0]}
            </View>
            <View className="flex-1 p-4 border-x border-neutral-300">
                {childrenArray[1]}
            </View>
            <View className="flex-1 p-4">
                {childrenArray[2]}
            </View>
        </View>
    );
};

export default CocinaLayout;
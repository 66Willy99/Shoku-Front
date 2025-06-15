import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Config } from "@/constants/config";
import Swal from 'sweetalert2'
import { Colors } from "@/constants/Colors";
import LoadingScreen from '@/components/ui/LoadingScreen';

const CocinaLayout = ({ children }: { children: React.ReactNode }) => {
    const ws = useRef<WebSocket | null>(null);
    const APIURL = Config.API_URL_LOCAL; //Usa Config.API_URL_LOCAL para desarrollo local o Config.API_URL para producción
    const APIURLWS = Config.API_URL_LOCAL_WS;  //Usa Config.API_URL_LOCAL_WS para desarrollo local o Config.API_URL_WS_PROD para producción
    
    const [pedidos, setPedidos] = useState<
        {
            pedido_id: string;
            mesa_numero: number | string;
            platos: { nombre: string; cantidad: number }[];
            detalle: string; // Detalle opcional
        }[]
    >([]);

    const [pedidosPreparacion, setPedidosPreparacion] = useState<
    {
        pedido_id: string;
        mesa_numero: number | string;
        platos: { nombre: string; cantidad: number }[];
        detalle: string; // Detalle opcional
    }[]
>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Obtener pedidos confirmados al montar el componente
    useEffect(() => {
        const fetchPedidos = async () => {
            const trabajadorStr = await AsyncStorage.getItem("trabajador");
            if (!trabajadorStr) return;
            const trabajador = JSON.parse(trabajadorStr);
            const user_id = trabajador.user_id;
            const restaurante_id = trabajador.restaurante_id;
            if (!user_id || !restaurante_id) return;

            setIsSubmitting(true);
            try {
                // 1. Obtener todos los pedidos (solo IDs)
                const response = await fetch(
                    `${APIURL}/pedidos/?user_id=${user_id}&restaurante_id=${restaurante_id}`
                );
                const data = await response.json();
                const pedidoIds = Object.keys(data.pedidos);

                // 2. Agrega cada card básica apenas llega el ID
                pedidoIds.forEach((pedido_id) => {
                    setPedidos(prev => [
                        ...prev,
                        {
                            pedido_id,
                            mesa_numero: 'Cargando...',
                            platos: [],
                            estado_actual: 'cargando',
                            detalle: 'Cargando...' 
                        }
                    ]);
                    // 3. Obtén detalles y actualiza la card al llegar
                    (async () => {
                        try {
                            const detalleRes = await fetch(
                                `${APIURL}/pedido/detalle?user_id=${user_id}&restaurante_id=${restaurante_id}&pedido_id=${pedido_id}`
                            );
                            const detalleData = await detalleRes.json();
                            const detalle = detalleData.pedido_detalle;
                            if (!detalle) return;
                            const pedidoActualizado = {
                                pedido_id,
                                mesa_numero: detalle.mesa,
                                platos: Object.entries(detalle.platos).map(([nombre, cantidad]) => ({
                                    nombre,
                                    cantidad: Number(cantidad),
                                })),
                                estado_actual: detalle.estado_actual,
                                detalle: detalle.detalle, 
                            };
                            setPedidos(prev =>
                                prev.map(p =>
                                    p.pedido_id === pedido_id ? pedidoActualizado : p
                                )
                            );
                        } catch (e) {
                            // Manejo de error opcional
                        }
                    })();
                });
            } catch (error) {
                console.error("Error al obtener pedidos:", error);
                Swal.fire('Error', 'No se pudieron cargar los pedidos.', 'error');
            } finally {
                setIsSubmitting(false);
            }
        };

        fetchPedidos();
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

                ws.current = new WebSocket(`${APIURLWS}/ws/kitchen/${user_id}/${restaurante_id}`);

                ws.current.onopen = () => {
                    console.log("WebSocket conectado");
                };

                ws.current.onmessage = async (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log(data);
                        if (data.evento === "nuevo_pedido") {
                            // Obtén datos del localStorage
                            const trabajadorStr = localStorage.getItem("trabajador");
                            if (!trabajadorStr) return;
                            const trabajador = JSON.parse(trabajadorStr);
                            const user_id = trabajador.user_id;
                            const restaurante_id = trabajador.restaurante_id;

                            // Fetch detalle del pedido
                            const dataPedido = await fetch(
                                `${APIURL}/pedido/detalle?user_id=${user_id}&restaurante_id=${restaurante_id}&pedido_id=${data.pedido_id}`
                            );
                            const Pedido = await dataPedido.json();
                            const detalle = Pedido.pedido_detalle;

                            setPedidos(prev => [
                                {
                                    pedido_id: data.pedido_id,
                                    mesa_numero: detalle.mesa,
                                    platos: Object.entries(detalle.platos).map(([nombre, cantidad]) => ({
                                        nombre,
                                        cantidad: Number(cantidad),
                                    })),
                                    detalle: detalle.detalle || '', // Aquí se setea el detalle del pedido
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

    const handleMarcarComoListo = async (pedido_id: string) => {
        const result = await Swal.fire({
            title: '¿Marcar como listo?',
            text: '¿Estás seguro de cambiar el estado a "en preparación"?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
            try {
                const trabajadorStr = await AsyncStorage.getItem("trabajador");
                if (!trabajadorStr) return;
                const trabajador = JSON.parse(trabajadorStr);
                const user_id = trabajador.user_id;
                const restaurante_id = trabajador.restaurante_id;

                const response = await fetch(
                    `${APIURL}/pedido`,
                    {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            pedido_id,
                            user_id,
                            restaurante_id,
                            estado_actual: 1
                        })
                    }
                );
                if (response.ok) {
                    // Encuentra el pedido actualizado
                    const pedidoActualizado = pedidos.find(p => p.pedido_id === pedido_id);
                    // Elimínalo de la lista de confirmados
                    setPedidos(prev => prev.filter(p => p.pedido_id !== pedido_id));
                    // Agrégalo a la lista de preparación si existe
                    if (pedidoActualizado) {
                        setPedidosPreparacion(prev => [
                            pedidoActualizado,
                            ...prev,
                        ]);
                    }
                }
            } catch (e) {
                Swal.fire('Error', 'No se pudo actualizar el pedido.', 'error');
            }
        }
    };
    const childrenArray = React.Children.toArray(children);
    if (isSubmitting) {
        return <LoadingScreen message="Cargando pedidos"/>;
    }
    return (
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: Colors.bg_light }}>
            {/* Columna izquierda: pedidos confirmados */}
            <View className="flex-1 p-4">
                <ScrollView>
                    {pedidos.map((pedido) => (
                        <View
                            key={pedido.pedido_id}
                            style={{
                                backgroundColor: Colors.primary,
                                borderRadius: 8,
                                padding: 16,
                                marginBottom: 16,
                            }}
                        >
                            
                            <Text className="font-bold text-lg mb-2 text-white">Pedido #{pedido.pedido_id}</Text>
                            <Text className="font-bold mb-1 text-white">Mesa: {pedido.mesa_numero}</Text>
                            <Text className="font-bold text-white">Detalle: {pedido.detalle}</Text>
                            <Text className="font-semibold text-white">Platos:</Text>
                            {pedido.platos.map((plato, idx) => (
                                <Text key={idx} className="text-white">
                                    
                                    {plato.nombre} x {plato.cantidad} und.
                                </Text>
                            ))}
                            <TouchableOpacity
                                className="mt-2 bg-blue-500 text-white text-center py-2 rounded"
                                onPress={() => handleMarcarComoListo(pedido.pedido_id)}
                            >
                                <Text className="text-white text-center">Aceptar pedido</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
                {childrenArray[0]}
            </View>
            {/* Columna central: pedidos en preparación */}
            <View className="flex-1 p-4 border-x border-neutral-300">
                <ScrollView>
                    {pedidosPreparacion.map((pedido) => (
                        <View key={pedido.pedido_id} className="rounded-lg shadow p-4 mb-4" style={{ backgroundColor: Colors.primary }}>
                            <Text className="font-bold text-lg mb-2 text-white">Pedido #{pedido.pedido_id}</Text>
                            <Text className="font-bold mb-1 text-white">Mesa: {pedido.mesa_numero}</Text>
                            <Text className="font-bold text-white">Detalle: {pedido.detalle}</Text>
                            <Text className="font-semibold text-white">Platos:</Text>
                            {pedido.platos.map((plato, idx) => (
                                <Text key={idx} className="text-white">
                                    {plato.nombre} x {plato.cantidad}
                                </Text>
                            ))}
                            {/* Puedes agregar más acciones aquí si lo deseas */}
                        </View>
                    ))}
                </ScrollView>
                {childrenArray[1]}
            </View>
            {/* Columna derecha */}
            <View className="flex-1 p-4">
                {childrenArray[2]}
            </View>
        </View>
    );
};

export default CocinaLayout;
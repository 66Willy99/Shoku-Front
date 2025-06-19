import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Config } from "@/constants/config";
import Swal from 'sweetalert2';
import { Colors } from "@/constants/Colors";
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Redirect } from 'expo-router';

const TrabajadorLayout = ({ children }: { children: React.ReactNode }) => {
    const ws = useRef<WebSocket | null>(null);
    const APIURL = Config.API_URL;
    const APIURLWS = Config.API_URL_WS;
    const [rol, setRol] = useState<string | null>(null);

    const [pedidos, setPedidos] = useState<
        {
            pedido_id: string;
            mesa_numero: number | string;
            platos: { nombre: string; cantidad: number }[];
            detalle: string;
        }[]
    >([]);
    const [mesas, setMesas] = useState<any[]>([]);
    const [showMesas, setShowMesas] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validar si es garzón
    useEffect(() => {
        const checkRol = async () => {
            const trabajadorStr = await AsyncStorage.getItem("trabajador");
            if (!trabajadorStr) {
                Swal.fire('Error', 'No se encontró información del trabajador.', 'error');
                return;
            }
            const trabajador = JSON.parse(trabajadorStr);
            setRol(trabajador.rol);
        };
        checkRol();
    }, []);

    // Obtener pedidos al montar
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
                const response = await fetch(
                    `${APIURL}/pedidos/?user_id=${user_id}&restaurante_id=${restaurante_id}`
                );
                const data = await response.json();
                const pedidoIds = Object.keys(data.pedidos);

                pedidoIds.forEach((pedido_id) => {
                    setPedidos(prev => [
                        ...prev,
                        {
                            pedido_id,
                            mesa_numero: 'Cargando...',
                            platos: [],
                            detalle: 'Cargando...'
                        }
                    ]);
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
                                detalle: detalle.detalle,
                            };
                            setPedidos(prev =>
                                prev.map(p =>
                                    p.pedido_id === pedido_id ? pedidoActualizado : p
                                )
                            );
                        } catch (e) {}
                    })();
                });
            } catch (error) {
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

                ws.current = new WebSocket(`${APIURLWS}/ws/waiter/${user_id}/${restaurante_id}`);

                ws.current.onopen = () => {
                    console.log("WebSocket conectado (garzón)");
                };

                ws.current.onmessage = async (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.evento === "nuevo_pedido") {
                            const trabajadorStr = localStorage.getItem("trabajador");
                            if (!trabajadorStr) return;
                            const trabajador = JSON.parse(trabajadorStr);
                            const user_id = trabajador.user_id;
                            const restaurante_id = trabajador.restaurante_id;

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
                                    detalle: detalle.detalle || '',
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

    // Traer mesas
    const handleMostrarMesas = async () => {
        setIsSubmitting(true);
        try {
            const trabajadorStr = await AsyncStorage.getItem("trabajador");
            if (!trabajadorStr) return;
            const trabajador = JSON.parse(trabajadorStr);
            const user_id = trabajador.user_id;
            const restaurante_id = trabajador.restaurante_id;
            if (!user_id || !restaurante_id) return;

            const response = await fetch(
                `${APIURL}/mesa/all?user_id=${user_id}&restaurante_id=${restaurante_id}`
            );
            const data = await response.json();
            // Suponiendo que la respuesta es un array de mesas
            setMesas(Array.isArray(data) ? data : []);
            setShowMesas(true);
        } catch (error) {
            Swal.fire('Error', 'No se pudieron cargar las mesas.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (rol && rol !== "garzon") {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.bg_light }}>
                <Text style={{ color: Colors.primary, fontSize: 20, fontWeight: "bold" }}>
                    Solo los garzones pueden acceder a esta sección.
                </Text>
            </View>
        );
    }

    if (isSubmitting) {
        return <LoadingScreen message="Cargando información..." />;
    }

    return (
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: Colors.bg_light }}>
            {/* Columna izquierda: pedidos */}
            <View style={{ flex: 1, padding: 16 }}>
                <Text style={{ fontWeight: "bold", fontSize: 20, color: Colors.primary, marginBottom: 12 }}>
                    Pedidos
                </Text>
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
                            <Text style={{ fontWeight: "bold", fontSize: 18, color: "#fff" }}>Pedido #{pedido.pedido_id}</Text>
                            <Text style={{ fontWeight: "bold", color: "#fff" }}>Mesa: {pedido.mesa_numero}</Text>
                            <Text style={{ fontWeight: "bold", color: "#fff" }}>Detalle: {pedido.detalle}</Text>
                            <Text style={{ fontWeight: "bold", color: "#fff" }}>Platos:</Text>
                            {pedido.platos.map((plato, idx) => (
                                <Text key={idx} style={{ color: "#fff" }}>
                                    {plato.nombre} x {plato.cantidad}
                                </Text>
                            ))}
                        </View>
                    ))}
                </ScrollView>
                {children}
            </View>
            {/* Columna central: mesas */}
            <View style={{ flex: 1, padding: 16, borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#ccc" }}>
                <TouchableOpacity
                    style={{
                        backgroundColor: Colors.primary,
                        borderRadius: 8,
                        padding: 14,
                        marginBottom: 16,
                        alignItems: "center",
                    }}
                    onPress={handleMostrarMesas}
                >
                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>Mostrar Mesas</Text>
                </TouchableOpacity>
                {showMesas && (
                    <ScrollView>
                        {mesas.map((mesa, idx) => (
                            <TouchableOpacity
                                key={mesa.id || idx}
                                style={{
                                    backgroundColor: "#fff",
                                    borderRadius: 8,
                                    padding: 16,
                                    marginBottom: 12,
                                    borderWidth: 1,
                                    borderColor: Colors.primary,
                                }}
                                onPress={() =>
                                    Alert.alert(
                                        `Mesa #${mesa.numero}`,
                                        `Estado: ${mesa.estado}\n${mesa.hora_pedido ? `Hora del pedido: ${mesa.hora_pedido}` : ""}`
                                    )
                                }
                            >
                                <Text style={{ fontWeight: "bold", fontSize: 18, color: Colors.primary }}>
                                    Mesa #{mesa.numero}
                                </Text>
                                <Text style={{ color: Colors.primary }}>Estado: {mesa.estado}</Text>
                                <Text style={{ color: Colors.primary }}>Capacidad: {mesa.capacidad}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
                {children}
            </View>
            {/* Columna derecha */}
            <View style={{ flex: 1, padding: 16 }}>
                {/* Puedes agregar más contenido aquí si lo necesitas */}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: 320,
        backgroundColor: '#fff',
        padding: 32,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    title: {
        textAlign: 'center',
        marginBottom: 24,
        fontSize: 22,
        fontWeight: 'bold',
    },
    label: {
        marginTop: 8,
        marginBottom: 4,
        fontWeight: '500',
    },
    input: {
        width: '100%',
        padding: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 8,
    },
    button: {
        marginTop: 16,
        padding: 12,
        borderRadius: 4,
        backgroundColor: '#0070f3',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default TrabajadorLayout;
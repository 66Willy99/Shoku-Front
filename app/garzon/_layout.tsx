import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet, Alert, Modal } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import Icon from '../../components/ui/Icon';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Config } from "@/constants/config";
import { SvgXml } from "react-native-svg";
import Swal from 'sweetalert2';

// Manejo global de errores
const handleError = (error: any, context: string) => {
    console.error(`Error en ${context}:`, error);
    // Evitar mostrar alertas si es un error de conexión común
    if (error?.name !== 'AbortError' && error?.code !== 'NETWORK_ERROR') {
        console.warn(`Error no crítico en ${context}:`, error.message || error);
    }
};

const mesaDisponibleSVG = `
<svg fill="#000000" height="60px" width="60px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-153.3 -153.3 817.60 817.60" xml:space="preserve" transform="matrix(-1, 0, 0, 1, 0, 0)rotate(0)">
<g id="SVGRepo_bgCarrier" stroke-width="0" transform="translate(0,0), scale(1)">
<rect x="-153.3" y="-153.3" width="817.60" height="817.60" rx="408.8" fill="#c6d16c" strokewidth="0"></rect>
</g>
<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="1.022"></g>
<g id="SVGRepo_iconCarrier">
<g>
<path d="M391.5,0c-4.142,0-7.5,3.358-7.5,7.5v120c0,4.687-3.813,8.5-8.5,8.5s-8.5-3.813-8.5-8.5V7.5c0-4.142-3.358-7.5-7.5-7.5 S352,3.358,352,7.5v120c0,4.687-3.813,8.5-8.5,8.5s-8.5-3.813-8.5-8.5V7.5c0-4.142-3.358-7.5-7.5-7.5S320,3.358,320,7.5v120 c0,4.687-3.813,8.5-8.5,8.5s-8.5-3.813-8.5-8.5V7.5c0-4.142-3.358-7.5-7.5-7.5S288,3.358,288,7.5v160 c0,12.958,10.542,23.5,23.5,23.5c4.687,0,8.5,3.813,8.5,8.5v73.409c-13.759,3.374-24,15.806-24,30.591v160 c0,26.191,21.309,47.5,47.5,47.5s47.5-21.309,47.5-47.5v-160c0-14.785-10.241-27.216-24-30.591V199.5c0-4.687,3.813-8.5,8.5-8.5 c12.958,0,23.5-10.542,23.5-23.5V7.5C399,3.358,395.642,0,391.5,0z M376,303.5v160c0,17.92-14.58,32.5-32.5,32.5 S311,481.42,311,463.5v-160c0-9.098,7.402-16.5,16.5-16.5h32C368.598,287,376,294.402,376,303.5z M375.5,176 c-12.958,0-23.5,10.542-23.5,23.5V272h-17v-72.5c0-12.958-10.542-23.5-23.5-23.5c-4.687,0-8.5-3.813-8.5-8.5v-18.097 c2.638,1.027,5.503,1.597,8.5,1.597c6.177,0,11.801-2.399,16-6.31c4.199,3.911,9.823,6.31,16,6.31s11.801-2.399,16-6.31 c4.199,3.911,9.823,6.31,16,6.31c2.997,0,5.862-0.57,8.5-1.597V167.5C384,172.187,380.187,176,375.5,176z"></path>
<path d="M183.5,0c-20.479,0-38.826,11.623-51.663,32.728C118.86,54.064,112,84.07,112,119.5c0,25.652,13.894,49.464,36.26,62.144 c7.242,4.105,11.74,12.106,11.74,20.88v70.385c-13.759,3.374-24,15.806-24,30.591v160c0,26.191,21.309,47.5,47.5,47.5 s47.5-21.309,47.5-47.5v-160c0-14.785-10.241-27.216-24-30.591v-70.385c0-8.774,4.499-16.775,11.74-20.88 C241.106,168.964,255,145.152,255,119.5c0-35.43-6.86-65.436-19.837-86.772C222.326,11.623,203.979,0,183.5,0z M216,303.5v160 c0,17.92-14.58,32.5-32.5,32.5S151,481.42,151,463.5v-160c0-9.098,7.402-16.5,16.5-16.5h32C208.598,287,216,294.402,216,303.5z M211.343,168.595C199.412,175.359,192,188.36,192,202.524V272h-17v-69.476c0-14.164-7.412-27.165-19.342-33.929 C137.981,158.574,127,139.762,127,119.5c0-32.68,6.104-59.99,17.653-78.978C154.809,23.826,168.242,15,183.5,15 s28.691,8.826,38.847,25.522C233.896,59.51,240,86.82,240,119.5C240,139.762,229.019,158.574,211.343,168.595z"></path>
<path d="M191.5,304c-4.142,0-7.5,3.358-7.5,7.5v16c0,4.142,3.358,7.5,7.5,7.5s7.5-3.358,7.5-7.5v-16 C199,307.358,195.642,304,191.5,304z"></path>
<path d="M191.5,352c-4.142,0-7.5,3.358-7.5,7.5v72c0,4.142,3.358,7.5,7.5,7.5s7.5-3.358,7.5-7.5v-72 C199,355.358,195.642,352,191.5,352z"></path>
<path d="M351.5,304c-4.142,0-7.5,3.358-7.5,7.5v16c0,4.142,3.358,7.5,7.5,7.5s7.5-3.358,7.5-7.5v-16 C359,307.358,355.642,304,351.5,304z"></path>
<path d="M351.5,352c-4.142,0-7.5,3.358-7.5,7.5v72c0,4.142,3.358,7.5,7.5,7.5s7.5-3.358,7.5-7.5v-72 C359,355.358,355.642,352,351.5,352z"></path>
</g>
</g>
</svg>
`;

const mesaOcupadaSVG = `
<svg viewBox="-180 -180 960.00 960.00" version="1.1" width="60px" height="60px" fill="#000000" xmlns="http://www.w3.org/2000/svg">
<g id="SVGRepo_bgCarrier" stroke-width="0" transform="translate(0,0), scale(1)">
<rect x="-180" y="-180" width="960.00" height="960.00" rx="480" fill="#fa3e29" strokewidth="0"></rect>
</g>
<g id="SVGRepo_iconCarrier">
<g id="g10449" transform="matrix(0.95173205,0,0,0.95115787,13.901174,12.168794)" style="stroke-width:1.05103">
<path style="color:#000000;fill:#000000;stroke-width:1.05103;stroke-linecap:round;stroke-linejoin:round;-inkscape-stroke:none;paint-order:stroke fill markers" d="m 248.07279,-12.793664 c -72.13241,0 -131.33949,59.250935 -131.33949,131.392074 0,38.92115 17.25502,74.07152 44.45432,98.20884 C 58.500207,254.84854 -14.606185,358.21398 -14.606185,477.846 a 35.037921,35.037921 0 0 0 35.034809,35.03543 H 188.95771 c 6.88866,-25.46243 17.91968,-49.15043 32.45932,-70.0688 H 58.235927 C 73.730605,344.39181 153.38526,271.2598 248.07279,271.2598 c 13.12286,0 25.94065,1.45153 38.35524,4.13353 4.26325,-42.80875 34.59589,-78.30933 74.73011,-90.32371 11.57931,-19.5408 18.25414,-42.27592 18.25414,-66.47121 0,-72.141139 -59.20709,-131.392074 -131.33949,-131.392074 z m 0,70.068794 c 34.24293,0 61.26987,27.028459 61.26987,61.32328 0,34.29482 -27.02694,61.3274 -61.26987,61.3274 -34.24293,0 -61.27192,-27.03258 -61.27192,-61.3274 0,-34.294821 27.02899,-61.32328 61.27192,-61.32328 z" id="path295"></path>
<path id="path295-3" style="color:#000000;fill:#000000;stroke-width:1.05103;stroke-linecap:round;stroke-linejoin:round;-inkscape-stroke:none;paint-order:stroke fill markers" d="m 405.68024,197.47637 c -57.70598,0 -105.07159,47.40151 -105.07159,105.11449 0,31.13694 13.80343,59.25664 35.56289,78.56652 -82.15001,30.43306 -140.63449,113.12556 -140.63449,208.83127 a 28.030337,28.030337 0 0 0 28.0273,28.0278 h 182.11589 182.11452 a 28.030337,28.030337 0 0 0 28.0286,-28.0278 c 0,-95.70539 -58.4835,-178.39795 -140.63307,-208.83127 21.75947,-19.30988 35.56153,-47.42958 35.56153,-78.56652 0,-57.71298 -47.3656,-105.11449 -105.07158,-105.11449 z m 0,56.05559 c 27.39437,0 49.01562,21.62301 49.01562,49.0589 0,27.43588 -21.62125,49.06164 -49.01562,49.06164 -27.39437,0 -49.017,-21.62576 -49.017,-49.06164 0,-27.43589 21.62263,-49.0589 49.017,-49.0589 z m 0,171.18664 c 75.7501,0 139.47372,58.50552 151.86952,137.24226 H 405.68024 253.81075 C 266.2065,483.22412 329.93014,424.7186 405.68024,424.7186 Z"></path>
</g>
</g>
</svg>
`;

const mesaPagadaSVG = `
<svg width="150px" height="150px" viewBox="-7.2 -7.2 38.40 38.40" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"><rect x="-7.2" y="-7.2" width="38.40" height="38.40" rx="19.2" fill="#ffb30f" strokewidth="0"></rect></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="12" cy="12" r="9" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></circle> <path d="M14.5 9.08333L14.3563 8.96356C13.9968 8.66403 13.5438 8.5 13.0759 8.5H10.75C9.7835 8.5 9 9.2835 9 10.25V10.25C9 11.2165 9.7835 12 10.75 12H13.25C14.2165 12 15 12.7835 15 13.75V13.75C15 14.7165 14.2165 15.5 13.25 15.5H10.412C9.8913 15.5 9.39114 15.2969 9.01782 14.934L9 14.9167" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12 8L12 7" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12 17V16" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
`;

type Mesa = {
    id: string;
    numero: number;
    estado: string;
    capacidad: number;
    imagen?: string;
    hora_pedido?: string;
};

export default function GarzonLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const screenWidth = Dimensions.get("window").width;
    const [showMesas, setShowMesas] = useState(false);
    const [showPedidos, setShowPedidos] = useState(false);
    const [mesas, setMesas] = useState<Mesa[]>([]);
    const [pedidosTerminados, setPedidosTerminados] = useState<any[]>([]);
    const [loadingMesas, setLoadingMesas] = useState(false);
    const [loadingPedidos, setLoadingPedidos] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);
    const [changingState, setChangingState] = useState(false);
    const ws = useRef<WebSocket | null>(null);
    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
    

    // WebSocket para actualización de mesas y pedidos en tiempo real
    useEffect(() => {
        let isMounted = true;
        
        const connectWebSocket = async () => {
            try {
                const trabajadorStr = await AsyncStorage.getItem("trabajador");
                if (!trabajadorStr || !isMounted) return;
                
                const trabajador = JSON.parse(trabajadorStr);
                const user_id = trabajador.user_id;
                const restaurante_id = trabajador.restaurante_id;
                if (!user_id || !restaurante_id || !isMounted) return;

                // Cerrar conexión anterior si existe
                if (ws.current) {
                    ws.current.close();
                    ws.current = null;
                }

                ws.current = new WebSocket(`${Config.API_URL_WS}/ws/kitchen/${user_id}/${restaurante_id}`);

                ws.current.onopen = () => {
                    if (!isMounted) return;
                    console.log("WebSocket conectado (garzón)");
                    // Limpiar timeout de reconexión si existe
                    if (reconnectTimeout.current) {
                        clearTimeout(reconnectTimeout.current);
                        reconnectTimeout.current = null;
                    }
                };

                ws.current.onmessage = async (event) => {
                    if (!isMounted) return;
                    try {
                        const data = JSON.parse(event.data);
                        console.log("Mensaje WS recibido:", data);

                        // Si el evento es actualización de mesa, actualiza el estado de las mesas
                        if (data.evento === "actualizar_mesa" && data.mesa_id && data.estado) {
                            if (!isMounted) return;
                            setMesas(prevMesas =>
                                prevMesas.map(m =>
                                    m.id === data.mesa_id
                                        ? { ...m, estado: data.estado }
                                        : m
                                )
                            );
                        }

                        // Si el evento es pedido terminado, agrégalo a la lista de pedidos listos
                        if (data.evento === "pedido_terminado" || data.evento === "nuevo_pedido_terminado") {
                            if (!isMounted) return;
                            // Obtener detalles del pedido terminado directamente
                            const trabajadorStr = await AsyncStorage.getItem("trabajador");
                            if (!trabajadorStr || !isMounted) return;
                            const trabajador = JSON.parse(trabajadorStr);
                            const user_id = trabajador.user_id;
                            const restaurante_id = trabajador.restaurante_id;

                            try {
                                // Obtener detalles del pedido específico
                                const detalleRes = await fetch(
                                    `${Config.API_URL}/pedido/detalle?user_id=${user_id}&restaurante_id=${restaurante_id}&pedido_id=${data.pedido_id}`
                                );
                                const detalleData = await detalleRes.json();
                                const detalle = detalleData.pedido_detalle;
                                
                                if (detalle && detalle.estado_actual === "terminado") {
                                    if (!isMounted) return;
                                    const nuevoPedido = {
                                        pedido_id: data.pedido_id,
                                        mesa_numero: detalle.mesa,
                                        platos: Object.entries(detalle.platos).map(([nombre, cantidad]) => ({
                                            nombre,
                                            cantidad: Number(cantidad),
                                        })),
                                        estado_actual: detalle.estado_actual,
                                        detalle: detalle.detalle || 'Sin detalle',
                                        hora_pedido: new Date().toLocaleTimeString() // Hora actual cuando llega
                                    };

                                    // Agregar el nuevo pedido a la lista (solo si no existe ya)
                                    setPedidosTerminados(prevPedidos => {
                                        const existePedido = prevPedidos.some(p => p.pedido_id === data.pedido_id);
                                        if (!existePedido) {
                                            return [nuevoPedido, ...prevPedidos];
                                        }
                                        return prevPedidos;
                                    });

                                    // Mostrar notificación al garzón solo si el componente está montado
                                    if (isMounted) {
                                        
                                        // Usar setTimeout para evitar problemas de concurrencia
                                        setTimeout(async () => {
                                            if (isMounted) {
                                                try {
                                                    await Swal.fire({
                                                        title: "¡Pedido listo!",
                                                        text: `El pedido #${data.pedido_id} de la mesa ${detalle.mesa} está terminado y listo para entregar.`,
                                                        icon: "info",
                                                        timer: 3000,
                                                        showConfirmButton: true,
                                                        confirmButtonText: "Entendido",
                                                        confirmButtonColor: Colors.secondary,
                                                    });
                                                } catch (alertError) {
                                                    console.log("Error mostrando alerta:", alertError);
                                                }
                                            }
                                        }, 100);
                                    }
                                }
                            } catch (error) {
                                console.error("Error al obtener detalles del pedido terminado:", error);
                            }
                        }

                        // Si el evento es pedido entregado, removerlo de la lista
                        if (data.evento === "pedido_actualizado" && data.estado_actual === "entregado") {
                            if (!isMounted) return;
                            setPedidosTerminados(prevPedidos => 
                                prevPedidos.filter(p => p.pedido_id !== data.pedido_id)
                            );
                        }

                        // Si el evento es actualización de estado de pedido
                        if (data.evento === "pedido_actualizado") {
                            // Si el pedido cambió a terminado, agregarlo
                            if (data.estado_actual === "terminado") {
                                const trabajadorStr = await AsyncStorage.getItem("trabajador");
                                if (!trabajadorStr) return;
                                const trabajador = JSON.parse(trabajadorStr);
                                const user_id = trabajador.user_id;
                                const restaurante_id = trabajador.restaurante_id;

                                try {
                                    const detalleRes = await fetch(
                                        `${Config.API_URL}/pedido/detalle?user_id=${user_id}&restaurante_id=${restaurante_id}&pedido_id=${data.pedido_id}`
                                    );
                                    const detalleData = await detalleRes.json();
                                    const detalle = detalleData.pedido_detalle;
                                    
                                    if (detalle) {
                                        const nuevoPedido = {
                                            pedido_id: data.pedido_id,
                                            mesa_numero: detalle.mesa,
                                            platos: Object.entries(detalle.platos).map(([nombre, cantidad]) => ({
                                                nombre,
                                                cantidad: Number(cantidad),
                                            })),
                                            estado_actual: detalle.estado_actual,
                                            detalle: detalle.detalle || 'Sin detalle',
                                            hora_pedido: new Date().toLocaleTimeString()
                                        };

                                        setPedidosTerminados(prevPedidos => {
                                            const existePedido = prevPedidos.some(p => p.pedido_id === data.pedido_id);
                                            if (!existePedido) {
                                                return [nuevoPedido, ...prevPedidos];
                                            }
                                            return prevPedidos;
                                        });

                                        await Swal.fire({
                                            title: "¡Pedido listo!",
                                            text: `El pedido #${data.pedido_id} de la mesa ${detalle.mesa} está terminado y listo para entregar.`,
                                            icon: "info",
                                            timer: 3000,
                                            showConfirmButton: true,
                                            confirmButtonText: "Entendido",
                                            confirmButtonColor: Colors.secondary,
                                        });
                                    }
                                } catch (error) {
                                    console.error("Error al obtener detalles del pedido actualizado:", error);
                                }
                            }
                            // Si el pedido cambió a entregado, removerlo
                            else if (data.estado_actual === "entregado") {
                                setPedidosTerminados(prevPedidos => 
                                    prevPedidos.filter(p => p.pedido_id !== data.pedido_id)
                                );
                            }
                        }

                        // Si el evento es solicitud de cliente
                        if (data.evento === "solicitud_cliente") {
                            if (!isMounted) return;
                            
                            console.log('🔔 Solicitud de cliente recibida:', data);
                            
                            // Mostrar alerta inmediata al garzón
                            setTimeout(async () => {
                                if (isMounted) {
                                    try {
                                        await Swal.fire({
                                            title: "🔔 Llamada de Mesa",
                                            text: `La Mesa ${data.mesa_numero || data.mesa_id || 'N/A'} solicita atención del mesero`,
                                            icon: "info",
                                            timer: 15000,
                                            timerProgressBar: true,
                                            showConfirmButton: true,
                                            confirmButtonText: "Ok",
                                            confirmButtonColor: Colors.secondary,
                                            allowOutsideClick: false,
                                            allowEscapeKey: false
                                        });
                                    } catch (alertError) {
                                        console.log("Error mostrando alerta de solicitud cliente:", alertError);
                                    }
                                }
                            }, 100);
                        }
                    } catch (err) {
                        console.log("Error procesando mensaje WS:", err);
                    }
                };

                ws.current.onerror = (error) => {
                    if (!isMounted) return;
                    console.log("WebSocket error:", error);
                };

                ws.current.onclose = () => {
                    if (!isMounted) return;
                    console.log("WebSocket cerrado - intentando reconectar en 5 segundos...");
                    // Intentar reconectar después de 5 segundos
                    reconnectTimeout.current = setTimeout(() => {
                        if (isMounted) {
                            connectWebSocket();
                        }
                    }, 5000);
                };
            } catch (e) {
                if (!isMounted) return;
                console.log("Error al conectar WebSocket:", e);
                // Intentar reconectar después de 5 segundos en caso de error
                reconnectTimeout.current = setTimeout(() => {
                    if (isMounted) {
                        connectWebSocket();
                    }
                }, 5000);
            }
        };

        connectWebSocket();

        return () => {
            isMounted = false;
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
                reconnectTimeout.current = null;
            }
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
        };
    }, []);

    const handleMostrarMesas = async () => {
        try {
            setShowMesas(!showMesas);
            // Cerrar pedidos si está abierto
            if (showPedidos) setShowPedidos(false);
            
            if (!showMesas) {
                setLoadingMesas(true);
                const trabajadorStr = await AsyncStorage.getItem("trabajador");
                if (!trabajadorStr) return;
                
                const trabajador = JSON.parse(trabajadorStr);
                const user_id = trabajador.user_id;
                const restaurante_id = trabajador.restaurante_id;
                if (!user_id || !restaurante_id) return;

                const response = await fetch(
                    `${Config.API_URL}/mesa/all?user_id=${user_id}&restaurante_id=${restaurante_id}`
                );
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                // Adaptar la respuesta al array de mesas
                const mesasArray: Mesa[] = data.mesas
                    ? Object.entries(data.mesas).map(([id, mesa]: [string, any]) => ({
                        id,
                        numero: mesa.numero,
                        estado: mesa.estado,
                        capacidad: mesa.capacidad,
                        imagen: mesa.imagen,
                        hora_pedido: mesa.hora_pedido,
                    }))
                    : [];
                setMesas(mesasArray);
            }
        } catch (error) {
            handleError(error, 'cargar mesas');
            setMesas([]);
        } finally {
            setLoadingMesas(false);
        }
    };

    const handleMostrarPedidos = async () => {
        setShowPedidos(!showPedidos);
        // Cerrar mesas si está abierto
        if (showMesas) setShowMesas(false);
        
        if (!showPedidos) {
            setLoadingPedidos(true);
            try {
                const trabajadorStr = await AsyncStorage.getItem("trabajador");
                if (!trabajadorStr) return;
                const trabajador = JSON.parse(trabajadorStr);
                const user_id = trabajador.user_id;
                const restaurante_id = trabajador.restaurante_id;
                if (!user_id || !restaurante_id) return;

                // 1. Obtener todos los pedidos
                const response = await fetch(
                    `${Config.API_URL}/pedidos/?user_id=${user_id}&restaurante_id=${restaurante_id}`
                );
                const data = await response.json();
                
                // 2. Filtrar y formatear pedidos terminados directamente
                const pedidosTerminadosArray = await Promise.all(
                    Object.entries(data.pedidos)
                        .filter(([_, pedido]: [string, any]) => pedido.estados?.estado_actual === "terminado")
                        .map(async ([pedido_id, pedido]: [string, any]) => {
                            try {
                                // Obtener detalles completos del pedido para obtener nombres
                                const detalleRes = await fetch(
                                    `${Config.API_URL}/pedido/detalle?user_id=${user_id}&restaurante_id=${restaurante_id}&pedido_id=${pedido_id}`
                                );
                                const detalleData = await detalleRes.json();
                                const detalle = detalleData.pedido_detalle;
                                
                                if (detalle) {
                                    return {
                                        pedido_id,
                                        mesa_numero: detalle.mesa, // Ya viene el número de la mesa, no el ID
                                        platos: Object.entries(detalle.platos).map(([nombre, cantidad]: [string, any]) => ({
                                            nombre, // Ya viene el nombre del plato, no el ID
                                            cantidad: Number(cantidad),
                                        })),
                                        estado_actual: detalle.estado_actual,
                                        detalle: detalle.detalle || 'Sin detalle',
                                        hora_pedido: pedido.estados.terminado ? 
                                            new Date(pedido.estados.terminado).toLocaleTimeString() : 
                                            'No especificada'
                                    };
                                } else {
                                    // Fallback si no hay detalle disponible
                                    return {
                                        pedido_id,
                                        mesa_numero: pedido.mesa_id,
                                        platos: Object.entries(pedido.platos).map(([plato_id, platoInfo]: [string, any]) => ({
                                            nombre: plato_id,
                                            cantidad: platoInfo.cantidad,
                                        })),
                                        estado_actual: pedido.estados.estado_actual,
                                        detalle: pedido.detalle || 'Sin detalle',
                                        hora_pedido: pedido.estados.terminado ? 
                                            new Date(pedido.estados.terminado).toLocaleTimeString() : 
                                            'No especificada'
                                    };
                                }
                            } catch (error) {
                                console.error(`Error obteniendo detalle del pedido ${pedido_id}:`, error);
                                // Fallback en caso de error
                                return {
                                    pedido_id,
                                    mesa_numero: pedido.mesa_id,
                                    platos: Object.entries(pedido.platos).map(([plato_id, platoInfo]: [string, any]) => ({
                                        nombre: plato_id,
                                        cantidad: platoInfo.cantidad,
                                    })),
                                    estado_actual: pedido.estados.estado_actual,
                                    detalle: pedido.detalle || 'Sin detalle',
                                    hora_pedido: pedido.estados.terminado ? 
                                        new Date(pedido.estados.terminado).toLocaleTimeString() : 
                                        'No especificada'
                                };
                            }
                        })
                );

                setPedidosTerminados(pedidosTerminadosArray.filter(Boolean)); // Filtrar elementos null/undefined
                
            } catch (e) {
                console.error("Error al cargar pedidos terminados:", e);
                setPedidosTerminados([]);
            } finally {
                setLoadingPedidos(false);
            }
        }
    };

    const handleEntregarPedido = async (pedido_id: string) => {
        const result = await Swal.fire({
            title: "Confirmar entrega",
            text: "¿Confirmas que el pedido ha sido entregado al cliente?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, entregado",
            cancelButtonText: "Cancelar",
            confirmButtonColor: Colors.secondary,
            cancelButtonColor: Colors.grey,
        });

        if (!result.isConfirmed) return;

        try {
            const trabajadorStr = await AsyncStorage.getItem("trabajador");
            if (!trabajadorStr) return;
            const trabajador = JSON.parse(trabajadorStr);
            const user_id = trabajador.user_id;
            const restaurante_id = trabajador.restaurante_id;

            const response = await fetch(
                `${Config.API_URL}/pedido`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        pedido_id,
                        user_id,
                        restaurante_id,
                        estado_actual: 3 // Estado entregado
                    })
                }
            );
            
            if (response.ok) {
                // Eliminar el pedido de la lista
                setPedidosTerminados(prev => 
                    prev.filter(p => p.pedido_id !== pedido_id)
                );
                await Swal.fire({
                    title: "¡Éxito!",
                    text: "Pedido marcado como entregado",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                });
            } else {
                await Swal.fire({
                    title: "Error",
                    text: "No se pudo actualizar el estado del pedido",
                    icon: "error",
                    confirmButtonColor: Colors.primary,
                });
            }
        } catch (e) {
            await Swal.fire({
                title: "Error de conexión",
                text: "No se pudo conectar al servidor",
                icon: "error",
                confirmButtonColor: Colors.primary,
            });
        }
    };

    const handleMesaPress = (mesa: Mesa) => {
        setSelectedMesa(mesa);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedMesa(null);
        setChangingState(false);
    };

    const handleChangeTableState = async () => {
        if (!selectedMesa) return;
        
        // Guardar referencia a la mesa antes de cerrar el modal
        const mesaRef = selectedMesa;
        
        // Cerrar el modal primero
        closeModal();
        
        // Pequeña pausa para asegurar que el modal se cierre completamente
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Confirmación adicional con SweetAlert
        const result = await Swal.fire({
            title: "Confirmar cambio de estado",
            text: `¿Estás seguro de que quieres marcar la Mesa #${mesaRef.numero} como disponible?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, marcar como disponible",
            cancelButtonText: "Cancelar",
            confirmButtonColor: Colors.secondary,
            cancelButtonColor: Colors.grey,
        });

        if (!result.isConfirmed) return;
        
        try {
            setChangingState(true);
            
            const trabajadorStr = await AsyncStorage.getItem("trabajador");
            if (!trabajadorStr) {
                await Swal.fire({
                    title: "Error",
                    text: "No se pudo obtener información del trabajador",
                    icon: "error",
                    confirmButtonColor: Colors.primary,
                });
                return;
            }
            
            const trabajador = JSON.parse(trabajadorStr);
            const user_id = trabajador.user_id;
            const restaurante_id = trabajador.restaurante_id;
            
            if (!user_id || !restaurante_id) {
                await Swal.fire({
                    title: "Error",
                    text: "Información de trabajador incompleta",
                    icon: "error",
                    confirmButtonColor: Colors.primary,
                });
                return;
            }

            console.log(`Cambiando estado de mesa ${mesaRef.id} a disponible...`);
            
            const response = await fetch(`${Config.API_URL}/mesa/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user_id,
                    restaurante_id: restaurante_id,
                    mesa_id: mesaRef.id,
                    capacidad: mesaRef.capacidad,
                    estado: "disponible",
                    numero: mesaRef.numero
                })
            });

            if (response.ok) {
                // Actualizar estado local inmediatamente
                setMesas(prevMesas =>
                    prevMesas.map(m =>
                        m.id === mesaRef.id
                            ? { ...m, estado: "disponible" }
                            : m
                    )
                );
                
                // Mostrar confirmación de éxito con SweetAlert
                await Swal.fire({
                    title: "¡Estado actualizado!",
                    text: `La Mesa #${mesaRef.numero} ahora está disponible`,
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                });
            } else {
                const errorData = await response.json();
                console.error("Error del servidor:", errorData);
                await Swal.fire({
                    title: "Error",
                    text: errorData.detail || "No se pudo cambiar el estado de la mesa",
                    icon: "error",
                    confirmButtonColor: Colors.primary,
                });
            }
        } catch (error) {
            console.error("Error cambiando estado de mesa:", error);
            await Swal.fire({
                title: "Error de conexión",
                text: "No se pudo conectar al servidor para cambiar el estado",
                icon: "error",
                confirmButtonColor: Colors.primary,
            });
        } finally {
            setChangingState(false);
        }
    };

    const getMesaSVG = (estado: string) => {
        if (estado === "disponible") return <SvgXml xml={mesaDisponibleSVG} width={60} height={60} />;
        if (estado === "ocupado") return <SvgXml xml={mesaOcupadaSVG} width={60} height={60} />;
        if (estado === "pagado") return <SvgXml xml={mesaPagadaSVG} width={60} height={60} />;
        return <Icon color={Colors.primary} size={60} />;
    };

    // Función para refrescar pedidos terminados
    const refreshPedidosTerminados = async () => {
        try {
            const trabajadorStr = await AsyncStorage.getItem("trabajador");
            if (!trabajadorStr) return;
            const trabajador = JSON.parse(trabajadorStr);
            const user_id = trabajador.user_id;
            const restaurante_id = trabajador.restaurante_id;
            if (!user_id || !restaurante_id) return;

            const response = await fetch(
                `${Config.API_URL}/pedidos/?user_id=${user_id}&restaurante_id=${restaurante_id}`
            );
            const data = await response.json();
            
            const pedidosTerminadosArray = Object.entries(data.pedidos)
                .filter(([_, pedido]: [string, any]) => pedido.estados?.estado_actual === "terminado")
                .map(([pedido_id, pedido]: [string, any]) => ({
                    pedido_id,
                    mesa_numero: pedido.mesa_id,
                    platos: Object.entries(pedido.platos).map(([plato_id, platoInfo]: [string, any]) => ({
                        nombre: plato_id,
                        cantidad: platoInfo.cantidad,
                    })),
                    estado_actual: pedido.estados.estado_actual,
                    detalle: pedido.detalle || 'Sin detalle',
                    hora_pedido: pedido.estados.terminado ? 
                        new Date(pedido.estados.terminado).toLocaleTimeString() : 
                        'No especificada'
                }));

            setPedidosTerminados(pedidosTerminadosArray);
        } catch (e) {
            console.error("Error al refrescar pedidos terminados:", e);
        }
    };

    // Auto-refresh cada 30 segundos cuando se muestran los pedidos
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (showPedidos) {
            interval = setInterval(() => {
                refreshPedidosTerminados();
            }, 30000); // Refrescar cada 30 segundos
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [showPedidos]);

    return (
        <View style={styles.container}>
            {/* Header con icono Shoku */}
            <View style={styles.header}>
                <Icon color={Colors.light_primary} size={70} />
                <Text style={styles.headerText}>Shoku</Text>
            </View>
            {/* Botones principales en vertical */}
            <ScrollView contentContainerStyle={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, { width: screenWidth * 0.8 }]}
                    onPress={handleMostrarMesas}
                >
                    <Text style={styles.buttonText}>Mesas</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, { width: screenWidth * 0.8 }]}
                    onPress={handleMostrarPedidos}
                >
                    <Text style={styles.buttonText}>Ver Pedidos</Text>
                </TouchableOpacity>
                
                
                {/* Mostrar mesas */}
                {showMesas && (
                    <View style={{ width: "100%", marginTop: 16 }}>
                        {loadingMesas ? (
                            <Text style={{ textAlign: "center", color: Colors.primary }}>Cargando mesas...</Text>
                        ) : mesas.length === 0 ? (
                            <Text style={{ textAlign: "center", color: Colors.primary }}>No hay mesas disponibles.</Text>
                        ) : (
                            mesas.map((mesa) => (
                                <TouchableOpacity
                                    key={mesa.id || mesa.numero}
                                    style={styles.mesaCard}
                                    onPress={() => handleMesaPress(mesa)}
                                >
                                    <View style={{ marginRight: 16 }}>
                                        {getMesaSVG(mesa.estado)}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.mesaTitle}>Mesa #{mesa.numero}</Text>
                                        <Text style={styles.mesaText}>Estado: {mesa.estado}</Text>
                                        <Text style={styles.mesaText}>Capacidad: {mesa.capacidad}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                )}

                {/* Mostrar pedidos terminados */}
                {showPedidos && (
                    <View style={{ width: "100%", marginTop: 16 }}>
                        {loadingPedidos ? (
                            <Text style={{ textAlign: "center", color: Colors.primary }}>Cargando pedidos...</Text>
                        ) : pedidosTerminados.length === 0 ? (
                            <Text style={{ textAlign: "center", color: Colors.primary }}>No hay pedidos listos para entregar.</Text>
                        ) : (
                            pedidosTerminados.map((pedido) => (
                                <View key={pedido.pedido_id} style={styles.pedidoCard}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.pedidoTitle}>Pedido #{pedido.pedido_id}</Text>
                                        <Text style={styles.pedidoText}>Mesa: {pedido.mesa_numero}</Text>
                                        <Text style={styles.pedidoText}>Detalle: {pedido.detalle}</Text>
                                        <Text style={styles.pedidoSubtitle}>Platos:</Text>
                                        {pedido.platos.map((plato: any, idx: number) => (
                                            <Text key={idx} style={styles.platoText}>
                                                • {plato.nombre} x {plato.cantidad}
                                            </Text>
                                        ))}
                                        <Text style={styles.pedidoText}>Hora: {pedido.hora_pedido}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.entregarButton}
                                        onPress={() => handleEntregarPedido(pedido.pedido_id)}
                                    >
                                        <Text style={styles.entregarButtonText}>Entregar</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>
            {/* Contenido de la página */}
            <View style={{ flex: 1 }}>
                {children}
            </View>

            {/* Modal para cambiar estado de mesa */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {selectedMesa && (
                            <>
                                <Text style={styles.modalTitle}>Mesa #{selectedMesa.numero}</Text>
                                <Text style={styles.modalInfo}>Estado actual: {selectedMesa.estado}</Text>
                                <Text style={styles.modalInfo}>Capacidad: {selectedMesa.capacidad}</Text>
                                {selectedMesa.hora_pedido && (
                                    <Text style={styles.modalInfo}>Hora del pedido: {selectedMesa.hora_pedido}</Text>
                                )}

                                {selectedMesa.estado !== "disponible" && selectedMesa.estado !== "ocupado" && (
                                    <View style={styles.modalActions}>
                                        <TouchableOpacity
                                            style={[styles.modalButton, styles.confirmButton]}
                                            onPress={handleChangeTableState}
                                        >
                                            <Text style={styles.confirmButtonText}>
                                                Marcar como Disponible
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={closeModal}
                                >
                                    <Text style={styles.cancelButtonText}>Cerrar</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bg_light,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 24,
        backgroundColor: Colors.primary,
    },
    icon: {
        marginRight: 12,
    },
    headerText: {
        fontSize: 32,
        color: "#fff",
        fontWeight: "bold",
        letterSpacing: 2,
    },
    buttonContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 32,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: 18,
        paddingHorizontal: 28,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 20,
        elevation: 2,
    },
    testButton: {
        backgroundColor: Colors.secondary,
    },
    diagnosticButton: {
        backgroundColor: Colors.yellow,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
    },
    mesaCard: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 12,
        alignItems: "center",
        elevation: 2,
    },
    mesaTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.primary,
        marginBottom: 2,
    },
    mesaText: {
        fontSize: 15,
        color: Colors.primary,
        marginBottom: 1,
    },
    pedidoCard: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
        alignItems: "flex-start",
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: Colors.secondary,
    },
    pedidoTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.primary,
        marginBottom: 6,
    },
    pedidoText: {
        fontSize: 14,
        color: Colors.primary,
        marginBottom: 4,
    },
    pedidoSubtitle: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.primary,
        marginTop: 6,
        marginBottom: 4,
    },
    platoText: {
        fontSize: 13,
        color: Colors.grey,
        marginLeft: 8,
        marginBottom: 2,
    },
    entregarButton: {
        backgroundColor: Colors.secondary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginLeft: 12,
        alignSelf: "center",
    },
    entregarButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 24,
        margin: 20,
        minWidth: 300,
        maxWidth: "90%",
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: Colors.primary,
        marginBottom: 16,
        textAlign: "center",
    },
    modalInfo: {
        fontSize: 16,
        color: Colors.primary,
        marginBottom: 8,
        textAlign: "center",
    },
    modalActions: {
        marginTop: 20,
        marginBottom: 10,
    },
    modalButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginVertical: 6,
        alignItems: "center",
    },
    confirmButton: {
        backgroundColor: Colors.secondary,
    },
    confirmButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    cancelButton: {
        backgroundColor: Colors.grey,
    },
    cancelButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});
import React, { useEffect, useState, useRef } from "react";
import {
    Platform,
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
    Dimensions,
    Pressable,
} from "react-native";
import { Redirect } from "expo-router";
import { Picker } from "@react-native-picker/picker";
// @ts-ignore
import {QRCodeSVG} from "qrcode.react";
import { Config } from '@/constants/config';
import LoadingScreen from '@/components/ui/LoadingScreen';


export default function AdminScreen() {
    if (Platform.OS !== "web") {
            return <Redirect href="/" />;
        }

    const [mesas, setMesas] = useState<{ id: string; numero: string | number; estado: string; capacidad: number }[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMesa, setSelectedMesa] = useState<{ id: string; numero: string | number; estado: string; capacidad: number } | null>(null);
    const [nuevoEstado, setNuevoEstado] = useState<string>("");
    const [sillas, setSillas] = useState<{ id: string; mesa_id: string }[]>([]);
    const [qrMesaId, setQrMesaId] = useState<string | null>(null);
    const [qrSillas, setQrSillas] = useState<{ id: string; mesa_id: string }[]>([]);
    const [qrVisible, setQrVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(-Dimensions.get("window").height)).current; // Empieza fuera de pantalla arriba
    const [isSubmitting, setIsSubmitting] = useState(false);

    const user_id = localStorage.getItem("userId");
    const restaurante_id = localStorage.getItem("restaurantId");
    useEffect(() => {
        const fetchMesas = async () => {
            setIsSubmitting(true);
            try{
                if (Platform.OS !== "web") return;
                const user_id = localStorage.getItem("userId");
                if (!user_id) return;
                const restaurante_id = localStorage.getItem("restaurantId");
                if (!user_id || !restaurante_id) return;



                const res = await fetch(`${Config.API_URL}/mesa/all?user_id=${user_id}&restaurante_id=${restaurante_id}`);
                const data = await res.json();
                const mesasArray = Array.isArray(data.mesas)
                    ? data.mesas
                    : Object.keys(data.mesas).map((key) => ({ id: key, ...data.mesas[key] }));
                setMesas(mesasArray);
            }catch (err){
                console.error('Error al obtener mesas:', err);
            }finally{
                setIsSubmitting(false); 
            }
        };
        fetchMesas();
    }, []);

    useEffect(() => {
        const fetchSillas = async () => {
            const user_id = localStorage.getItem("userId");
            const restaurante_id = localStorage.getItem("restaurantId");
            if (!user_id || !restaurante_id) return;
            setIsSubmitting(true);
            try{
            const res = await fetch(`${Config.API_URL}/silla/all?user_id=${user_id}&restaurante_id=${restaurante_id}`);
            const data = await res.json();
            // Ajusta según la estructura real de tu backend
            const sillasArray = Array.isArray(data.sillas)
                ? data.sillas
                : Object.keys(data.sillas).map((key) => ({ id: key, ...data.sillas[key] }));
            setSillas(sillasArray);
            }catch(err){
                console.error('Error al obtener sillas:', err);
            }finally{
                setIsSubmitting(false);
            }
        };
        fetchSillas();
    }, []);

    useEffect(() => {
        if (selectedMesa) {
            setNuevoEstado(selectedMesa.estado);
        }
    }, [selectedMesa]);

    const openModal = (mesa: { id: string; numero: string | number; estado: string; capacidad: number }) => {
        setSelectedMesa(mesa);
        setModalVisible(true);
        slideAnim.setValue(-Dimensions.get("window").height); // Arriba de la pantalla
        Animated.timing(slideAnim, {
            toValue: 0, // Centro de la pantalla
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeModal = () => {
        Animated.timing(slideAnim, {
            toValue: -Dimensions.get("window").height, // Sale hacia arriba
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setModalVisible(false);
            setSelectedMesa(null);
        });
    };

    const handleGuardarEstado = async () => {
        if (!selectedMesa) return;
        const user_id = localStorage.getItem("userId");
        const restaurante_id = localStorage.getItem("restaurantId");
        const mesa_id = selectedMesa.id;
        if (!user_id || !restaurante_id) return;
        setIsSubmitting(true);
        console.log(selectedMesa);
        console.log(`Actualizando estado de la mesa ${mesa_id} a ${nuevoEstado}`);
        try{
            await fetch(`${Config.API_URL}/mesa/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user_id,
                    restaurante_id: restaurante_id,
                    mesa_id: mesa_id,
                    capacidad: selectedMesa.capacidad,
                    estado: nuevoEstado,
                    numero: selectedMesa.numero,
                }),
            });
        }catch (err){
            console.error('Error al obtener mesa:', err);
        }finally{
            setIsSubmitting(false);
        }

        setMesas(prev =>
            prev.map(m =>
                m.id === selectedMesa.id ? { ...m, estado: nuevoEstado } : m
            )
        );
        closeModal();
    };

    const openQrModal = (mesaId: string) => {
        const sillasMesa = sillas.filter(silla => silla.mesa_id === mesaId);
        setQrMesaId(mesaId);
        setQrSillas(sillasMesa);
        setQrVisible(true);
    };

    if (Platform.OS !== "web") {
        return <Redirect href="/" />;
    }

    const estadosMesa = ["en preparacion", "disponible", "ocupado", "terminado", "pagado"];

    if (isSubmitting) {
        return (<LoadingScreen message="Cargando mesas..." />);
    } 

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
                {mesas.map((mesa) => (
                    <TouchableOpacity
                        key={mesa.id}
                        style={[
                            styles.mesa,
                            {
                                backgroundColor:
                                    mesa.estado === "en preparacion"
                                        ? "#ffe082"
                                        : mesa.estado === "disponible"
                                        ? "#c8e6c9"
                                        : mesa.estado === "ocupado"
                                        ? "#ffab91"
                                        : mesa.estado === "terminado"
                                        ? "#b3e5fc"
                                        : mesa.estado === "pagado"
                                        ? "#d1c4e9"
                                        : "white",
                            },
                        ]}
                        onPress={() => openModal(mesa)}
                    >
                        <Text style={styles.mesaText}>Mesa {mesa.numero}</Text>
                        <TouchableOpacity
                            style={{
                                marginTop: 8,
                                backgroundColor: "#333",
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 6,
                            }}
                            onPress={e => {
                                e.stopPropagation?.();
                                openQrModal(mesa.id);
                            }}
                        >
                            <Text style={{ color: "white" }}>Ver QR</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Modal
                visible={modalVisible}
                transparent
                animationType="none"
                onRequestClose={closeModal}
            >
                <Pressable
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}
                    onPress={closeModal}
                >
                    <Animated.View
                        style={{
                            transform: [{ translateY: slideAnim }],
                            alignSelf: "center",
                        }}
                    >
                        <Pressable
                            onPress={() => {}}
                            style={{
                                backgroundColor: "white",
                                borderRadius: 16,
                                padding: 32,
                                alignItems: "center",
                                minWidth: 300,
                                minHeight: 220,
                                elevation: 8,
                            }}
                        >
                            <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 12 }}>
                                Mesa {selectedMesa?.numero}
                            </Text>
                            <Text style={{ fontSize: 16, marginBottom: 8 }}>
                                Estado actual: {selectedMesa?.estado}
                            </Text>
                            <Picker
                                selectedValue={nuevoEstado}
                                style={{ width: 200, marginBottom: 16 }}
                                onValueChange={(itemValue) => setNuevoEstado(itemValue)}
                            >
                                {estadosMesa.map((estado) => (
                                    <Picker.Item key={estado} label={estado} value={estado} />
                                ))}
                            </Picker>
                            <TouchableOpacity
                                onPress={handleGuardarEstado}
                                style={{
                                    backgroundColor: "#ee7b6c",
                                    paddingHorizontal: 24,
                                    paddingVertical: 10,
                                    borderRadius: 8,
                                    marginTop: 8,
                                }}
                            >
                                <Text style={{ color: "white", fontWeight: "bold" }}>Guardar</Text>
                            </TouchableOpacity>
                        </Pressable>
                    </Animated.View>
                </Pressable>
            </Modal>

            <Modal
                visible={qrVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setQrVisible(false)}
            >
                <Pressable
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" }}
                    onPress={() => setQrVisible(false)}
                >
                    <View
                        style={{
                            backgroundColor: "white",
                            borderRadius: 16,
                            padding: 32,
                            alignItems: "center",
                            minWidth: 320,
                            minHeight: 220,
                            elevation: 8,
                        }}
                    >
                        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 12, textAlign: "center" }}>
                            QRs de Mesa {selectedMesa?.numero}
                        </Text>
                        <ScrollView contentContainerStyle={{ alignItems: "center" }}>
                            {qrSillas.length === 0 ? (
                                <Text>No hay sillas para esta mesa.</Text>
                            ) : (
                                qrSillas.map((silla) => (
                                    <View key={silla.id} style={{ marginBottom: 24, alignItems: "center" }}>
                                        <QRCodeSVG value={`${Config.APP_URL}/${user_id}/${restaurante_id}/${qrMesaId}/${silla.id}`}/>
                                        <Text style={{ color: "#333", marginBottom: 4, textAlign: "center" }}>
                                            Silla ID: {silla.id}
                                        </Text>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                        <TouchableOpacity
                            onPress={() => setQrVisible(false)}
                            style={{
                                backgroundColor: "#ee7b6c",
                                paddingHorizontal: 24,
                                paddingVertical: 10,
                                borderRadius: 8,
                                marginTop: 8,
                            }}
                        >
                            <Text style={{ color: "white", fontWeight: "bold" }}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ede8e4',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        backgroundColor: '#ee7b6c',
        padding: 20,
        marginBottom: 16,
    },
    mesa: {
        width: 128,
        height: 128,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 8,
    },
    mesaText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ee7b6c',
    },
});

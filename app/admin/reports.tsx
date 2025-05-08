import React from "react";
import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";
import { Redirect } from "expo-router";
import "../../global.css";

export default function AdminScreen() {
    if (Platform.OS !== "web") {
        return <Redirect href="/" />;
    }

    const data = [
        { name: "Pedro Roa", orders: "11", avg_time: "8" },
        { name: "Luis Lopez", orders: "8", avg_time: "10" },
        { name: "Diego Lara", orders: "6", avg_time: "11" },
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
            <View style={styles.workersTableOuterContainer}>
                <ScrollView horizontal={true} style={styles.workersTableContainer}>
                    <View style={styles.workersTableInnerContainer}>
                        {/* Encabezados */}
                        <View style={styles.workersHeaderRow}>
                            <Text style={styles.workersHeaderCell}>Nombre</Text>
                            <Text style={styles.workersHeaderCell}>Pedidos Entregados</Text>
                            <Text style={styles.workersHeaderCell}>Tiempo Promedio</Text>
                        </View>
    
                        {/* Filas */}
                        {data.map((item, index) => (
                            <View key={index} style={styles.workersRow}>
                                <Text style={styles.workersCell}>{item.name}</Text>
                                <Text style={styles.workersCell}>{item.orders}</Text>
                                <Text style={styles.workersCell}>{item.avg_time} min</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>
        );
    };

    const ScrollableDiaryTable: React.FC<{
        data: { name: string; value: string }[];
    }> = ({ data }) => {
        return (
            <View style={styles.diaryTableOuterContainer}>
                <View style={styles.diaryTableContainer}>
                    {data.map((item, index) => (
                        <View key={index} style={styles.diaryTableCell}>
                            <Text style={styles.diaryTableValue}>{item.value}</Text>
                            <Text style={styles.diaryTableName}>{item.name}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}> Reportes de NombreRestaurante</Text>
            
            {/* Primera fila */}
            <View style={styles.rowContainer}>
                <View style={[styles.twoThirds, styles.content]}>
                    <ScrollableDiaryTable data={data2} />
                </View>
                <View style={[styles.oneThird, styles.content]}>
                    <Text> Pedidos Completados por hora</Text>
                    <Text> 29 </Text>
                </View>
            </View>
            
            {/* Segunda fila */}
            <View style={styles.rowContainer}>
                <View style={[styles.twoThirds, styles.content]}>
                    <Text> Trabajadores</Text>
                    <ScrollableWorkesTable data={data} />
                </View>
                <View style={[styles.oneThird, styles.content]}>
                    <Text> Ventas por dia de la semana</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    rowContainer: {
        flexDirection: "row",
        flex: 1,
        marginBottom: 10,
    },
    twoThirds: {
        flex: 2,
    },
    oneThird: {
        flex: 1,
    },
    content: {
        backgroundColor: "#a68",
        padding: 10,
        margin: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#333",
    },
    tableContainer: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        backgroundColor: "white",
    },
    headerRow: {
        flexDirection: "row",
        backgroundColor: "#6200ee",
        padding: 10,
    },
    row: {
        flexDirection: "row",
        padding: 10,
        borderBottomWidth: 1,
        borderColor: "#ddd",
    },
    headerCell: {
        color: "white",
        fontWeight: "bold",
    },
    cell: {
        color: "#333",
    },
    workersTableOuterContainer: {
        flex: 1,
        width: '100%',
    },
    workersTableContainer: {
        flex: 1,
        borderRadius: 10,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    workersTableInnerContainer: {
        minWidth: '100%', // Asegura que el contenido sea scrollable
    },
    workersHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#6200ee',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        paddingVertical: 15,
    },
    workersHeaderCell: {
        flex: 1,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        minWidth: 150, // Ancho mínimo para cada columna
        paddingHorizontal: 10,
    },
    workersRow: {
        flexDirection: 'row',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
    },
    workersCell: {
        flex: 1,
        color: '#333',
        textAlign: 'center',
        minWidth: 150, // Mismo ancho que los headers
        paddingHorizontal: 10,
    },
    diaryTableOuterContainer: {
        flex: 1,  // Toma el espacio disponible del contenedor padre
        width: '100%',
    },
    diaryTableContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        height: '100%',  // Toma el 100% del outer container
        justifyContent: 'space-between',
        alignContent: 'space-between',  // Distribuye el espacio entre filas
    },
    diaryTableCell: {
        width: '32%',  // Para 3 columnas
        height: '48%', // Para 2 filas (dejando 4% de espacio entre ellas)
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        justifyContent: 'space-between',  // Valor arriba, nombre abajo
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    diaryTableValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        flex: 1,
        textAlignVertical: 'center',
    },
    diaryTableName: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
});
import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const mesas = [
  { id: '1', estado: 'Ocupada', personas: 2 },
  { id: '2', estado: 'Ocupada', personas: 1 },
  { id: '3', estado: 'Libre' },
  { id: '4', estado: 'Ocupada', personas: 3 },
  { id: '6', estado: 'En preparación' },
];

export default function Mesas() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ver mesas como lista</Text>
      <FlatList
        data={mesas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.mesa,
              item.estado === 'Libre' ? styles.libre : styles.ocupada,
            ]}
            onPress={() => router.push(`/garzon/mesas/${item.id}`)}
          >
            <Text style={styles.mesaText}>
              Mesa {item.id} - {item.estado}{' '}
              {item.personas ? `, ${item.personas} personas` : ''}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 18, marginBottom: 10 },
  mesa: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 6,
  },
  mesaText: { color: '#fff', fontWeight: 'bold' },
  libre: { backgroundColor: '#90D07F' },
  ocupada: { backgroundColor: '#F67E6E' },
});

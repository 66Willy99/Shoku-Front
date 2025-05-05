import { Platform, View, Text, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';

export default function AdminScreen() {
    if (Platform.OS !== 'web') {
        return <Redirect href="/" />; 
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add Restaurant (Solo Web)</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ede8e4',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333', 
        backgroundColor: '#ee7b6c',
        padding: 20
    }
});
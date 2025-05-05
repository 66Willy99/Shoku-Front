import { Stack } from 'expo-router';
import { View } from 'react-native';
import CustomHeader from '../../components/ui/CustomHeader';

export default function AdminLayout() {
return (
    <View style={{ flex: 1, backgroundColor: '#eee9e5' }}>
        <CustomHeader />
        <Stack 
            screenOptions={{
                headerShown: false, 
        }}>
            <Stack.Screen 
                name="index" 
                options={{
                    headerShown: false 
                }} />
            <Stack.Screen name="add-restaurant" />
            <Stack.Screen name="reports" />
        </Stack>
    </View>
);
}
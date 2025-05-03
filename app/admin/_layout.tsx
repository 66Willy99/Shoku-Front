import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function AdminLayout() {
return (
    <View style={{ flex: 1, backgroundColor: '#eee9e5' }}>
        <Stack 
            screenOptions={{
                headerShown: false, 
        }}>
            <Stack.Screen 
                name="index" 
                options={{
                    headerShown: false 
                }} />
        </Stack>
    </View>
);
}
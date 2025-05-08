import { Text, TextProps, StyleSheet } from 'react-native';
import { useFonts, Baloo2_400Regular, Baloo2_700Bold } from '@expo-google-fonts/baloo-2';

export default function BoldText({ style, ...props }: TextProps) {
    const [fontsLoaded] = useFonts({ 
        BalooRegular: Baloo2_400Regular,
        BalooBold: Baloo2_700Bold,
    });

    if (!fontsLoaded) {
        return <Text {...props} />;
    }

    return (
        <Text 
        style={[styles.baseText, style]} 
        {...props}
        />
    );
}

const styles = StyleSheet.create({
    baseText: {
        fontFamily: 'BalooBold',
    }
});
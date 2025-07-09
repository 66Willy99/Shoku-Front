// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { COLORS } from '../../../../../theme';
import { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, ActivityIndicator } from 'react-native';
import Home from '../../..';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQRParams } from '../../../../../context/QRParamsContext';

export default function MesaSillaPage() {
    const { userId, restauranteId, mesaId, sillaId } = useLocalSearchParams();
    const { setQRParams } = useQRParams();
    const router = useRouter();

    useEffect(() => {
        // Convertir a strings y validar que existen
        const userIdStr = userId as string;
        const restauranteIdStr = restauranteId as string;
        const mesaIdStr = mesaId as string;
        const sillaIdStr = sillaId as string;

        if (userIdStr && restauranteIdStr && mesaIdStr && sillaIdStr) {
            console.log('🔗 Guardando parámetros QR:', { userIdStr, restauranteIdStr, mesaIdStr, sillaIdStr });
            
            // Guardar en AsyncStorage para compatibilidad con código existente
            const saveToStorageAndRedirect = async () => {
                try {
                    await AsyncStorage.setItem("userId", userIdStr);
                    await AsyncStorage.setItem("restauranteId", restauranteIdStr);
                    await AsyncStorage.setItem("mesaId", mesaIdStr);
                    await AsyncStorage.setItem("sillaId", sillaIdStr);
                    
                    // Guardar en el contexto global para acceso en cualquier tab
                    await setQRParams({
                        userId: userIdStr,
                        restauranteId: restauranteIdStr,
                        mesaId: mesaIdStr,
                        sillaId: sillaIdStr
                    });

                    // Redirigir a la tab de inicio para limpiar la URL
                    router.replace('/(tabs)');
                } catch (error) {
                    console.error('Error saving QR params:', error);
                }
            };

            saveToStorageAndRedirect();
        }
    }, [
        typeof userId === 'string' ? userId : JSON.stringify(userId),
        typeof restauranteId === 'string' ? restauranteId : JSON.stringify(restauranteId),
        typeof mesaId === 'string' ? mesaId : JSON.stringify(mesaId),
        typeof sillaId === 'string' ? sillaId : JSON.stringify(sillaId),
        setQRParams,
        router
    ]); // Dependencias más específicas

  return (
      <>
          {/* Mostrar un mensaje temporal mientras se procesa */}
          <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999
          }}>
              <View style={{
                  padding: 30,
                  borderRadius: 15,
                  backgroundColor: 'white',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                  alignItems: 'center',
                  minWidth: 250
              }}>
                  <Text style={{ 
                      color: COLORS.primary, 
                      fontSize: 24, 
                      fontWeight: 'bold',
                      marginBottom: 10,
                      textAlign: 'center'
                  }}>
                      ¡Bienvenido a Shoku!
                  </Text>
                  <Text style={{ 
                      color: COLORS.grayDark,
                      fontSize: 16,
                      marginBottom: 20,
                      textAlign: 'center'
                  }}>
                      Configurando tu mesa...
                  </Text>
                  <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
          </View>
          
          {Home()}
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: COLORS.primary,
              tabBarStyle: { backgroundColor: COLORS.white },
            }}
          >
            <Tabs.Screen name="index"   options={{ title: 'Inicio'  }} />
            <Tabs.Screen name="carta"   options={{ title: 'Carta'   }} />
            <Tabs.Screen name="carrito" options={{ title: 'Pedido'  }} />
            <Tabs.Screen name="pago"     options={{ title: 'Pagar'   }} />
            <Tabs.Screen name="estado"   options={{ title: 'Atención'}} />
          </Tabs>
      </>
  );
}

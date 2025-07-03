import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Config } from '../constants/config';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync();

    // Listener para notificaciones recibidas mientras la app está abierta
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida:', notification);
    });

    // Listener para cuando el usuario toca una notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Usuario tocó la notificación:', response);
      const data = response.notification.request.content.data;
      
      // Si es una notificación de pedido listo, podrías navegar a una pantalla específica
      if (data?.tipo === 'pedido_listo') {
        console.log(`Pedido ${data.pedido_id} de la mesa ${data.mesa_numero} está listo`);
        // Aquí puedes agregar navegación específica si es necesario
        // navigation.navigate('Pedidos', { pedidoId: data.pedido_id });
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Función para mostrar notificación local inmediata
  const showLocalNotification = async (title: string, body: string, data?: any) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Mostrar inmediatamente
    });
  };

  // Función para registrar token del garzón en el backend
  const registerGarzonToken = async (userId: string, restauranteId: string, trabajadorId: string) => {
    try {
      const pushToken = await AsyncStorage.getItem('pushToken');
      
      if (!pushToken) {
        console.log('No hay token push disponible');
        return false;
      }

      const response = await fetch(`${Config.API_URL}/notifications/register-garzon-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          restaurante_id: restauranteId,
          trabajador_id: trabajadorId,
          token: pushToken,
          tipo: 'expo'
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Token de garzón registrado exitosamente:', result);
        await AsyncStorage.setItem('garzonTokenRegistered', 'true');
        return true;
      } else {
        console.error('❌ Error registrando token de garzón:', result);
        return false;
      }
    } catch (error) {
      console.error('❌ Error en registerGarzonToken:', error);
      return false;
    }
  };

  // Función para probar notificaciones
  const testNotification = async (userId: string, restauranteId: string) => {
    try {
      const response = await fetch(`${Config.API_URL}/notifications/test-garzon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          restaurante_id: restauranteId
        }),
      });

      const result = await response.json();
      console.log('📱 Resultado de prueba de notificación:', result);
      return result;
    } catch (error) {
      console.error('❌ Error en prueba de notificación:', error);
      return null;
    }
  };

  return { 
    showLocalNotification, 
    registerGarzonToken, 
    testNotification 
  };
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Pedidos',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
      enableVibrate: true,
      description: 'Notificaciones de pedidos listos para servir',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('❌ No se pudo obtener permisos para notificaciones push');
      return;
    }
    
    // Obtener el token de push de Expo
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      
      if (!projectId || projectId === 'your-project-id-here') {
        console.warn('⚠️ Project ID no configurado. Configura EXPO_PROJECT_ID en tu .env');
        // Para desarrollo, puedes usar un ID temporal
        console.log('📝 Usando configuración de desarrollo para notificaciones locales');
      }
      
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: projectId || 'development-project',
      })).data;
      console.log('📱 Push token obtenido:', token);
      
      // Guardar el token en AsyncStorage
      await AsyncStorage.setItem('pushToken', token);
    } catch (error) {
      console.error('❌ Error obteniendo token push:', error);
    }
  } else {
    console.log('❌ Debe usar un dispositivo físico para notificaciones push');
  }

  return token;
}

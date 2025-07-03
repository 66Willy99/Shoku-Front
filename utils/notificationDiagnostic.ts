import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

/**
 * Script de diagnóstico para expo-notifications
 * Ejecutar este script para identificar problemas específicos
 */

export async function diagnosticarNotificaciones() {
  console.log('🔍 === DIAGNÓSTICO DE NOTIFICACIONES ===');
  
  try {
    // 1. Verificar si es dispositivo físico
    console.log('📱 Dispositivo físico:', Device.isDevice);
    console.log('📱 Marca del dispositivo:', Device.brand);
    console.log('📱 Modelo del dispositivo:', Device.modelName);
    console.log('📱 Sistema operativo:', Device.osName, Device.osVersion);

    // 2. Verificar configuración de Expo
    console.log('⚙️ Expo Config:', Constants.expoConfig?.name);
    console.log('⚙️ Project ID:', Constants.expoConfig?.extra?.eas?.projectId);
    console.log('⚙️ Experiencia ID:', Constants.expoConfig?.extra?.eas?.projectId);

    // 3. Verificar permisos
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('🔐 Estado actual de permisos:', existingStatus);

    if (existingStatus !== 'granted') {
      console.log('🔐 Solicitando permisos...');
      const { status } = await Notifications.requestPermissionsAsync();
      console.log('🔐 Nuevos permisos:', status);
    }

    // 4. Configurar canales de notificación (Android)
    if (Device.osName === 'Android') {
      console.log('🤖 Configurando canales de Android...');
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
      console.log('✅ Canal configurado');
    }

    // 5. Intentar obtener token
    console.log('🎫 Obteniendo token push...');
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || 'development-test';
    
    // Verificar configuración VAPID para web
    const vapidKey = (Constants.expoConfig as any)?.notification?.vapidPublicKey;
    console.log('🔑 VAPID Key configurado:', vapidKey ? 'Sí' : 'No');
    
    if (!vapidKey && Device.osName === 'web') {
      console.warn('⚠️ VAPID Key no configurado para notificaciones web');
      console.log('📝 Usando configuración por defecto para testing...');
    }
    
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });
    
    console.log('✅ Token obtenido exitosamente:', tokenData.data);

    // 6. Probar notificación local
    console.log('📨 Probando notificación local...');
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "✅ ¡Notificaciones funcionando!",
        body: "Si ves esto, las notificaciones están configuradas correctamente.",
        data: { test: true },
      },
      trigger: { 
        seconds: 2,
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      },
    });

    console.log('🎉 === DIAGNÓSTICO COMPLETADO EXITOSAMENTE ===');
    return {
      success: true,
      token: tokenData.data,
      device: Device.modelName,
      os: `${Device.osName} ${Device.osVersion}`,
      permissions: 'granted'
    };

  } catch (error) {
    console.error('❌ === ERROR EN DIAGNÓSTICO ===');
    console.error('Error:', error);
    console.error('Mensaje:', error instanceof Error ? error.message : 'Error desconocido');
    console.error('Stack:', error instanceof Error ? error.stack : 'Sin stack trace');
    
    // Diagnóstico específico para errores comunes
    let errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    let suggestions = [];
    
    if (errorMessage.includes('vapidPublicKey')) {
      suggestions.push('1. Configura EXPO_VAPID_PUBLIC_KEY en tu archivo .env');
      suggestions.push('2. Genera claves VAPID: node scripts/generate-vapid-keys.js');
      suggestions.push('3. Reinicia el servidor Expo después de configurar');
    }
    
    if (errorMessage.includes('projectId')) {
      suggestions.push('1. Configura EXPO_PROJECT_ID en tu archivo .env');
      suggestions.push('2. Obtén tu Project ID de https://expo.dev/');
    }
    
    if (errorMessage.includes('permissions')) {
      suggestions.push('1. Acepta los permisos de notificaciones');
      suggestions.push('2. Verifica configuración en ajustes del dispositivo');
    }
    
    return {
      success: false,
      error: errorMessage,
      suggestions: suggestions,
      stack: error instanceof Error ? error.stack : undefined
    };
  }
}

// Para debugging: mostrar información del entorno
export function mostrarInfoEntorno() {
  console.log('🌍 === INFORMACIÓN DEL ENTORNO ===');
  console.log('📱 Platform:', Device.osName);
  console.log('📱 Es dispositivo físico:', Device.isDevice);
  console.log('⚙️ Expo SDK:', Constants.expoConfig?.sdkVersion);
  console.log('⚙️ App Version:', Constants.expoConfig?.version);
  console.log('⚙️ Project ID:', Constants.expoConfig?.extra?.eas?.projectId);
}

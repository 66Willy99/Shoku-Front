import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/config';

export class PushNotificationService {
  
  /**
   * Registra el token de notificaciones push para un garzón
   */
  static async registerGarzonToken(userId: string, restauranteId: string, trabajadorId: string): Promise<boolean> {
    try {
      const pushToken = await AsyncStorage.getItem('pushToken');
      
      if (!pushToken) {
        console.log('❌ No hay token push disponible');
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
        await AsyncStorage.setItem('lastTokenRegistration', Date.now().toString());
        return true;
      } else {
        console.error('❌ Error registrando token de garzón:', result);
        return false;
      }
    } catch (error) {
      console.error('❌ Error en registerGarzonToken:', error);
      return false;
    }
  }

  /**
   * Desregistra el token de notificaciones push para un garzón
   */
  static async unregisterGarzonToken(userId: string, restauranteId: string, trabajadorId: string): Promise<boolean> {
    try {
      const response = await fetch(`${Config.API_URL}/notifications/garzon-token`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          restaurante_id: restauranteId,
          trabajador_id: trabajadorId
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Token de garzón desregistrado exitosamente:', result);
        await AsyncStorage.removeItem('garzonTokenRegistered');
        return true;
      } else {
        console.error('❌ Error desregistrando token de garzón:', result);
        return false;
      }
    } catch (error) {
      console.error('❌ Error en unregisterGarzonToken:', error);
      return false;
    }
  }

  /**
   * Notifica que un pedido está listo (llamado desde la cocina)
   */
  static async notifyOrderReady(userId: string, restauranteId: string, pedidoId: string): Promise<boolean> {
    try {
      const response = await fetch(`${Config.API_URL}/notifications/pedido-listo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          restaurante_id: restauranteId,
          pedido_id: pedidoId
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Notificación de pedido listo enviada:', result);
        return true;
      } else {
        console.error('❌ Error enviando notificación de pedido listo:', result);
        return false;
      }
    } catch (error) {
      console.error('❌ Error en notifyOrderReady:', error);
      return false;
    }
  }

  /**
   * Envía una notificación de prueba
   */
  static async sendTestNotification(userId: string, restauranteId: string): Promise<any> {
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
      
      if (response.ok) {
        console.log('✅ Notificación de prueba enviada:', result);
        return result;
      } else {
        console.error('❌ Error enviando notificación de prueba:', result);
        return null;
      }
    } catch (error) {
      console.error('❌ Error en sendTestNotification:', error);
      return null;
    }
  }

  /**
   * Obtiene los tokens de garzones registrados
   */
  static async getGarzonTokens(userId: string, restauranteId: string): Promise<any> {
    try {
      const response = await fetch(`${Config.API_URL}/notifications/garzones-tokens/${userId}/${restauranteId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Tokens de garzones obtenidos:', result);
        return result;
      } else {
        console.error('❌ Error obteniendo tokens de garzones:', result);
        return null;
      }
    } catch (error) {
      console.error('❌ Error en getGarzonTokens:', error);
      return null;
    }
  }

  /**
   * Verifica si el token necesita ser re-registrado (cada 24 horas)
   */
  static async shouldReregisterToken(): Promise<boolean> {
    try {
      const lastRegistration = await AsyncStorage.getItem('lastTokenRegistration');
      const tokenRegistered = await AsyncStorage.getItem('garzonTokenRegistered');
      
      if (!tokenRegistered || !lastRegistration) {
        return true; // No está registrado
      }
      
      const lastTime = parseInt(lastRegistration);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
      
      return (now - lastTime) > twentyFourHours;
    } catch (error) {
      console.error('❌ Error verificando si debe re-registrar token:', error);
      return true;
    }
  }
}

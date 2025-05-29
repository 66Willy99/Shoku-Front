import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/config';

type SessionData = {
    authToken: string;
    userId: string;
    userName: string;
    restaurantIds: string[]; 
};

export const saveSession = async (data: {
    token: string;
    uid: string;
    restaurantIds: string[];
}) => {
    try {
        // Primero guardamos los datos básicos
        await AsyncStorage.multiSet([
            ['authToken', data.token],
            ['userId', data.uid],
            ['restaurantIds', JSON.stringify(data.restaurantIds)]
        ]);

        // Obtenemos y guardamos el nombre del usuario
        const userName = await fetchAndSaveUserName(data.uid, data.token);

    } catch (error) {
        console.error('Error saving session:', error);
        throw new Error('SESSION_SAVE_FAILED');
    }
};

export const getSession = async (): Promise<SessionData | null> => {
    try {
        const [authToken, userId, userName, restaurantIds] = await AsyncStorage.multiGet([
            'authToken',
            'userId',
            'userName',
            'restaurantIds'
        ]);

        if (!authToken[1] || !userId[1]) return null;

        return {
            authToken: authToken[1],
            userId: userId[1],
            userName: userName[1] || '',
            restaurantIds: restaurantIds[1] ? JSON.parse(restaurantIds[1]) : []
        };
    } catch (error) {
        console.error('Error reading session:', error);
        return null;
    }
};

const fetchAndSaveUserName = async (userId: string, authToken: string) => {
    try {
        const response = await fetch(`${Config.API_URL}/user/?userId=${userId}`);

        if (!response.ok) {
            console.warn('No se pudo obtener el nombre del usuario');
            return;
        }

        const userData = await response.json();
        const userDetails = userData[userId];
        
        if (userDetails?.nombre) {
            await AsyncStorage.setItem('userName', userDetails.nombre);
        }
    } catch (error) {
        console.error('Error fetching user name:', error);
    }
};
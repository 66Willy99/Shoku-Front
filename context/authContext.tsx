import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
    isAuthenticated: boolean;
    loading: boolean;
    userId: string | null;
    restaurantId: string | null;
    login: (userId: string, restaurantId?: string) => Promise<void>;
    logout: () => Promise<void>;
    updateRestaurantId: (restaurantId: string | null) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Cargar sesión al iniciar
    useEffect(() => {
        const loadSession = async () => {
            try {
                const [savedUserId, savedRestaurantId] = await AsyncStorage.multiGet([
                    'userId',
                    'restaurantId'
                ]);
                
                setUserId(savedUserId[1]);
                setRestaurantId(savedRestaurantId[1] || null);
            } catch (error) {
                console.error('Error loading session:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSession();
    }, []);

    // Iniciar sesión
    const login = async (userId: string, restaurantId?: string) => {
        const itemsToSet: [string, string][] = [
            ['userId', userId],
            ['restaurantId', restaurantId || '']
        ];
        
        await AsyncStorage.multiSet(itemsToSet);
        setUserId(userId);
        setRestaurantId(restaurantId || null);
    };

    // Cerrar sesión
    const logout = async () => {
        await AsyncStorage.multiRemove(['userId', 'restaurantId', 'authToken', 'userName', 'restaurantIds', 'userInfo']);	
        setUserId(null);
        setRestaurantId(null);
    };

    // Actualizar solo el restaurantId
    const updateRestaurantId = async (newRestaurantId: string | null) => {
        if (newRestaurantId) {
            await AsyncStorage.setItem('restaurantId', newRestaurantId);
        } else {
            await AsyncStorage.removeItem('restaurantId');
        }
        setRestaurantId(newRestaurantId);
    };

    return (
        <AuthContext.Provider
        value={{
            isAuthenticated: !!userId,
            loading,
            userId,
            restaurantId,
            login,
            logout,
            updateRestaurantId
        }}
        >
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
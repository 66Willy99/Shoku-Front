import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
    isAuthenticated: boolean;
    loading: boolean;
    login: (userId: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const userId = await AsyncStorage.getItem('userId');
            setIsAuthenticated(!!userId);
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (userId: string) => {
        await AsyncStorage.setItem('userId', userId);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        await AsyncStorage.removeItem('userId');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

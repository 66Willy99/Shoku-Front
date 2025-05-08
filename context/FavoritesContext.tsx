import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'FAVORITES';

interface FavoritesContextType {
  favorites: string[];
  toggle: (dish: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  toggle: () => {},
});

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((data: string | null) => {
      if (data) setFavorites(JSON.parse(data));
    });
  }, []);

  const toggle = async (dish: string) => {
    const updated = favorites.includes(dish)
      ? favorites.filter(d => d !== dish)
      : [...favorites, dish];
    setFavorites(updated);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);

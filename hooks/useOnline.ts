import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export function useOnline() {
  const [online, setOnline] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  return online;
}

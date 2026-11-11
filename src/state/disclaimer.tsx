import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'fixlab.disclaimerAccepted.v1';

interface DisclaimerState {
  ready: boolean;
  accepted: boolean;
  accept: () => void;
}

const DisclaimerContext = createContext<DisclaimerState | null>(null);

export function DisclaimerProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => setAccepted(value === 'true'))
      .catch(() => setAccepted(false))
      .finally(() => setReady(true));
  }, []);

  const accept = useCallback(() => {
    setAccepted(true);
    AsyncStorage.setItem(STORAGE_KEY, 'true').catch((error: unknown) => {
      console.warn('Could not save disclaimer acceptance', error);
    });
  }, []);

  const value = useMemo(() => ({ ready, accepted, accept }), [ready, accepted, accept]);

  return <DisclaimerContext.Provider value={value}>{children}</DisclaimerContext.Provider>;
}

export function useDisclaimer(): DisclaimerState {
  const value = useContext(DisclaimerContext);
  if (!value) throw new Error('useDisclaimer must be used inside DisclaimerProvider');
  return value;
}

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import auth, { type FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appConfig } from '../config/appConfig';

type AuthContextValue = {
  user: FirebaseAuthTypes.User | null;
  isLoading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps): React.JSX.Element => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: appConfig.googleWebClientId,
    });

    const unsubscribe = auth().onAuthStateChanged(currentUser => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);

    if (!appConfig.googleWebClientId.trim()) {
      setAuthError('Google Web Client ID eksik. src/config/appConfig.ts dosyasını doldur.');
      return;
    }

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = (await GoogleSignin.signIn()) as unknown as {
        idToken?: string;
        data?: { idToken?: string };
      };
      const idToken = response.idToken ?? response.data?.idToken;

      if (!idToken) {
        throw new Error('Google idToken alınamadı.');
      }

      const credential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(credential);
    } catch (error) {
      setAuthError((error as Error).message);
    }
  };

  const signOut = async () => {
    setAuthError(null);
    try {
      await GoogleSignin.signOut();
      await auth().signOut();
    } catch (error) {
      setAuthError((error as Error).message);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      authError,
      signInWithGoogle,
      signOut,
    }),
    [user, isLoading, authError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
};

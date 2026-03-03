import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import auth, { type FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import type { CustomerInfo } from 'react-native-purchases';
import { appConfig, isRevenueCatConfigured } from '../config/appConfig';
import {
  configureRevenueCatForUser,
  getCustomerInfoStatus,
  getPaywallPlanOptions,
  logOutRevenueCat,
  mapCustomerInfoToSubscriptionState,
  openManageSubscriptions,
  purchaseSelectedPlan,
  removeRevenueCatListener,
  restoreRevenueCatPurchases,
  type PaywallPlanOption,
  type RevenueCatPlan,
} from '../services/revenueCatService';
import { ensureUserDocument, subscribeToUserDocument, updateUserSubscription } from '../services/userService';
import type { UserDoc } from '../types/firestore';

type AuthContextValue = {
  user: FirebaseAuthTypes.User | null;
  userDoc: UserDoc | null;
  isInitializing: boolean;
  authError: string | null;
  isAuthenticated: boolean;
  shouldShowPaywall: boolean;
  paywallPlans: PaywallPlanOption[];
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  startTrial: (plan: RevenueCatPlan) => Promise<void>;
  restoreSubscription: () => Promise<void>;
  refreshPaywallPlans: () => Promise<void>;
  manageSubscription: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: React.ReactNode;
};

const fallbackPlans: PaywallPlanOption[] = [
  { id: 'monthly', title: 'Monthly', priceLabel: '$9.99 / month' },
  { id: 'yearly', title: 'Yearly', priceLabel: '$59.99 / year' },
];

type FirebaseErrorLike = {
  code?: string;
  message?: string;
};

const getErrorMessage = (error: unknown): string => {
  const authCode = (error as FirebaseErrorLike)?.code;

  if (authCode === 'auth/admin-restricted-operation') {
    return 'Bu giriş yöntemi Firebase tarafında kısıtlı. Firebase Console > Authentication > Sign-in method ekranında ilgili providerı (Anonymous/Google/Apple) etkinleştirin.';
  }

  if (authCode === 'auth/operation-not-allowed') {
    return 'Bu giriş yöntemi etkin değil. Firebase Console > Authentication > Sign-in method bölümünden açın.';
  }

  if (authCode === 'auth/invalid-credential') {
    return 'Geçersiz kimlik bilgisi. Provider ayarlarını ve SHA/Web client ID değerlerini kontrol edin.';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if ((error as FirebaseErrorLike)?.message) {
    return (error as FirebaseErrorLike).message as string;
  }

  return 'Authentication failed.';
};

export const AuthProvider = ({ children }: AuthProviderProps): React.JSX.Element => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [paywallPlans, setPaywallPlans] = useState<PaywallPlanOption[]>(fallbackPlans);
  const unsubscribeUserDocRef = useRef<(() => void) | null>(null);
  const revenueCatListenerRef = useRef<((info: CustomerInfo) => void) | null>(null);

  const syncRevenueCatSubscription = useCallback(async (uid: string) => {
    if (!isRevenueCatConfigured()) {
      return;
    }

    const state = await getCustomerInfoStatus(uid);
    await updateUserSubscription(uid, {
      status: state.status,
      provider: 'revenuecat',
      renewedAt: state.renewedAt,
      expiresAt: state.expiresAt,
    });
  }, []);

  const refreshPaywallPlans = useCallback(async () => {
    if (!user || !isRevenueCatConfigured()) {
      setPaywallPlans(fallbackPlans);
      return;
    }

    try {
      const options = await getPaywallPlanOptions(user.uid);
      setPaywallPlans(options.length > 0 ? options : fallbackPlans);
    } catch {
      setPaywallPlans(fallbackPlans);
    }
  }, [user]);

  useEffect(() => {
    GoogleSignin.configure(
      appConfig.googleWebClientId
        ? {
            webClientId: appConfig.googleWebClientId,
          }
        : {},
    );

    const unsubscribeAuth = auth().onAuthStateChanged(async currentUser => {
      unsubscribeUserDocRef.current?.();
      unsubscribeUserDocRef.current = null;

      if (revenueCatListenerRef.current) {
        removeRevenueCatListener(revenueCatListenerRef.current);
        revenueCatListenerRef.current = null;
      }

      setUser(currentUser);

      if (!currentUser) {
        setUserDoc(null);
        setPaywallPlans(fallbackPlans);
        setIsInitializing(false);
        return;
      }

      try {
        await ensureUserDocument({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
        });

        if (isRevenueCatConfigured()) {
          const listener = (info: CustomerInfo) => {
            const state = mapCustomerInfoToSubscriptionState(info);
            updateUserSubscription(currentUser.uid, {
              status: state.status,
              provider: 'revenuecat',
              renewedAt: state.renewedAt,
              expiresAt: state.expiresAt,
            }).catch(() => undefined);
          };

          await configureRevenueCatForUser(currentUser.uid, listener);
          revenueCatListenerRef.current = listener;
          await syncRevenueCatSubscription(currentUser.uid);
        }
      } catch {
        setAuthError('Could not prepare user profile.');
      }

      unsubscribeUserDocRef.current = subscribeToUserDocument(
        currentUser.uid,
        doc => {
          setUserDoc(doc);
          setIsInitializing(false);
        },
        () => {
          setAuthError('Could not load user settings.');
          setIsInitializing(false);
        },
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUserDocRef.current?.();
      unsubscribeUserDocRef.current = null;
      if (revenueCatListenerRef.current) {
        removeRevenueCatListener(revenueCatListenerRef.current);
        revenueCatListenerRef.current = null;
      }
    };
  }, [syncRevenueCatSubscription]);

  useEffect(() => {
    refreshPaywallPlans().catch(() => undefined);
  }, [refreshPaywallPlans]);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;

      if (!idToken) {
        throw new Error('Missing Google id token.');
      }

      const credential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(credential);
    } catch (error) {
      setAuthError(getErrorMessage(error));
      throw error;
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    setAuthError(null);

    try {
      const appleResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      if (!appleResponse.identityToken) {
        throw new Error('Missing Apple identity token.');
      }

      const provider = auth.AppleAuthProvider.credential(
        appleResponse.identityToken,
        appleResponse.nonce,
      );

      await auth().signInWithCredential(provider);
    } catch (error) {
      setAuthError(getErrorMessage(error));
      throw error;
    }
  }, []);

  const continueAsGuest = useCallback(async () => {
    setAuthError(null);

    try {
      await auth().signInAnonymously();
    } catch (error) {
      setAuthError(getErrorMessage(error));
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthError(null);
    await GoogleSignin.signOut().catch(() => undefined);
    await logOutRevenueCat().catch(() => undefined);
    await auth().signOut();
  }, []);

  const startTrial = useCallback(
    async (plan: RevenueCatPlan) => {
      if (!user) {
        return;
      }

      setAuthError(null);

      if (!isRevenueCatConfigured()) {
        throw new Error('RevenueCat is not configured. Add API keys in appConfig.');
      }

      const state = await purchaseSelectedPlan(user.uid, plan);

      await updateUserSubscription(user.uid, {
        status: state.status,
        provider: 'revenuecat',
        renewedAt: state.renewedAt,
        expiresAt: state.expiresAt,
      });
    },
    [user],
  );

  const restoreSubscription = useCallback(async () => {
    if (!user) {
      return;
    }

    setAuthError(null);

    if (!isRevenueCatConfigured()) {
      throw new Error('RevenueCat is not configured. Add API keys in appConfig.');
    }

    const state = await restoreRevenueCatPurchases(user.uid);

    await updateUserSubscription(user.uid, {
      status: state.status,
      provider: 'revenuecat',
      renewedAt: state.renewedAt,
      expiresAt: state.expiresAt,
    });
  }, [user]);

  const manageSubscription = useCallback(async () => {
    if (!user) {
      return;
    }

    if (!isRevenueCatConfigured()) {
      throw new Error('RevenueCat is not configured. Add API keys in appConfig.');
    }

    await openManageSubscriptions(user.uid);
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      userDoc,
      isInitializing,
      authError,
      isAuthenticated: Boolean(user),
      shouldShowPaywall: Boolean(
        user && !user.isAnonymous && userDoc && userDoc.subscription.status === 'inactive',
      ),
      paywallPlans,
      signInWithGoogle,
      signInWithApple,
      continueAsGuest,
      signOut,
      startTrial,
      restoreSubscription,
      refreshPaywallPlans,
      manageSubscription,
    }),
    [
      user,
      userDoc,
      isInitializing,
      authError,
      paywallPlans,
      signInWithGoogle,
      signInWithApple,
      continueAsGuest,
      signOut,
      startTrial,
      restoreSubscription,
      refreshPaywallPlans,
      manageSubscription,
    ],
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


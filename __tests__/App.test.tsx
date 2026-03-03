/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => undefined),
    removeItem: jest.fn(async () => undefined),
    clear: jest.fn(async () => undefined),
  },
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(async () => true),
    signIn: jest.fn(async () => ({ data: { idToken: 'mock-token' } })),
    signOut: jest.fn(async () => undefined),
  },
}));

jest.mock('@invertase/react-native-apple-authentication', () => ({
  appleAuth: {
    Operation: { LOGIN: 1 },
    Scope: { EMAIL: 0, FULL_NAME: 1 },
    performRequest: jest.fn(async () => ({
      identityToken: 'apple-token',
      nonce: 'nonce',
    })),
  },
}));

jest.mock('@react-native-community/datetimepicker', () => {
  const ReactMock = require('react');
  return (props: any) => ReactMock.createElement('DateTimePicker', props);
});

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(async () => ({ didCancel: true })),
  launchImageLibrary: jest.fn(async () => ({ didCancel: true })),
}));

jest.mock('@react-native-firebase/auth', () => {
  const authModule = () => ({
    onAuthStateChanged: (callback: (value: unknown) => void) => {
      callback(null);
      return () => undefined;
    },
    signInWithCredential: jest.fn(async () => undefined),
    signOut: jest.fn(async () => undefined),
  });

  authModule.GoogleAuthProvider = {
    credential: jest.fn(() => ({ token: 'credential' })),
  };

  authModule.AppleAuthProvider = {
    credential: jest.fn(() => ({ token: 'credential' })),
  };

  return authModule;
});

jest.mock('@react-native-firebase/firestore', () => {
  const createCollectionRef = (): any => {
    const collectionRef: any = {
      doc: jest.fn(() => createDocRef()),
      orderBy: jest.fn(() => ({
        onSnapshot: jest.fn(() => () => undefined),
        get: jest.fn(async () => ({ docs: [] })),
        limit: jest.fn(() => ({
          onSnapshot: jest.fn(() => () => undefined),
        })),
      })),
      get: jest.fn(async () => ({ docs: [] })),
      onSnapshot: jest.fn(() => () => undefined),
      limit: jest.fn(() => ({
        onSnapshot: jest.fn(() => () => undefined),
      })),
    };
    return collectionRef;
  };

  const createDocRef = (): any => {
    const docRef: any = {
      get: jest.fn(async () => ({ exists: () => false, data: () => ({}) })),
      set: jest.fn(async () => undefined),
      delete: jest.fn(async () => undefined),
      onSnapshot: jest.fn((onNext: (value: any) => void) => {
        onNext({ exists: () => false, data: () => undefined, id: 'mock' });
        return () => undefined;
      }),
      collection: jest.fn(() => createCollectionRef()),
    };
    return docRef;
  };

  const firestoreModule = () => ({
    collection: jest.fn(() => createCollectionRef()),
  });

  firestoreModule.FieldValue = {
    serverTimestamp: jest.fn(() => 'mock-timestamp'),
  };

  return firestoreModule;
});

jest.mock('@react-native-firebase/functions', () => {
  return () => ({
    httpsCallable: jest.fn(() => jest.fn(async () => ({ data: {} }))),
  });
});

jest.mock('@react-native-firebase/storage', () => {
  return () => ({
    ref: jest.fn(() => ({
      putFile: jest.fn(async () => undefined),
      getDownloadURL: jest.fn(async () => 'https://example.com/photo.jpg'),
      listAll: jest.fn(async () => ({ items: [], prefixes: [] })),
      delete: jest.fn(async () => undefined),
    })),
  });
});

jest.mock('react-native-purchases', () => {
  return {
    __esModule: true,
    LOG_LEVEL: {
      INFO: 'INFO',
    },
    default: {
      setLogLevel: jest.fn(),
      configure: jest.fn(),
      isConfigured: jest.fn(async () => true),
      addCustomerInfoUpdateListener: jest.fn(),
      removeCustomerInfoUpdateListener: jest.fn(),
      getCustomerInfo: jest.fn(async () => ({
        entitlements: { active: {}, all: {}, verification: 'NOT_REQUESTED' },
        requestDate: new Date().toISOString(),
        latestExpirationDate: null,
      })),
      getOfferings: jest.fn(async () => ({ current: null, all: {} })),
      purchasePackage: jest.fn(async () => ({
        customerInfo: {
          entitlements: { active: {}, all: {}, verification: 'NOT_REQUESTED' },
          requestDate: new Date().toISOString(),
          latestExpirationDate: null,
        },
      })),
      restorePurchases: jest.fn(async () => ({
        entitlements: { active: {}, all: {}, verification: 'NOT_REQUESTED' },
        requestDate: new Date().toISOString(),
        latestExpirationDate: null,
      })),
      showManageSubscriptions: jest.fn(async () => undefined),
      logOut: jest.fn(async () => undefined),
    },
  };
});

jest.mock('@notifee/react-native', () => {
  return {
    __esModule: true,
    AndroidImportance: { HIGH: 4 },
    AuthorizationStatus: {
      DENIED: 0,
      AUTHORIZED: 1,
      PROVISIONAL: 2,
    },
    RepeatFrequency: { DAILY: 1 },
    TriggerType: { TIMESTAMP: 0 },
    default: {
      requestPermission: jest.fn(async () => ({ authorizationStatus: 1 })),
      createChannel: jest.fn(async () => 'daily-tracking-reminders'),
      getTriggerNotificationIds: jest.fn(async () => []),
      cancelTriggerNotifications: jest.fn(async () => undefined),
      createTriggerNotification: jest.fn(async () => undefined),
    },
  };
});

jest.mock('react-native-health', () => ({
  __esModule: true,
  default: {
    Constants: {
      Permissions: {
        Weight: 'Weight',
        StepCount: 'StepCount',
      },
    },
    initHealthKit: jest.fn((_: unknown, callback: (error: string | null) => void) =>
      callback(null),
    ),
    getLatestWeight: jest.fn((_: unknown, callback: (error: string | null, result: { value: number }) => void) =>
      callback(null, { value: 70 }),
    ),
    getDailyStepCountSamples: jest.fn(
      (_: unknown, callback: (error: string | null, result: Array<{ value: number }>) => void) =>
        callback(null, [{ value: 5000 }]),
    ),
  },
}));

jest.mock('react-native-google-fit', () => ({
  __esModule: true,
  Scopes: {
    FITNESS_BODY_READ: 'fitness.body.read',
    FITNESS_BODY_WRITE: 'fitness.body.write',
    FITNESS_ACTIVITY_READ: 'fitness.activity.read',
  },
  default: {
    authorize: jest.fn(async () => ({ success: true })),
    getWeightSamples: jest.fn(async () => [{ value: 70 }]),
    getDailyStepCountSamples: jest.fn(async () => [{ steps: [{ value: 5000 }] }]),
  },
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});


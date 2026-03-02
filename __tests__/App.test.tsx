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
    signIn: jest.fn(async () => ({ idToken: 'mock-token' })),
    signOut: jest.fn(async () => undefined),
  },
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

  return authModule;
});

jest.mock('@react-native-firebase/firestore', () => {
  const orderByChain = {
    get: jest.fn(async () => ({ docs: [] })),
  };
  const docChain = {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(async () => undefined),
      })),
      orderBy: jest.fn(() => orderByChain),
    })),
  };
  const firestoreModule = () => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => docChain),
    })),
  });
  firestoreModule.FieldValue = {
    serverTimestamp: jest.fn(() => 'mock-timestamp'),
  };
  return firestoreModule;
});

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});

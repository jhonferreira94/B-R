import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  connectAuthEmulator,
  type Auth,
  type Persistence,
} from 'firebase/auth';
import * as firebaseAuth from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator, type Functions } from 'firebase/functions';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const FUNCTIONS_REGION = 'southamerica-east1';

const getReactNativePersistence = (
  firebaseAuth as unknown as {
    getReactNativePersistence: (storage: unknown) => Persistence;
  }
).getReactNativePersistence;

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

function getFirebaseAuth(): Auth {
  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch {
    return getAuth(firebaseApp);
  }
}

export const auth = getFirebaseAuth();
export const functions: Functions = getFunctions(firebaseApp, FUNCTIONS_REGION);

const useEmulator = process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true';

if (useEmulator) {
  const host = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST ?? '127.0.0.1';
  console.warn('[firebase] connecting emulators at', host);
  try {
    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  } catch (e) {
    console.warn('[firebase] auth emulator connect failed', e);
  }
  try {
    connectFunctionsEmulator(functions, host, 5001);
  } catch (e) {
    console.warn('[firebase] functions emulator connect failed', e);
  }
}

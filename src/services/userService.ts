import firestore from '@react-native-firebase/firestore';
import { defaultSettings, defaultSubscription } from './defaults';
import { mapUserDoc } from './firebase/firestoreMapper';
import { userDocRef } from './firebase/firestoreRefs';
import type { UserDoc, UserSettings, UserSubscription } from '../types/firestore';

const serverTimestamp = firestore.FieldValue.serverTimestamp;

type UserIdentity = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
};

export const ensureUserDocument = async (identity: UserIdentity): Promise<void> => {
  const ref = userDocRef(identity.uid);
  const snapshot = await ref.get();

  const basePayload = {
    displayName: identity.displayName ?? '',
    email: identity.email ?? '',
    createdAt: serverTimestamp(),
    settings: defaultSettings,
    subscription: defaultSubscription,
  };

  if (!snapshot.exists) {
    await ref.set(basePayload, { merge: true });
    return;
  }

  await ref.set(
    {
      displayName: identity.displayName ?? snapshot.data()?.displayName ?? '',
      email: identity.email ?? snapshot.data()?.email ?? '',
      settings: { ...defaultSettings, ...(snapshot.data()?.settings ?? {}) },
      subscription: {
        ...defaultSubscription,
        ...(snapshot.data()?.subscription ?? {}),
      },
    },
    { merge: true },
  );
};

export const subscribeToUserDocument = (
  uid: string,
  onNext: (doc: UserDoc) => void,
  onError: (error: unknown) => void,
): (() => void) => {
  return userDocRef(uid).onSnapshot(
    snapshot => {
      onNext(mapUserDoc(snapshot.data()));
    },
    error => onError(error),
  );
};

export const updateUserSettings = async (
  uid: string,
  patch: Partial<UserSettings>,
): Promise<void> => {
  await userDocRef(uid).set(
    {
      settings: patch,
    },
    { merge: true },
  );
};

export const updateReminderWindow = async (
  uid: string,
  start: string,
  end: string,
): Promise<void> => {
  await userDocRef(uid).set(
    {
      settings: {
        remindersWindow: { start, end },
      },
    },
    { merge: true },
  );
};

export const updateMacroTargets = async (
  uid: string,
  targets: UserSettings['macroTargets'],
): Promise<void> => {
  await userDocRef(uid).set(
    {
      settings: {
        macroTargets: targets,
      },
    },
    { merge: true },
  );
};

export const updateUserSubscription = async (
  uid: string,
  subscription: Partial<UserSubscription>,
): Promise<void> => {
  await userDocRef(uid).set(
    {
      subscription,
    },
    { merge: true },
  );
};


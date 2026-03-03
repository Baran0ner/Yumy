import firestore from '@react-native-firebase/firestore';
import { analyticsEventsCollectionRef } from './firebase/firestoreRefs';

export type KpiEventName =
  | 'paywall_viewed'
  | 'trial_started'
  | 'trial_expired'
  | 'purchase_success'
  | 'purchase_failed'
  | 'restore_success'
  | 'restore_failed'
  | 'voice_log_submitted'
  | 'barcode_log_submitted'
  | 'guest_signin_redirect';

export const logKpiEvent = async (
  uid: string,
  eventName: KpiEventName,
  payload?: Record<string, unknown>,
): Promise<void> => {
  await analyticsEventsCollectionRef(uid).add({
    eventName,
    payload: payload ?? {},
    createdAt: firestore.FieldValue.serverTimestamp(),
    clientCreatedAt: new Date().toISOString(),
  });
};


import firestore from '@react-native-firebase/firestore';
import type { MealEntry, MealSource } from '../types/meal';
import type { RemoteMealStore, RemoteSaveResult } from './remoteMealStore';

type FirestoreMealDoc = Partial<MealEntry> & {
  createdAt?: string | { toDate?: () => Date };
};

const toIsoString = (value: FirestoreMealDoc['createdAt']): string => {
  if (typeof value === 'string') {
    return value;
  }

  const timestampLike = value as { toDate?: () => Date } | undefined;
  if (timestampLike?.toDate) {
    return timestampLike.toDate().toISOString();
  }

  return new Date().toISOString();
};

const sanitizeMealDoc = (userId: string, id: string, data: FirestoreMealDoc): MealEntry => ({
  id,
  userId,
  description: String(data.description ?? ''),
  calories: Number(data.calories ?? 0),
  macros: {
    protein: Number(data.macros?.protein ?? 0),
    carbs: Number(data.macros?.carbs ?? 0),
    fat: Number(data.macros?.fat ?? 0),
  },
  createdAt: toIsoString(data.createdAt),
  source: (data.source as MealSource) ?? 'manual',
  imageUri: data.imageUri ? String(data.imageUri) : undefined,
  synced: true,
});

export class FirebaseRemoteMealStore implements RemoteMealStore {
  async saveEntry(entry: MealEntry): Promise<RemoteSaveResult> {
    try {
      await firestore()
        .collection('users')
        .doc(entry.userId)
        .collection('entries')
        .doc(entry.id)
        .set({
          ...entry,
          synced: true,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      return { synced: true };
    } catch {
      return { synced: false };
    }
  }

  async fetchEntries(userId: string): Promise<MealEntry[]> {
    try {
      const snapshot = await firestore()
        .collection('users')
        .doc(userId)
        .collection('entries')
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc =>
        sanitizeMealDoc(userId, doc.id, doc.data() as FirestoreMealDoc),
      );
    } catch {
      return [];
    }
  }
}

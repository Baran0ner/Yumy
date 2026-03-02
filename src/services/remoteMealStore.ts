import type { MealEntry } from '../types/meal';

export type RemoteSaveResult = {
  synced: boolean;
};

export interface RemoteMealStore {
  saveEntry: (entry: MealEntry) => Promise<RemoteSaveResult>;
  fetchEntries: (userId: string) => Promise<MealEntry[]>;
}

export class NoopRemoteMealStore implements RemoteMealStore {
  async saveEntry(): Promise<RemoteSaveResult> {
    return { synced: false };
  }

  async fetchEntries(): Promise<MealEntry[]> {
    return [];
  }
}

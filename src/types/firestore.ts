export type Units = 'metric' | 'imperial';

export type CalorieBias = 'over' | 'neutral' | 'under';

export type SubscriptionStatus = 'trial' | 'active' | 'inactive';

export type SubscriptionProvider = 'revenuecat' | 'storekit' | 'play';

export type EntrySource = 'text' | 'photo' | 'menu_scan' | 'saved_meal';

export type EntryStatus = 'processing' | 'ready' | 'error';

export type MacroTotals = {
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export type MacroTargets = MacroTotals & {
  calories: number;
};

export type ReminderWindow = {
  start: string;
  end: string;
};

export type UserSettings = {
  units: Units;
  calorieBias: CalorieBias;
  remindersEnabled: boolean;
  remindersFrequency: 1 | 2 | 3 | 4 | 5;
  remindersWindow: ReminderWindow;
  useLocationForRestaurants: boolean;
  healthSyncEnabled: boolean;
  healthSyncWeight: boolean;
  healthSyncSteps: boolean;
  showThoughtProcess: boolean;
  macroTargets: MacroTargets;
};

export type UserSubscription = {
  status: SubscriptionStatus;
  provider: SubscriptionProvider;
  renewedAt: string | null;
  expiresAt: string | null;
};

export type UserDoc = {
  displayName: string;
  email: string;
  createdAt: string;
  settings: UserSettings;
  subscription: UserSubscription;
};

export type DayDoc = {
  totalCalories: number;
  totalMacros: MacroTotals;
  streakEligible: boolean;
  updatedAt: string;
};

export type NutritionMicros = {
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
};

export type EntryDoc = {
  mealText: string;
  createdAt: string;
  source: EntrySource;
  status: EntryStatus;
  nutrition: {
    calories: number;
    macros: MacroTotals;
    micros?: NutritionMicros;
  };
  ai: {
    model: string;
    confidence: number;
    sourcesCount: number;
    reasoningSummary: string;
    items?: AnalyzeItem[];
    sources?: SourceItem[];
  };
  attachments: {
    photoUrl?: string;
    thumbnailUrl?: string;
  };
};

export type SourceItem = {
  title: string;
  type: string;
};

export type AnalyzeItem = {
  name: string;
  calories: number;
  macros: {
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
};

export type AnalyzeResult = {
  items: AnalyzeItem[];
  total: {
    calories: number;
    macros: {
      protein_g: number;
      carbs_g: number;
      fat_g: number;
    };
  };
  sources: SourceItem[];
  confidence: number;
  reasoning_summary: string;
  model?: string;
};

export type SavedMealDoc = {
  title: string;
  defaultText: string;
  nutritionSnapshot?: {
    calories: number;
    macros: MacroTotals;
  };
  createdAt: string;
};

export type JournalEntry = EntryDoc & {
  id: string;
};

export type SavedMeal = SavedMealDoc & {
  id: string;
};



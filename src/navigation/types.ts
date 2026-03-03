import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
};

export type TodayStackParamList = {
  Today: { dateKey?: string } | undefined;
  AddEntryModal: { dateKey: string };
  EntryDetail: { dateKey: string; entryId: string };
  EditEntry: { dateKey: string; entryId: string };
  PhotoCapture: { dateKey: string };
  BarcodeScan: { dateKey: string };
};

export type HistoryStackParamList = {
  History: undefined;
  DayDetail: { dateKey: string };
};

export type GoalsStackParamList = {
  Goals: undefined;
  MacroPlan: undefined;
  StreaksBadges: undefined;
};

export type SettingsStackParamList = {
  Settings: undefined;
  Reminders: undefined;
  AISettings: undefined;
  HealthSync: undefined;
  Units: undefined;
  Language: undefined;
  LocationRestaurants: undefined;
  SavedMeals: { dateKey?: string } | undefined;
  AccountSubscription: undefined;
  PrivacyTerms: undefined;
  Support: undefined;
};

export type AppTabsParamList = {
  TodayTab: NavigatorScreenParams<TodayStackParamList>;
  HistoryTab: NavigatorScreenParams<HistoryStackParamList>;
  GoalsTab: NavigatorScreenParams<GoalsStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

export type RootStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  AppTabs: NavigatorScreenParams<AppTabsParamList>;
  PaywallModal: undefined;
};

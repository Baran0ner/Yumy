import React, { useEffect } from 'react';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import type {
  AppTabsParamList,
  AuthStackParamList,
  GoalsStackParamList,
  HistoryStackParamList,
  RootStackParamList,
  SettingsStackParamList,
  TodayStackParamList,
} from './types';
import { colors } from '../theme/tokens';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { PaywallModalScreen } from '../screens/auth/PaywallModalScreen';
import { TodayScreen } from '../screens/today/TodayScreen';
import { AddEntryModalScreen } from '../screens/today/AddEntryModalScreen';
import { EntryDetailScreen } from '../screens/today/EntryDetailScreen';
import { EditEntryScreen } from '../screens/today/EditEntryScreen';
import { PhotoCaptureScreen } from '../screens/today/PhotoCaptureScreen';
import { HistoryScreen } from '../screens/history/HistoryScreen';
import { DayDetailScreen } from '../screens/history/DayDetailScreen';
import { GoalsScreen } from '../screens/goals/GoalsScreen';
import { MacroPlanScreen } from '../screens/goals/MacroPlanScreen';
import { StreaksBadgesScreen } from '../screens/goals/StreaksBadgesScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { RemindersScreen } from '../screens/settings/RemindersScreen';
import { AISettingsScreen } from '../screens/settings/AISettingsScreen';
import { HealthSyncScreen } from '../screens/settings/HealthSyncScreen';
import { UnitsScreen } from '../screens/settings/UnitsScreen';
import { LocationRestaurantsScreen } from '../screens/settings/LocationRestaurantsScreen';
import { SavedMealsScreen } from '../screens/settings/SavedMealsScreen';
import { AccountSubscriptionScreen } from '../screens/settings/AccountSubscriptionScreen';
import { PrivacyTermsScreen } from '../screens/settings/PrivacyTermsScreen';
import { SupportScreen } from '../screens/settings/SupportScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<AppTabsParamList>();
const TodayStack = createNativeStackNavigator<TodayStackParamList>();
const HistoryStack = createNativeStackNavigator<HistoryStackParamList>();
const GoalsStack = createNativeStackNavigator<GoalsStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

const rootNavigationRef = createNavigationContainerRef<RootStackParamList>();

const commonStackScreenOptions = {
  contentStyle: { backgroundColor: colors.background },
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.textPrimary,
};

type TabIconProps = {
  icon: string;
  color: string;
};

const TabIcon = ({ icon, color }: TabIconProps): React.JSX.Element => {
  return <Text style={[styles.tabIcon, { color }]}>{icon}</Text>;
};

const renderTodayTabIcon = ({ color }: { color: string }) => <TabIcon icon="◷" color={color} />;
const renderHistoryTabIcon = ({ color }: { color: string }) => <TabIcon icon="↺" color={color} />;
const renderGoalsTabIcon = ({ color }: { color: string }) => <TabIcon icon="◎" color={color} />;
const renderSettingsTabIcon = ({ color }: { color: string }) => <TabIcon icon="⚙" color={color} />;

const AuthStackNavigator = () => (
  <AuthStack.Navigator
    initialRouteName="Welcome"
    screenOptions={{
      ...commonStackScreenOptions,
    }}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
    <AuthStack.Screen name="SignIn" component={SignInScreen} options={{ title: 'Sign In' }} />
  </AuthStack.Navigator>
);

const TodayStackNavigator = () => (
  <TodayStack.Navigator
    initialRouteName="Today"
    screenOptions={{
      ...commonStackScreenOptions,
    }}>
    <TodayStack.Screen name="Today" component={TodayScreen} options={{ headerShown: false }} />
    <TodayStack.Screen
      name="AddEntryModal"
      component={AddEntryModalScreen}
      options={{ presentation: 'transparentModal', headerShown: false }}
    />
    <TodayStack.Screen
      name="EntryDetail"
      component={EntryDetailScreen}
      options={{ presentation: 'modal', headerShown: false }}
    />
    <TodayStack.Screen name="EditEntry" component={EditEntryScreen} options={{ title: 'Edit Entry' }} />
    <TodayStack.Screen name="PhotoCapture" component={PhotoCaptureScreen} options={{ title: 'Photo' }} />
  </TodayStack.Navigator>
);

const HistoryStackNavigator = () => (
  <HistoryStack.Navigator
    initialRouteName="History"
    screenOptions={{
      ...commonStackScreenOptions,
    }}>
    <HistoryStack.Screen name="History" component={HistoryScreen} options={{ headerShown: false }} />
    <HistoryStack.Screen name="DayDetail" component={DayDetailScreen} options={{ title: 'Day Detail' }} />
  </HistoryStack.Navigator>
);

const GoalsStackNavigator = () => (
  <GoalsStack.Navigator
    initialRouteName="Goals"
    screenOptions={{
      ...commonStackScreenOptions,
    }}>
    <GoalsStack.Screen name="Goals" component={GoalsScreen} options={{ headerShown: false }} />
    <GoalsStack.Screen name="MacroPlan" component={MacroPlanScreen} options={{ title: 'Nutrition Plan' }} />
    <GoalsStack.Screen
      name="StreaksBadges"
      component={StreaksBadgesScreen}
      options={{ title: 'Streaks & Badges' }}
    />
  </GoalsStack.Navigator>
);

const SettingsStackNavigator = () => (
  <SettingsStack.Navigator
    initialRouteName="Settings"
    screenOptions={{
      ...commonStackScreenOptions,
    }}>
    <SettingsStack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
    <SettingsStack.Screen name="Reminders" component={RemindersScreen} options={{ title: 'Reminders' }} />
    <SettingsStack.Screen name="AISettings" component={AISettingsScreen} options={{ title: 'AI Settings' }} />
    <SettingsStack.Screen name="HealthSync" component={HealthSyncScreen} options={{ title: 'Health Sync' }} />
    <SettingsStack.Screen name="Units" component={UnitsScreen} options={{ title: 'Units' }} />
    <SettingsStack.Screen
      name="LocationRestaurants"
      component={LocationRestaurantsScreen}
      options={{ title: 'Location' }}
    />
    <SettingsStack.Screen name="SavedMeals" component={SavedMealsScreen} options={{ title: 'Saved Meals' }} />
    <SettingsStack.Screen
      name="AccountSubscription"
      component={AccountSubscriptionScreen}
      options={{ title: 'Account' }}
    />
    <SettingsStack.Screen
      name="PrivacyTerms"
      component={PrivacyTermsScreen}
      options={{ title: 'Privacy / Terms' }}
    />
    <SettingsStack.Screen name="Support" component={SupportScreen} options={{ title: 'Support' }} />
  </SettingsStack.Navigator>
);

const AppTabsNavigator = () => (
  <Tab.Navigator
    initialRouteName="TodayTab"
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.textPrimary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
      },
    }}>
    <Tab.Screen
      name="TodayTab"
      component={TodayStackNavigator}
      options={{
        tabBarLabel: 'Today',
        tabBarButtonTestID: 'tab-today',
        tabBarIcon: renderTodayTabIcon,
      }}
    />
    <Tab.Screen
      name="HistoryTab"
      component={HistoryStackNavigator}
      options={{
        tabBarLabel: 'History',
        tabBarButtonTestID: 'tab-history',
        tabBarIcon: renderHistoryTabIcon,
      }}
    />
    <Tab.Screen
      name="GoalsTab"
      component={GoalsStackNavigator}
      options={{
        tabBarLabel: 'Goals',
        tabBarButtonTestID: 'tab-goals',
        tabBarIcon: renderGoalsTabIcon,
      }}
    />
    <Tab.Screen
      name="SettingsTab"
      component={SettingsStackNavigator}
      options={{
        tabBarLabel: 'Settings',
        tabBarButtonTestID: 'tab-settings',
        tabBarIcon: renderSettingsTabIcon,
      }}
    />
  </Tab.Navigator>
);

export const AppNavigator = (): React.JSX.Element => {
  const { isAuthenticated, isInitializing, shouldShowPaywall } = useAuth();
  const [isNavigationReady, setIsNavigationReady] = React.useState<boolean>(false);

  useEffect(() => {
    if (!isNavigationReady || !rootNavigationRef.isReady()) {
      return;
    }

    const state = rootNavigationRef.getRootState();
    const activeRoute = state?.routes[state.index]?.name;

    if (shouldShowPaywall && activeRoute !== 'PaywallModal') {
      rootNavigationRef.navigate('PaywallModal');
      return;
    }

    if (!shouldShowPaywall && activeRoute === 'PaywallModal' && rootNavigationRef.canGoBack()) {
      rootNavigationRef.goBack();
    }
  }, [shouldShowPaywall, isNavigationReady]);

  if (isInitializing) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <AuthStackNavigator />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer ref={rootNavigationRef} onReady={() => setIsNavigationReady(true)}>
      <RootStack.Navigator
        initialRouteName="AppTabs"
        screenOptions={{
          ...commonStackScreenOptions,
          headerShown: false,
        }}>
        <RootStack.Screen name="AppTabs" component={AppTabsNavigator} />
        <RootStack.Screen
          name="PaywallModal"
          component={PaywallModalScreen}
          options={{ presentation: 'modal' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 24,
    lineHeight: 24,
  },
});


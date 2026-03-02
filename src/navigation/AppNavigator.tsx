import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { AddEntryScreen } from '../screens/AddEntryScreen';
import { HistoryScreen } from '../screens/HistoryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = (): React.JSX.Element => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#F8FAF5' },
        contentStyle: { backgroundColor: '#F8FAF5' },
      }}>
      <Stack.Screen name="Home" options={{ title: 'Yumy' }}>
        {({ navigation }) => (
          <HomeScreen
            onNavigateAdd={() => navigation.navigate('AddEntry')}
            onNavigateHistory={() => navigation.navigate('History')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="AddEntry" options={{ title: 'Yeni Öğün' }}>
        {({ navigation }) => <AddEntryScreen onDone={() => navigation.goBack()} />}
      </Stack.Screen>
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'Geçmiş' }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

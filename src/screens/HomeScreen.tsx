import React, { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useMealContext } from '../context/MealContext';
import { useAuth } from '../context/AuthContext';
import { MealItem } from '../components/MealItem';
import { SummaryCard } from '../components/SummaryCard';
import { calculateSummary } from '../services/mealRepository';

type HomeScreenProps = {
  onNavigateAdd: () => void;
  onNavigateHistory: () => void;
};

export const HomeScreen = ({
  onNavigateAdd,
  onNavigateHistory,
}: HomeScreenProps): React.JSX.Element => {
  const { entries, isLoading, error, loadEntries, syncPending } = useMealContext();
  const { user, signOut } = useAuth();

  const summary = useMemo(() => calculateSummary(entries), [entries]);

  useEffect(() => {
    loadEntries().catch(() => undefined);
  }, [loadEntries]);

  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error);
    }
  }, [error]);

  const handleSync = async () => {
    const count = await syncPending();
    Alert.alert('Senkronizasyon', `${count} kayıt buluta gönderildi.`);
  };

  const handleSignOut = () => {
    signOut().catch(() => undefined);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Yumy Günlük</Text>
        <Text style={styles.userMeta}>{user?.email ?? user?.uid}</Text>
        <SummaryCard summary={summary} />

        <View style={styles.actions}>
          <Pressable style={styles.secondaryButton} onPress={onNavigateHistory}>
            <Text style={styles.secondaryButtonLabel}>Geçmiş</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={handleSync}>
            <Text style={styles.secondaryButtonLabel}>Senkronize Et</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={handleSignOut}>
            <Text style={styles.secondaryButtonLabel}>Çıkış</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <ActivityIndicator size="small" color="#1D2910" />
        ) : (
          <FlatList
            data={entries}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <MealItem item={item} />}
            ListEmptyComponent={<Text style={styles.empty}>Henüz kayıt yok.</Text>}
            contentContainerStyle={styles.listContent}
          />
        )}

        <Pressable style={styles.primaryButton} onPress={onNavigateAdd}>
          <Text style={styles.primaryButtonLabel}>+ Yeni Öğün</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAF5',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1D2910',
    marginBottom: 2,
  },
  userMeta: {
    marginBottom: 12,
    color: '#6B7280',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: '#EAF0E2',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  secondaryButtonLabel: {
    color: '#2D4420',
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 80,
  },
  empty: {
    marginTop: 24,
    textAlign: 'center',
    color: '#6B7280',
  },
  primaryButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 24,
    backgroundColor: '#2D6A4F',
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  primaryButtonLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

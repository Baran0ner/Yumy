import React from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export const AuthScreen = (): React.JSX.Element => {
  const { isLoading, authError, signInWithGoogle } = useAuth();
  const handleGoogleSignIn = () => {
    signInWithGoogle().catch(() => undefined);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="small" color="#2D6A4F" />
          <Text style={styles.helper}>Oturum kontrol ediliyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Yumy</Text>
        <Text style={styles.subtitle}>Devam etmek için Google ile giriş yap</Text>

        {authError ? <Text style={styles.error}>{authError}</Text> : null}

        <Pressable style={styles.googleButton} onPress={handleGoogleSignIn}>
          <Text style={styles.googleButtonLabel}>Google ile Devam Et</Text>
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
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1D2910',
    marginBottom: 6,
  },
  subtitle: {
    color: '#374151',
    marginBottom: 24,
  },
  error: {
    color: '#B91C1C',
    marginBottom: 16,
  },
  helper: {
    color: '#4B5563',
    fontSize: 13,
  },
  googleButton: {
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  googleButtonLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../context/AuthContext';
import type { TodayStackParamList } from '../../navigation/types';
import { analyzeMealPhoto } from '../../services/functionsService';
import {
  applyAnalysisResultToEntry,
  createProcessingEntry,
  markEntryAsError,
} from '../../services/journalService';
import { uploadMealPhoto } from '../../services/storageService';
import { colors, radius, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<TodayStackParamList, 'PhotoCapture'>;

export const PhotoCaptureScreen = ({ navigation, route }: Props): React.JSX.Element => {
  const { user, userDoc } = useAuth();
  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const pickFromCamera = async () => {
    const response = await launchCamera({
      mediaType: 'photo',
      cameraType: 'back',
      quality: 0.8,
      saveToPhotos: false,
    });

    if (response.didCancel) {
      return;
    }

    const uri = response.assets?.[0]?.uri;
    if (!uri) {
      Alert.alert('Could not capture photo.');
      return;
    }

    setSelectedUri(uri);
  };

  const pickFromLibrary = async () => {
    const response = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8,
    });

    if (response.didCancel) {
      return;
    }

    const uri = response.assets?.[0]?.uri;
    if (!uri) {
      Alert.alert('Could not select photo.');
      return;
    }

    setSelectedUri(uri);
  };

  const runAnalysisWithRetry = async (
    photoUrl: string,
    dateKey: string,
    retries = 1,
  ) => {
    if (!userDoc) {
      throw new Error('Missing user settings.');
    }

    try {
      return await analyzeMealPhoto({
        photoUrl,
        date: dateKey,
        locale: Intl.DateTimeFormat().resolvedOptions().locale,
        bias: userDoc.settings.calorieBias,
        units: userDoc.settings.units,
        location: userDoc.settings.useLocationForRestaurants ? 'city-only' : undefined,
      });
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        return runAnalysisWithRetry(photoUrl, dateKey, retries - 1);
      }

      throw error;
    }
  };

  const handleUsePhoto = async () => {
    if (!user || !userDoc || !selectedUri || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    const dateKey = route.params.dateKey;

    const entryId = await createProcessingEntry(user.uid, dateKey, {
      mealText: 'Photo meal',
      source: 'photo',
    });

    navigation.popToTop();

    try {
      const photoUrl = await uploadMealPhoto(user.uid, dateKey, entryId, selectedUri);
      const analysis = await runAnalysisWithRetry(photoUrl, dateKey);

      await applyAnalysisResultToEntry(user.uid, dateKey, entryId, analysis);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Could not estimate nutrition from photo.';
      await markEntryAsError(user.uid, dateKey, entryId, reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen} testID="screen-photo-capture">
      <Text style={styles.title}>Add meal by photo</Text>

      {selectedUri ? (
        <Image source={{ uri: selectedUri }} style={styles.preview} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No photo selected yet.</Text>
        </View>
      )}

      <View style={styles.actions}>
        <Pressable style={styles.secondaryButton} onPress={() => pickFromCamera().catch(() => undefined)} testID="photo-capture-camera-button">
          <Text style={styles.secondaryButtonLabel}>Take photo</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => pickFromLibrary().catch(() => undefined)} testID="photo-capture-gallery-button">
          <Text style={styles.secondaryButtonLabel}>Choose from gallery</Text>
        </Pressable>

        <Pressable
          style={[styles.primaryButton, (!selectedUri || isSubmitting) && styles.buttonDisabled]}
          disabled={!selectedUri || isSubmitting}
          onPress={() => handleUsePhoto().catch(() => undefined)}
          testID="photo-capture-use-photo-button">
          <Text style={styles.primaryButtonLabel}>{isSubmitting ? 'Uploading...' : 'Use photo'}</Text>
        </Pressable>

        <Pressable onPress={() => navigation.goBack()} style={styles.cancelButton} testID="photo-capture-cancel-button">
          <Text style={styles.cancelButtonLabel}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  preview: {
    width: '100%',
    height: 260,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholder: {
    width: '100%',
    height: 260,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  secondaryButton: {
    height: 46,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: spacing.sm,
    height: 50,
    borderRadius: radius.pill,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonLabel: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
});



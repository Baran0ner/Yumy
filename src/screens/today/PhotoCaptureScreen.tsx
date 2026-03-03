import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
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
import { AppButton } from '../../components/common/AppButton';
import { colors, radius, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<TodayStackParamList, 'PhotoCapture'>;

export const PhotoCaptureScreen = ({ navigation, route }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const { user, userDoc, canLogMeals, startGuestTrialIfNeeded } = useAuth();
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
      Alert.alert(t('photo.captureFailed'));
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
      Alert.alert(t('photo.selectFailed'));
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
      throw new Error(t('photo.missingSettings'));
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

    if (!canLogMeals) {
      Alert.alert(t('common.signIn'), t('today.quickAddBlocked'));
      return;
    }

    setIsSubmitting(true);
    const dateKey = route.params.dateKey;

    const entryId = await createProcessingEntry(user.uid, dateKey, {
      mealText: t('photo.photoMeal'),
      source: 'photo',
    });

    navigation.popToTop();

    try {
      const photoUrl = await uploadMealPhoto(user.uid, dateKey, entryId, selectedUri);
      const analysis = await runAnalysisWithRetry(photoUrl, dateKey);

      await applyAnalysisResultToEntry(user.uid, dateKey, entryId, analysis);
      await startGuestTrialIfNeeded();
    } catch (error) {
      const reason = error instanceof Error ? error.message : t('photo.estimateFailed');
      await markEntryAsError(user.uid, dateKey, entryId, reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen} testID="screen-photo-capture">
      <Text style={styles.title}>{t('photo.title')}</Text>

      {selectedUri ? (
        <Image source={{ uri: selectedUri }} style={styles.preview} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>{t('photo.noPhoto')}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <AppButton variant="outline" onPress={() => pickFromCamera().catch(() => undefined)} testID="photo-capture-camera-button">
          {t('photo.takePhoto')}
        </AppButton>

        <AppButton variant="outline" onPress={() => pickFromLibrary().catch(() => undefined)} testID="photo-capture-gallery-button">
          {t('photo.chooseGallery')}
        </AppButton>

        <AppButton
          disabled={!selectedUri || isSubmitting}
          onPress={() => handleUsePhoto().catch(() => undefined)}
          testID="photo-capture-use-photo-button">
          {isSubmitting ? t('photo.uploading') : t('photo.usePhoto')}
        </AppButton>

        <AppButton variant="text" onPress={() => navigation.goBack()} testID="photo-capture-cancel-button">
          {t('common.cancel')}
        </AppButton>
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
});
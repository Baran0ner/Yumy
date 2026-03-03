import React, { Suspense, useState } from 'react';
import { Modal, PermissionsAndroid, Platform, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Camera, CameraType } from 'react-native-camera-kit';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import type { TodayStackParamList } from '../../navigation/types';
import { analyzeMealText, lookupBarcode } from '../../services/functionsService';
import { normalizeBarcodeLookupResult } from '../../services/barcodeService';
import { logKpiEvent } from '../../services/analyticsService';
import {
  applyAnalysisResultToEntry,
  createProcessingEntry,
  createReadyEntry,
  markEntryAsError,
} from '../../services/journalService';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { AppCard } from '../../components/common/AppCard';
import { colors, radius, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<TodayStackParamList, 'BarcodeScan'>;

export const BarcodeScanScreen = ({ navigation, route }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const { user, userDoc, canLogMeals, startGuestTrialIfNeeded } = useAuth();
  const [barcode, setBarcode] = useState<string>('');
  const [fallbackText, setFallbackText] = useState<string>('');
  const [showFallback, setShowFallback] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraVisible, setIsCameraVisible] = useState<boolean>(false);
  const [lastScannedValue, setLastScannedValue] = useState<string | null>(null);

  const ensureCanLog = (): boolean => {
    if (canLogMeals) {
      return true;
    }

    setError(t('today.quickAddBlocked'));
    return false;
  };

  const runLookup = async (barcodeOverride?: string) => {
    if (!user || !userDoc || isSubmitting) {
      return;
    }

    if (!ensureCanLog()) {
      return;
    }

    const cleanBarcode = (barcodeOverride ?? barcode).trim();

    if (cleanBarcode.length < 8) {
      setError(t('barcode.manualPlaceholder'));
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const rawResult = await lookupBarcode({
        barcode: cleanBarcode,
        locale: Intl.DateTimeFormat().resolvedOptions().locale,
      });
      const result = normalizeBarcodeLookupResult(rawResult);

      if (!result.found) {
        setShowFallback(true);
        setError(t('barcode.notFound'));
        return;
      }

      await createReadyEntry(user.uid, route.params.dateKey, {
        mealText: result.productName,
        source: 'barcode',
        calories: Math.round(result.calories),
        macros: {
          proteinG: Math.round(result.macros.protein_g),
          carbsG: Math.round(result.macros.carbs_g),
          fatG: Math.round(result.macros.fat_g),
        },
        model: 'openfoodfacts-lookup',
        reasoningSummary: `${result.sourceTitle} lookup`,
        barcodeValue: cleanBarcode,
        scanProvider: 'openfoodfacts',
      });

      await startGuestTrialIfNeeded();
      logKpiEvent(user.uid, 'barcode_log_submitted', {
        mode: 'scan_lookup',
        barcode: cleanBarcode,
        calories: Math.round(result.calories),
      }).catch(() => undefined);
      navigation.goBack();
    } catch (lookupError) {
      const message = lookupError instanceof Error ? lookupError.message : t('barcode.notFound');
      setError(message);
      setShowFallback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const runFallbackAnalyze = async () => {
    if (!user || !userDoc || isSubmitting) {
      return;
    }

    if (!ensureCanLog()) {
      return;
    }

    const text = fallbackText.trim();

    if (text.length < 3) {
      setError(t('today.typeThreeChars'));
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const entryId = await createProcessingEntry(user.uid, route.params.dateKey, {
      mealText: text,
      source: 'barcode',
      barcodeValue: barcode.trim() || undefined,
      scanProvider: 'manual',
    });

    try {
      const analysis = await analyzeMealText({
        mealText: text,
        date: route.params.dateKey,
        locale: Intl.DateTimeFormat().resolvedOptions().locale,
        bias: userDoc.settings.calorieBias,
        units: userDoc.settings.units,
        location: userDoc.settings.useLocationForRestaurants ? 'city-only' : undefined,
      });

      await applyAnalysisResultToEntry(user.uid, route.params.dateKey, entryId, analysis);
      await startGuestTrialIfNeeded();
      logKpiEvent(user.uid, 'barcode_log_submitted', {
        mode: 'manual_fallback',
        barcode: barcode.trim() || null,
        calories: analysis.total.calories,
      }).catch(() => undefined);
      navigation.goBack();
    } catch (analysisError) {
      const reason =
        analysisError instanceof Error ? analysisError.message : 'Could not estimate nutrition.';
      await markEntryAsError(user.uid, route.params.dateKey, entryId, reason);
      setError(reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    return result === PermissionsAndroid.RESULTS.GRANTED;
  };

  const openCamera = async () => {
    if (isSubmitting) {
      return;
    }

    if (!ensureCanLog()) {
      return;
    }

    const granted = await requestCameraPermission();

    if (!granted) {
      setError(t('barcode.cameraPermissionDenied'));
      return;
    }

    setLastScannedValue(null);
    setIsCameraVisible(true);
  };

  const closeCamera = () => {
    setIsCameraVisible(false);
  };

  const onReadCode = (event: { nativeEvent: { codeStringValue: string } }) => {
    if (isSubmitting) {
      return;
    }

    const rawValue = event.nativeEvent.codeStringValue?.trim();

    if (!rawValue || rawValue === lastScannedValue) {
      return;
    }

    setLastScannedValue(rawValue);
    setBarcode(rawValue);
    setShowFallback(false);
    closeCamera();
    runLookup(rawValue).catch(() => undefined);
  };

  return (
    <View style={styles.screen} testID="screen-barcode-scan">
      <Text style={styles.title}>{t('barcode.title')}</Text>
      <Text style={styles.subtitle}>{t('barcode.subtitle')}</Text>

      <Text style={styles.label}>{t('barcode.manualLabel')}</Text>
      <AppInput
        value={barcode}
        onChangeText={setBarcode}
        placeholder={t('barcode.manualPlaceholder')}
        keyboardType="number-pad"
        style={styles.input}
        testID="barcode-input"
      />

      <View style={styles.actions}>
        <AppButton
          variant="outline"
          onPress={() => openCamera().catch(() => undefined)}
          disabled={isSubmitting}
          testID="barcode-camera-button">
          {t('barcode.cameraScan')}
        </AppButton>

        <AppButton
          onPress={() => runLookup().catch(() => undefined)}
          disabled={isSubmitting}
          testID="barcode-lookup-button">
          {isSubmitting ? t('common.loading') : t('barcode.lookup')}
        </AppButton>
      </View>

      {showFallback ? (
        <AppCard style={styles.fallbackCard} contentStyle={styles.fallbackContent}>
          <Text style={styles.fallbackTitle}>{t('barcode.useFallback')}</Text>
          <AppInput
            value={fallbackText}
            onChangeText={setFallbackText}
            placeholder={t('barcode.fallbackPlaceholder')}
            style={styles.input}
            contentStyle={styles.fallbackInput}
            multiline
            testID="barcode-fallback-input"
          />
          <AppButton
            onPress={() => runFallbackAnalyze().catch(() => undefined)}
            disabled={isSubmitting}
            testID="barcode-fallback-submit-button">
            {t('barcode.applyFallback')}
          </AppButton>
        </AppCard>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <AppButton variant="text" onPress={() => navigation.goBack()} testID="barcode-cancel-button">
        {t('common.cancel')}
      </AppButton>

      <Modal
        visible={isCameraVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeCamera}>
        <View style={styles.cameraScreen}>
          <View style={styles.cameraHeader}>
            <AppButton variant="text" size="sm" onPress={closeCamera} testID="barcode-camera-close-button">
              {t('common.cancel')}
            </AppButton>
            <Text style={styles.cameraHeaderTitle}>{t('barcode.cameraScan')}</Text>
            <View style={styles.cameraHeaderPlaceholder} />
          </View>

          <View style={styles.cameraWrap}>
            <Suspense fallback={<Text style={styles.cameraHint}>{t('common.loading')}</Text>}>
              <Camera
                style={styles.camera}
                cameraType={CameraType.Back}
                scanBarcode
                showFrame
                laserColor="#FF5A00"
                frameColor="#FFFFFF"
                onReadCode={onReadCode}
              />
            </Suspense>
          </View>

          <Text style={styles.cameraHint}>{t('barcode.cameraHint')}</Text>
        </View>
      </Modal>
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
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  input: {
    height: 48,
  },
  actions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  fallbackCard: {
    marginTop: spacing.lg,
  },
  fallbackContent: {
    gap: spacing.sm,
  },
  fallbackTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  fallbackInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  errorText: {
    marginTop: spacing.sm,
    color: colors.error,
    fontSize: 12,
    fontWeight: '600',
  },
  cameraScreen: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  cameraHeader: {
    paddingHorizontal: spacing.md,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cameraHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cameraHeaderPlaceholder: {
    width: 56,
  },
  cameraWrap: {
    flex: 1,
    marginTop: spacing.sm,
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  camera: {
    flex: 1,
  },
  cameraHint: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
  },
});
# Yumy (React Native)

Amy-style food journal prototype built with:

- React Native + TypeScript
- React Navigation (RootStack + nested Tabs/Stacks)
- Firebase Auth + Firestore + Functions + Storage
- Gemini analysis through Cloud Functions only
- RevenueCat subscription flow
- Notifee local reminder scheduling
- Apple Health / Google Fit sync (weight + steps)

## Commands

```bash
npm install
npm run start
npm run android
npm run ios
npm run lint
npm test -- --runInBand
```

Functions:

```bash
cd functions
npm install
npm run build
```

## Runtime Config

Set these values in `src/config/appConfig.ts`:

- `googleWebClientId`
- `revenueCatAppleApiKey`
- `revenueCatGoogleApiKey`
- `revenueCatEntitlementId`

`.env.example` includes the same key names for reference.

## RevenueCat Setup

1. Create products in App Store Connect / Google Play Console.
2. Add both stores in RevenueCat.
3. Create an entitlement (default in app is `premium`).
4. Create an Offering with Monthly and Yearly packages.
5. Put RevenueCat public SDK keys into `appConfig.ts`.
6. Run the app and verify:
   - Paywall loads dynamic price strings from current offering.
   - Start trial/purchase updates `users/{uid}.subscription`.
   - Restore purchases updates status.

## Notifee Reminder Setup

Implemented with trigger notifications (`RepeatFrequency.DAILY`) in `src/services/reminderService.ts`.

- Frequency: 1..5
- Time window: start/end
- Existing reminder triggers are replaced when rescheduling.
- Requires notification permission on first scheduling.

Android permissions already added in `AndroidManifest.xml`:

- `POST_NOTIFICATIONS`
- `ACTIVITY_RECOGNITION`

## Health Sync Setup

Implemented in `src/services/healthService.ts`.

- iOS: `react-native-health` (Apple HealthKit)
- Android: `react-native-google-fit` (Google Fit)

### iOS

Added:

- `NSHealthShareUsageDescription`
- `NSHealthUpdateUsageDescription`
- `NSUserNotificationUsageDescription`
- `YumyScaffold.entitlements` with:
  - `com.apple.developer.healthkit`
  - `aps-environment`

Also set `CODE_SIGN_ENTITLEMENTS` in project build settings.

After pulling changes, run in `ios/`:

```bash
pod install
```

### Android

Google Fit scopes are requested at runtime through `react-native-google-fit`.

## Firebase Functions

`functions/src/index.ts` exposes:

- `analyzeMealText`
- `analyzeMealPhoto`
- `recomputeDayTotals`

Gemini key is server-side only (`GEMINI_API_KEY` env in Functions runtime).

## Current Flow Coverage

- Onboarding + sign in
- RevenueCat paywall + restore
- Today list with `Thinking...` processing state
- Add entry text/photo
- Entry detail/edit/saved meals
- History/day detail
- Goals + macro plan + streaks/badges
- Settings (bias/reminders/units/location/health/account/privacy/support)

## Notes

- Account deletion supports provider re-auth (Apple/Google) and best-effort Firestore/Storage cleanup.
- This repo may contain unrelated local changes in Android build files from prior setup; current app logic compiles and tests pass.

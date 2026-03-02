# Yumy (React Native)

Bu repo, paylasilan `deep-research-report (7).md` planina gore baslatildi.
Su an temel MVP akisi + Android Firebase Auth (Google) + Firestore senkronizasyonu eklidir.

## Tamamlananlar

- React Native TypeScript proje iskeleti
- Meal ekleme, gunluk ozet, gecmis ekrani
- AsyncStorage ile offline-first meal saklama
- Edamam hazirligi + fallback nutrition hesaplama
- Firebase Functions altinda Gemini proxy iskeleti
- Android icin Firebase Auth + Google Sign-In akisi
- Firestore tabanli remote kayit ve local/remote birlestirme

## Kurulum

```bash
npm install
npm run start
npm run android
```

## Firebase Auth (Android) Gerekenler

1. `android/app/google-services.json` dosyasi mevcut olmali.
2. Bu dosyadaki package name su an: `com.subsetapp.yummy`.
3. Firebase Console > Authentication > Sign-in method > Google acik olmali.
4. Google Web Client ID degeri `src/config/appConfig.ts` icindeki `googleWebClientId` alanina yazilmali.

Not: Web Client ID olmadan `idToken` alinmaz ve Firebase credential login basarisiz olur.

## Firestore Senkron Gerekenler

1. Firebase Console > Firestore Database olusturulmus olmali.
2. Guvenlik kurallari `firestore.rules` dosyasina gore deploy edilmeli.
3. Uygulamadaki manuel `Senkronize Et` aksiyonu offline kayitlari Firestore'a yazar.
4. Uygulama acilisinda Firestore'daki kayitlar locale merge edilir.

## Ortam ve Konfig Alanlari

`.env.example`:

- `DEMO_USER_ID`
- `EDAMAM_APP_ID`
- `EDAMAM_APP_KEY`
- `GEMINI_FUNCTION_URL`
- `GOOGLE_WEB_CLIENT_ID`

Su an uygulama config degerleri `src/config/appConfig.ts` icinde tutuluyor.

## Mimari

- `src/context/AuthContext.tsx`: Firebase auth state + Google sign-in/sign-out
- `src/context/MealContext.tsx`: meal state, load/add/sync
- `src/services/mealRepository.ts`: local + remote meal orchestrasyonu
- `src/services/localMealStore.ts`: AsyncStorage
- `src/services/remoteMealStore.ts`: Firestore baglantisi icin interface
- `src/services/firebaseRemoteMealStore.ts`: Firestore implementasyonu

## Dizinler

```text
.
|- App.tsx
|- src/
|  |- components/
|  |- config/
|  |- context/
|  |- navigation/
|  |- screens/
|  |- services/
|  |- types/
|  |- utils/
|- functions/
|  |- src/index.ts
|- firestore.rules
```

## Sonraki Adimlar

1. iOS Firebase Auth icin `GoogleService-Info.plist` ve pod kurulumlari
2. Kamera + image upload + Gemini/ML analiz akisi
3. Push notification, subscription, health integrasyonlari

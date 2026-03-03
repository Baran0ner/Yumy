export const appConfig = {
  googleWebClientId: '',
  demoUserId: 'demo-user',
  edamamAppId: '',
  edamamAppKey: '',
  geminiFunctionUrl: '',
  revenueCatAppleApiKey: '',
  revenueCatGoogleApiKey: '',
  revenueCatEntitlementId: 'premium',
};

export const isEdamamConfigured = (): boolean =>
  Boolean(appConfig.edamamAppId && appConfig.edamamAppKey);

export const isRevenueCatConfigured = (): boolean =>
  Boolean(appConfig.revenueCatAppleApiKey && appConfig.revenueCatGoogleApiKey);

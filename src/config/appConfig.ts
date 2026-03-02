export const appConfig = {
  demoUserId: 'demo-user',
  edamamAppId: '',
  edamamAppKey: '',
  geminiFunctionUrl: '',
  googleWebClientId: '',
};

export const isEdamamConfigured = (): boolean =>
  Boolean(appConfig.edamamAppId && appConfig.edamamAppKey);

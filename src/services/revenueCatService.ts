import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';
import { appConfig } from '../config/appConfig';

export type RevenueCatPlan = 'monthly' | 'yearly';

export type PaywallPlanOption = {
  id: RevenueCatPlan;
  title: string;
  priceLabel: string;
};

export type RevenueCatSubscriptionState = {
  status: 'trial' | 'active' | 'inactive';
  renewedAt: string | null;
  expiresAt: string | null;
};

let configuredUserId: string | null = null;

const getApiKey = (): string =>
  Platform.OS === 'ios' ? appConfig.revenueCatAppleApiKey : appConfig.revenueCatGoogleApiKey;

export const mapCustomerInfoToSubscriptionState = (
  info: CustomerInfo,
): RevenueCatSubscriptionState => {
  const entitlementId = appConfig.revenueCatEntitlementId.trim();
  const activeEntitlements = info.entitlements.active;

  const entitlement = entitlementId
    ? activeEntitlements[entitlementId]
    : Object.values(activeEntitlements)[0];

  if (!entitlement) {
    return {
      status: 'inactive',
      renewedAt: null,
      expiresAt: null,
    };
  }

  const status = entitlement.periodType === 'TRIAL' ? 'trial' : 'active';

  return {
    status,
    renewedAt: entitlement.latestPurchaseDate ?? info.requestDate ?? null,
    expiresAt: entitlement.expirationDate ?? info.latestExpirationDate ?? null,
  };
};

const findPackageForPlan = (offering: PurchasesOffering, plan: RevenueCatPlan): PurchasesPackage | null => {
  if (plan === 'monthly') {
    return (
      offering.monthly ??
      offering.availablePackages.find(pkg =>
        pkg.identifier.toLowerCase().includes('month'),
      ) ??
      null
    );
  }

  return (
    offering.annual ??
    offering.availablePackages.find(pkg => {
      const key = pkg.identifier.toLowerCase();
      return key.includes('year') || key.includes('annual');
    }) ??
    null
  );
};

const ensureConfigured = async (userId: string): Promise<void> => {
  const apiKey = getApiKey().trim();
  if (!apiKey) {
    throw new Error('RevenueCat API key is missing. Set platform keys in appConfig.');
  }

  if (configuredUserId === userId) {
    return;
  }

  const isConfigured = await Purchases.isConfigured();

  if (isConfigured && configuredUserId && configuredUserId !== userId) {
    await Purchases.logOut().catch(() => undefined);
  }

  Purchases.setLogLevel(LOG_LEVEL.INFO);
  Purchases.configure({
    apiKey,
    appUserID: userId,
  });

  configuredUserId = userId;
};

export const configureRevenueCatForUser = async (
  userId: string,
  onCustomerInfoUpdate?: (info: CustomerInfo) => void,
): Promise<void> => {
  await ensureConfigured(userId);

  if (onCustomerInfoUpdate) {
    Purchases.addCustomerInfoUpdateListener(onCustomerInfoUpdate);
  }
};

export const removeRevenueCatListener = (
  listener: (info: CustomerInfo) => void,
): void => {
  Purchases.removeCustomerInfoUpdateListener(listener);
};

export const getCustomerInfoStatus = async (
  userId: string,
): Promise<RevenueCatSubscriptionState> => {
  await ensureConfigured(userId);
  const info = await Purchases.getCustomerInfo();
  return mapCustomerInfoToSubscriptionState(info);
};

export const purchaseSelectedPlan = async (
  userId: string,
  plan: RevenueCatPlan,
): Promise<RevenueCatSubscriptionState> => {
  await ensureConfigured(userId);

  const offerings = await Purchases.getOfferings();
  const current = offerings.current;

  if (!current) {
    throw new Error('No active RevenueCat offering found.');
  }

  const selectedPackage = findPackageForPlan(current, plan);
  if (!selectedPackage) {
    throw new Error(`No ${plan} package found in current offering.`);
  }

  const result = await Purchases.purchasePackage(selectedPackage);
  return mapCustomerInfoToSubscriptionState(result.customerInfo);
};

export const restoreRevenueCatPurchases = async (
  userId: string,
): Promise<RevenueCatSubscriptionState> => {
  await ensureConfigured(userId);
  const info = await Purchases.restorePurchases();
  return mapCustomerInfoToSubscriptionState(info);
};

export const getPaywallPlanOptions = async (userId: string): Promise<PaywallPlanOption[]> => {
  await ensureConfigured(userId);

  const offerings = await Purchases.getOfferings();
  const current = offerings.current;

  if (!current) {
    return [
      { id: 'monthly', title: 'Monthly', priceLabel: '$9.99 / month' },
      { id: 'yearly', title: 'Yearly', priceLabel: '$59.99 / year' },
    ];
  }

  const monthly = findPackageForPlan(current, 'monthly');
  const yearly = findPackageForPlan(current, 'yearly');

  return [
    {
      id: 'monthly',
      title: 'Monthly',
      priceLabel: monthly?.product.priceString
        ? `${monthly.product.priceString} / month`
        : '$9.99 / month',
    },
    {
      id: 'yearly',
      title: 'Yearly',
      priceLabel: yearly?.product.priceString
        ? `${yearly.product.priceString} / year`
        : '$59.99 / year',
    },
  ];
};

export const openManageSubscriptions = async (userId: string): Promise<void> => {
  await ensureConfigured(userId);
  await Purchases.showManageSubscriptions();
};

export const logOutRevenueCat = async (): Promise<void> => {
  const isConfigured = await Purchases.isConfigured();
  if (!isConfigured) {
    configuredUserId = null;
    return;
  }

  await Purchases.logOut().catch(() => undefined);
  configuredUserId = null;
};

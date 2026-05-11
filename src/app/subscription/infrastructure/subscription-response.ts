import { BillingCycle, SubscriptionStatus } from '../domain/model/subscription-plan.entity';

export interface PlanFeatureResponse {
  description: string;
  available: boolean;
}

export interface SubscriptionPlanResponse {
  id: string;
  name: string;
  shortDescription: string;
  monthlyPrice: number;
  annualPrice: number;
  status: SubscriptionStatus;
  statusLabel: string;
  badgeLabel: string;
  recommended: boolean;
  currentPeriodStartDate?: string;
  currentPeriodEndDate?: string;
  features: PlanFeatureResponse[];
}

export interface SubscriptionLimitResponse {
  id: string;
  label: string;
  usedValue: number;
  maxValue: number;
}

export interface BillingSetupResponse {
  paymentMethodTitle: string;
  paymentMethodDescription: string;
  paymentMethodActionLabel: string;
  fiscalDataTitle: string;
  fiscalDataDescription: string;
  fiscalDataActionLabel: string;
  hasPaymentMethod: boolean;
  hasFiscalData: boolean;
}

export interface SubscriptionActivityResponse {
  id: string;
  title: string;
  detail: string;
}

export interface SubscriptionDashboardResponse {
  id: number;
  defaultBillingCycle: BillingCycle;
  currentPlan: SubscriptionPlanResponse;
  recommendedPlan: SubscriptionPlanResponse;
  limits: SubscriptionLimitResponse[];
  billingSetup: BillingSetupResponse;
  activity: SubscriptionActivityResponse[];
}

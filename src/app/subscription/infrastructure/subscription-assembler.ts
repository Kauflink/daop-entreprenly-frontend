import { BillingSetup } from '../domain/model/billing-setup.entity';
import { SubscriptionActivity } from '../domain/model/subscription-activity.entity';
import { SubscriptionDashboard } from '../domain/model/subscription-dashboard.entity';
import { SubscriptionLimit } from '../domain/model/subscription-limit.entity';
import { PlanFeature, SubscriptionPlan } from '../domain/model/subscription-plan.entity';
import {
  BillingSetupResponse,
  PlanFeatureResponse,
  SubscriptionActivityResponse,
  SubscriptionDashboardResponse,
  SubscriptionLimitResponse,
  SubscriptionPlanResponse,
} from './subscription-response';

export class SubscriptionAssembler {
  static toEntityFromResponse(response: SubscriptionDashboardResponse): SubscriptionDashboard {
    return new SubscriptionDashboard({
      defaultBillingCycle: response.defaultBillingCycle,
      currentPlan: this.toPlanEntityFromResponse(response.currentPlan),
      recommendedPlan: this.toPlanEntityFromResponse(response.recommendedPlan),
      limits: response.limits.map((limit) => this.toLimitEntityFromResponse(limit)),
      billingSetup: this.toBillingSetupEntityFromResponse(response.billingSetup),
      activity: response.activity.map((activity) => this.toActivityEntityFromResponse(activity)),
    });
  }

  private static toPlanEntityFromResponse(response: SubscriptionPlanResponse): SubscriptionPlan {
    return new SubscriptionPlan({
      id: response.id,
      name: response.name,
      shortDescription: response.shortDescription,
      monthlyPrice: response.monthlyPrice,
      annualPrice: response.annualPrice,
      status: response.status,
      statusLabel: response.statusLabel,
      badgeLabel: response.badgeLabel,
      recommended: response.recommended,
      currentPeriodStartDate: response.currentPeriodStartDate ?? '',
      currentPeriodEndDate: response.currentPeriodEndDate ?? '',
      features: response.features.map((feature) => this.toFeatureEntityFromResponse(feature)),
    });
  }

  private static toFeatureEntityFromResponse(response: PlanFeatureResponse): PlanFeature {
    return new PlanFeature({
      description: response.description,
      available: response.available,
    });
  }

  private static toLimitEntityFromResponse(response: SubscriptionLimitResponse): SubscriptionLimit {
    return new SubscriptionLimit({
      id: response.id,
      label: response.label,
      usedValue: response.usedValue,
      maxValue: response.maxValue,
    });
  }

  private static toBillingSetupEntityFromResponse(response: BillingSetupResponse): BillingSetup {
    return new BillingSetup({
      paymentMethodTitle: response.paymentMethodTitle,
      paymentMethodDescription: response.paymentMethodDescription,
      paymentMethodActionLabel: response.paymentMethodActionLabel,
      fiscalDataTitle: response.fiscalDataTitle,
      fiscalDataDescription: response.fiscalDataDescription,
      fiscalDataActionLabel: response.fiscalDataActionLabel,
      hasPaymentMethod: response.hasPaymentMethod,
      hasFiscalData: response.hasFiscalData,
    });
  }

  private static toActivityEntityFromResponse(
    response: SubscriptionActivityResponse,
  ): SubscriptionActivity {
    return new SubscriptionActivity({
      id: response.id,
      title: response.title,
      detail: response.detail,
    });
  }
}

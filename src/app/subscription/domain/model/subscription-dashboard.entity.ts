import { BillingSetup } from './billing-setup.entity';
import { SubscriptionActivity } from './subscription-activity.entity';
import { SubscriptionLimit } from './subscription-limit.entity';
import { SubscriptionPlan } from './subscription-plan.entity';

export class SubscriptionDashboard {
  currentPlan: SubscriptionPlan;
  recommendedPlan: SubscriptionPlan;
  limits: SubscriptionLimit[];
  billingSetup: BillingSetup;
  activity: SubscriptionActivity[];

  constructor(dashboard?: Partial<SubscriptionDashboard>) {
    this.currentPlan = dashboard?.currentPlan ?? new SubscriptionPlan();
    this.recommendedPlan = dashboard?.recommendedPlan ?? new SubscriptionPlan();
    this.limits = dashboard?.limits ?? [];
    this.billingSetup = dashboard?.billingSetup ?? new BillingSetup();
    this.activity = dashboard?.activity ?? [];
  }
}

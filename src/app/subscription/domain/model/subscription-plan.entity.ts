export type BillingCycle = 'monthly' | 'annual';
export type SubscriptionStatus = 'free' | 'active' | 'scheduled-cancellation' | 'cancelled';

export class PlanFeature {
  description: string;
  available: boolean;

  constructor(feature?: Partial<PlanFeature>) {
    this.description = feature?.description ?? '';
    this.available = feature?.available ?? true;
  }
}

export class SubscriptionPlan {
  id: string;
  name: string;
  shortDescription: string;
  monthlyPrice: number;
  annualPrice: number;
  status: SubscriptionStatus;
  statusLabel: string;
  badgeLabel: string;
  recommended: boolean;
  features: PlanFeature[];

  constructor(plan?: Partial<SubscriptionPlan>) {
    this.id = plan?.id ?? '';
    this.name = plan?.name ?? '';
    this.shortDescription = plan?.shortDescription ?? '';
    this.monthlyPrice = plan?.monthlyPrice ?? 0;
    this.annualPrice = plan?.annualPrice ?? 0;
    this.status = plan?.status ?? 'free';
    this.statusLabel = plan?.statusLabel ?? '';
    this.badgeLabel = plan?.badgeLabel ?? '';
    this.recommended = plan?.recommended ?? false;
    this.features = plan?.features ?? [];
  }
}

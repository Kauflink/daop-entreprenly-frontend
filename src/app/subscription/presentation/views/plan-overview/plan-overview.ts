import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BillingCycle, SubscriptionPlan } from '../../../domain/model/subscription-plan.entity';

@Component({
  selector: 'app-plan-overview',
  imports: [MatIconModule, TranslatePipe],
  templateUrl: './plan-overview.html',
  styleUrl: './plan-overview.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanOverview {
  readonly currentPlan = input.required<SubscriptionPlan>();
  readonly recommendedPlan = input.required<SubscriptionPlan>();
  readonly selectedCycle = input.required<BillingCycle>();
  readonly controlPlanSelected = input.required<boolean>();

  readonly billingCycleSelected = output<BillingCycle>();
  readonly controlPlanRequested = output<void>();
  readonly renewalRequested = output<void>();
  readonly cancellationRequested = output<void>();
  readonly keepPlanRequested = output<void>();

  private readonly translate = inject(TranslateService);

  protected readonly selectedPrice = computed(() =>
    this.selectedCycle() === 'monthly'
      ? this.recommendedPlan().monthlyPrice
      : this.recommendedPlan().annualPrice,
  );
  protected readonly selectedPriceLabelKey = computed(() =>
    this.selectedCycle() === 'monthly'
      ? 'subscription.overview.priceLabel.monthly'
      : 'subscription.overview.priceLabel.annual',
  );
  protected readonly currentPlanPriceLabelKey = computed(() =>
    this.currentPlan().monthlyPrice === 0
      ? 'subscription.overview.priceLabel.free'
      : 'subscription.overview.priceLabel.monthly',
  );
  protected readonly planControlCurrentPlan = computed(() =>
    ['active', 'scheduled-cancellation'].includes(this.currentPlan().status),
  );
  protected readonly cancellationScheduled = computed(
    () => this.currentPlan().status === 'scheduled-cancellation',
  );
  protected readonly cancellationActionLabelKey = computed(() =>
    this.cancellationScheduled()
      ? 'subscription.overview.keepPlanAction'
      : 'subscription.overview.cancelAction',
  );
  protected readonly currentPlanDescriptionParams = computed(() => ({
    date: this.formatPlanDate(this.currentPlan().currentPeriodEndDate),
  }));

  protected planNameKey(plan: SubscriptionPlan): string {
    return plan.id === 'plan-free' ? 'subscription.plans.free.name' : 'subscription.plans.control.name';
  }

  protected currentPlanBadgeLabelKey(plan: SubscriptionPlan): string {
    return plan.id === 'plan-free'
      ? 'subscription.plans.free.badge'
      : 'subscription.plans.current.badgeLabel';
  }

  protected recommendedPlanBadgeLabelKey(): string {
    return 'subscription.plans.control.badgeLabel';
  }

  protected statusLabelKey(plan: SubscriptionPlan): string {
    if (plan.status === 'free') {
      return 'subscription.plans.free.status';
    }

    return `subscription.plans.control.statusLabel.${plan.status}`;
  }

  protected shortDescriptionKey(plan: SubscriptionPlan): string {
    if (plan.id === 'plan-free') {
      return 'subscription.plans.free.shortDescription';
    }

    return `subscription.plans.control.shortDescription.${plan.status}`;
  }

  protected featureKey(plan: SubscriptionPlan, index: number): string {
    if (plan.id === 'plan-free') {
      return [
        'subscription.plans.free.features.basicInventory',
        'subscription.plans.free.features.manualMovements',
        'subscription.plans.free.features.noChatbot',
      ][index] ?? plan.features[index]?.description ?? '';
    }

    return [
      'subscription.plans.control.features.unlimitedProducts',
      'subscription.plans.control.features.salesOperations',
      'subscription.plans.control.features.chatbot',
    ][index] ?? plan.features[index]?.description ?? '';
  }

  protected selectBillingCycle(cycle: BillingCycle): void {
    this.billingCycleSelected.emit(cycle);
  }

  protected requestControlPlan(): void {
    this.controlPlanRequested.emit();
  }

  protected requestRenewal(): void {
    this.renewalRequested.emit();
  }

  protected requestCancellationAction(): void {
    if (this.cancellationScheduled()) {
      this.keepPlanRequested.emit();
      return;
    }

    this.cancellationRequested.emit();
  }

  private formatPlanDate(dateValue: string): string {
    const date = this.toLocalDate(dateValue);

    if (date === null) {
      return this.translate.instant('subscription.planAction.fallbackDate');
    }

    return new Intl.DateTimeFormat(this.currentDateLocale(), {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  private currentDateLocale(): string {
    return (this.translate.currentLang ?? this.translate.defaultLang ?? 'en').startsWith('es')
      ? 'es-PE'
      : 'en-US';
  }

  private toLocalDate(dateValue: string): Date | null {
    const [year, month, day] = dateValue.split('-').map((value) => Number(value));

    if (!year || !month || !day) {
      return null;
    }

    return new Date(year, month - 1, day);
  }
}

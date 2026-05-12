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

  private readonly translate = inject(TranslateService);

  protected readonly selectedPrice = computed(() =>
    this.selectedCycle() === 'monthly'
      ? this.recommendedPlan().monthlyPrice
      : this.recommendedPlan().annualPrice,
  );
  protected readonly selectedPriceLabel = computed(() =>
    this.selectedCycle() === 'monthly'
      ? 'subscription.overview.priceLabel.monthly'
      : 'subscription.overview.priceLabel.annual',
  );
  protected readonly currentPlanPriceLabel = computed(() =>
    this.currentPlan().monthlyPrice === 0
      ? 'subscription.overview.priceLabel.free'
      : 'subscription.overview.priceLabel.monthly',
  );
  protected readonly currentPlanPriceAriaLabel = computed(() =>
    this.translate.instant('subscription.overview.priceAriaLabel', {
      price: this.currentPlan().monthlyPrice,
      label: this.translate.instant(this.currentPlanPriceLabel()),
    }),
  );
<<<<<<< Updated upstream
  protected readonly activeCurrentPlan = computed(() => this.currentPlan().status === 'active');
=======
  protected readonly planControlCurrentPlan = computed(() =>
    ['active', 'scheduled-cancellation'].includes(this.currentPlan().status),
  );
  protected readonly cancellationScheduled = computed(
    () => this.currentPlan().status === 'scheduled-cancellation',
  );
  protected readonly cancellationActionLabel = computed(() =>
    this.cancellationScheduled()
      ? 'subscription.overview.keepPlanAction'
      : 'subscription.overview.cancelAction',
  );
>>>>>>> Stashed changes

  protected selectBillingCycle(cycle: BillingCycle): void {
    this.billingCycleSelected.emit(cycle);
  }

  protected requestControlPlan(): void {
    this.controlPlanRequested.emit();
  }
}

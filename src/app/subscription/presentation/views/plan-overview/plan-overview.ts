import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
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

  protected readonly selectedPrice = computed(() =>
    this.selectedCycle() === 'monthly'
      ? this.recommendedPlan().monthlyPrice
      : this.recommendedPlan().annualPrice,
  );
  protected readonly selectedPriceLabel = computed(() =>
    this.selectedCycle() === 'monthly' ? 'pago mensual' : 'pago anual',
  );
  protected readonly currentPlanPriceLabel = computed(() =>
    this.currentPlan().monthlyPrice === 0 ? 'por mes' : 'pago mensual',
  );
  protected readonly currentPlanPriceAriaLabel = computed(
    () => `Costo actual ${this.currentPlan().monthlyPrice} soles ${this.currentPlanPriceLabel()}`,
  );
  protected readonly activeCurrentPlan = computed(() => this.currentPlan().status === 'active');

  protected selectBillingCycle(cycle: BillingCycle): void {
    this.billingCycleSelected.emit(cycle);
  }

  protected requestControlPlan(): void {
    this.controlPlanRequested.emit();
  }
}

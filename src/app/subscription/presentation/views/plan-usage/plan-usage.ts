import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SubscriptionLimit } from '../../../domain/model/subscription-limit.entity';

@Component({
  selector: 'app-plan-usage',
  imports: [TranslatePipe],
  templateUrl: './plan-usage.html',
  styleUrl: './plan-usage.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanUsage {
  readonly limits = input.required<SubscriptionLimit[]>();
  readonly planStatus = input.required<string>();

  protected readonly statusLabelKey = computed(() =>
    this.controlPlanAccessEnabled()
      ? 'subscription.usage.status.control'
      : 'subscription.usage.status.free',
  );

  protected readonly controlPlanAccessEnabled = computed(() =>
    ['active', 'scheduled-cancellation'].includes(this.planStatus()),
  );

  protected limitLabelKey(limit: SubscriptionLimit): string {
    return `subscription.limits.${limit.id}.label`;
  }

  protected limitAriaLabelKey(limit: SubscriptionLimit): string {
    return `subscription.limits.${limit.id}.ariaLabel`;
  }

  protected limitValueLabelKey(limit: SubscriptionLimit): string {
    if (limit.id === 'products') {
      return 'subscription.usage.limitValue.products';
    }

    if (limit.id === 'active-batches') {
      return 'subscription.usage.limitValue.active-batches';
    }

    if (limit.id === 'users') {
      return limit.usedValue === 1
        ? 'subscription.usage.limitValue.users-singular'
        : 'subscription.usage.limitValue.users-plural';
    }

    return 'subscription.usage.limitValue.generic';
  }

  protected limitValueParams(limit: SubscriptionLimit): Record<string, number> {
    return { count: limit.usedValue };
  }

  protected progressValue(limit: SubscriptionLimit): number {
    if (this.controlPlanAccessEnabled() && limit.maxValue <= 0) {
      return 100;
    }

    return limit.percentageUsed;
  }
}

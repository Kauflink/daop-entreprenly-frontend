import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
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

  private readonly translate = inject(TranslateService);

  protected readonly statusLabel = computed(() =>
    this.controlPlanAccessEnabled() ? 'Control' : 'Free',
  );

  protected readonly controlPlanAccessEnabled = computed(() =>
    ['active', 'scheduled-cancellation'].includes(this.planStatus()),
  );

  protected limitValueLabel(limit: SubscriptionLimit): string {
    if (!this.controlPlanAccessEnabled()) {
      return '';
    }

    if (limit.id === 'products') {
      return this.translate.instant('subscription.usage.limitValue.products', { count: limit.usedValue });
    }

    if (limit.id === 'active-batches') {
      return this.translate.instant('subscription.usage.limitValue.active-batches', { count: limit.usedValue });
    }

    if (limit.id === 'users') {
      const key = limit.usedValue === 1 ? 'subscription.usage.limitValue.users-singular' : 'subscription.usage.limitValue.users-plural';
      return this.translate.instant(key, { count: limit.usedValue });
    }

    return `${limit.usedValue}`;
  }

  protected progressValue(limit: SubscriptionLimit): number {
    if (this.controlPlanAccessEnabled() && limit.maxValue <= 0) {
      return 100;
    }

    return limit.percentageUsed;
  }
}

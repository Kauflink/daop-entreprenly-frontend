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
      return `${limit.usedValue} productos`;
    }

    if (limit.id === 'active-batches') {
      return `${limit.usedValue} lotes`;
    }

    if (limit.id === 'users') {
      return limit.usedValue === 1 ? '1 usuario' : `${limit.usedValue} usuarios`;
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

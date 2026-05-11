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
    this.planStatus() === 'active' ? 'Control' : 'Free',
  );

  protected readonly activePlan = computed(() => this.planStatus() === 'active');

  protected limitValueLabel(limit: SubscriptionLimit): string {
    if (!this.activePlan()) {
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
    if (this.activePlan() && limit.maxValue <= 0) {
      return 100;
    }

    return limit.percentageUsed;
  }
}

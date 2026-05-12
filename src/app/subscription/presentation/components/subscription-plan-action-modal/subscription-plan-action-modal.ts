import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BillingCycle, SubscriptionPlan } from '../../../domain/model/subscription-plan.entity';

export type SubscriptionPlanActionModalMode =
  | 'renew'
  | 'cancel'
  | 'cancel-success'
  | 'keep';

@Component({
  selector: 'app-subscription-plan-action-modal',
  imports: [CdkTrapFocus, TranslatePipe],
  templateUrl: './subscription-plan-action-modal.html',
  styleUrl: './subscription-plan-action-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closeFromKeyboard($event)',
  },
})
export class SubscriptionPlanActionModal {
  readonly mode = input.required<SubscriptionPlanActionModalMode>();
  readonly currentPlan = input.required<SubscriptionPlan>();
  readonly billingCycle = input.required<BillingCycle>();

  readonly closed = output<void>();
  readonly cancellationConfirmed = output<void>();
  readonly keepPlanConfirmed = output<void>();

  private readonly translate = inject(TranslateService);

  protected readonly title = computed(() => {
    switch (this.mode()) {
      case 'renew': return 'subscription.planAction.renew.title';
      case 'cancel': return 'subscription.planAction.cancel.title';
      case 'cancel-success': return 'subscription.planAction.cancelSuccess.title';
      case 'keep': return 'subscription.planAction.keep.title';
    }
  });

  protected readonly cardTitle = computed(() => {
    switch (this.mode()) {
      case 'renew': return 'subscription.planAction.renew.cardTitle';
      case 'cancel': return 'subscription.planAction.cancel.cardTitle';
      case 'cancel-success': return 'subscription.planAction.cancelSuccess.cardTitle';
      case 'keep': return 'subscription.planAction.keep.cardTitle';
    }
  });

  protected readonly cardDescription = computed(() => {
    const mode = this.mode();
    const keyMap: Record<SubscriptionPlanActionModalMode, string> = {
      'renew': 'subscription.planAction.renew.cardDescription',
      'cancel': 'subscription.planAction.cancel.cardDescription',
      'cancel-success': 'subscription.planAction.cancelSuccess.cardDescription',
      'keep': 'subscription.planAction.keep.cardDescription',
    };
    const dateLabel = mode === 'renew' ? this.renewedPeriodEndLabel() : this.currentPeriodEndLabel();
    return this.translate.instant(keyMap[mode], { date: dateLabel });
  });

  protected readonly primaryLabel = computed(() => {
    switch (this.mode()) {
      case 'renew':
      case 'cancel-success':
        return 'subscription.planAction.understood';
      case 'cancel':
        return 'subscription.planAction.confirmCancellation';
      case 'keep':
        return 'subscription.planAction.keepPlan';
    }
  });

  private readonly currentPeriodEndLabel = computed(() =>
    this.formatDate(this.currentPlan().currentPeriodEndDate),
  );

  private readonly renewedPeriodEndLabel = computed(() =>
    this.formatDate(this.renewedPeriodEndDate()),
  );

  private readonly renewedPeriodEndDate = computed(() => {
    const currentPeriodEndDate = this.toLocalDate(this.currentPlan().currentPeriodEndDate);

    if (currentPeriodEndDate === null) {
      return null;
    }

    return this.billingCycle() === 'annual'
      ? this.addYearsPreservingMonthEnd(currentPeriodEndDate, 1)
      : this.addMonthsPreservingMonthEnd(currentPeriodEndDate, 1);
  });

  protected close(): void {
    this.closed.emit();
  }

  protected closeFromKeyboard(event: Event): void {
    event.preventDefault();
    this.close();
  }

  protected confirmPrimaryAction(): void {
    switch (this.mode()) {
      case 'cancel':
        this.cancellationConfirmed.emit();
        return;
      case 'keep':
        this.keepPlanConfirmed.emit();
        return;
      case 'renew':
      case 'cancel-success':
        this.close();
        return;
    }
  }

  private formatDate(date: Date | string | null | undefined): string {
    const parsedDate = typeof date === 'string' ? this.toLocalDate(date) : date;

    if (parsedDate === null || parsedDate === undefined) {
      return this.translate.instant('subscription.activity.billing.detail.unknownDate');
    }

    const locale = this.translate.currentLang === 'en' ? 'en-US' : 'es-PE';
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(parsedDate);
  }

  private toLocalDate(dateValue: string | undefined): Date | null {
    if (!dateValue) return null;
    const [year, month, day] = dateValue.split('-').map((value) => Number(value));

    if (!year || !month || !day) {
      return null;
    }

    return new Date(year, month - 1, day);
  }

  private addYearsPreservingMonthEnd(date: Date, years: number): Date {
    return this.addMonthsPreservingMonthEnd(date, years * 12);
  }

  private addMonthsPreservingMonthEnd(date: Date, months: number): Date {
    const targetMonthStart = new Date(date.getFullYear(), date.getMonth() + months, 1);
    const originalMonthLastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const targetMonthLastDay = new Date(
      targetMonthStart.getFullYear(),
      targetMonthStart.getMonth() + 1,
      0,
    ).getDate();
    const targetDay =
      date.getDate() === originalMonthLastDay
        ? targetMonthLastDay
        : Math.min(date.getDate(), targetMonthLastDay);

    return new Date(targetMonthStart.getFullYear(), targetMonthStart.getMonth(), targetDay);
  }
}

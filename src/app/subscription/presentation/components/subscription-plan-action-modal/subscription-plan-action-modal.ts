import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { BillingCycle, SubscriptionPlan } from '../../../domain/model/subscription-plan.entity';

export type SubscriptionPlanActionModalMode =
  | 'renew'
  | 'cancel'
  | 'cancel-success'
  | 'keep';

@Component({
  selector: 'app-subscription-plan-action-modal',
  imports: [CdkTrapFocus],
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

  protected readonly title = computed(() => {
    switch (this.mode()) {
      case 'renew':
        return 'Renovar suscripción';
      case 'cancel':
        return 'Solicitar cancelación';
      case 'cancel-success':
        return 'Cancelación programada';
      case 'keep':
        return 'Mantener Plan Control';
    }
  });

  protected readonly cardTitle = computed(() => {
    switch (this.mode()) {
      case 'renew':
        return 'Renovación preparada';
      case 'cancel':
        return 'Confirma la cancelación';
      case 'cancel-success':
        return 'Cancelación programada';
      case 'keep':
        return 'Mantener renovación activa';
    }
  });

  protected readonly cardDescription = computed(() => {
    switch (this.mode()) {
      case 'renew':
        return `La nueva vigencia se extenderá hasta el ${this.renewedPeriodEndLabel()}.`;
      case 'cancel':
        return `Tu acceso al Plan Control se mantendrá hasta el ${this.currentPeriodEndLabel()}. No se realizará el siguiente cobro.`;
      case 'cancel-success':
        return `La solicitud fue registrada. Tu acceso premium continúa hasta el ${this.currentPeriodEndLabel()}.`;
      case 'keep':
        return `Se cancelará la solicitud de baja y el plan seguirá renovándose al finalizar la vigencia actual: ${this.currentPeriodEndLabel()}.`;
    }
  });

  protected readonly primaryLabel = computed(() => {
    switch (this.mode()) {
      case 'renew':
      case 'cancel-success':
        return 'Entendido';
      case 'cancel':
        return 'Confirmar cancelación';
      case 'keep':
        return 'Mantener Plan Control';
    }
  });

  private readonly dateFormatter = new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
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

  private formatDate(date: Date | string | null): string {
    const parsedDate = typeof date === 'string' ? this.toLocalDate(date) : date;

    if (parsedDate === null) {
      return 'la fecha registrada en tu suscripción';
    }

    return this.dateFormatter.format(parsedDate);
  }

  private toLocalDate(dateValue: string): Date | null {
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

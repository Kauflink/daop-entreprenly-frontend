import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { BillingSetup } from '../../../domain/model/billing-setup.entity';
import { SubscriptionActivity } from '../../../domain/model/subscription-activity.entity';

@Component({
  selector: 'app-subscription-history-modal',
  imports: [CdkTrapFocus],
  templateUrl: './subscription-history-modal.html',
  styleUrl: './subscription-history-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closeFromKeyboard($event)',
  },
})
export class SubscriptionHistoryModal {
  readonly activity = input.required<SubscriptionActivity[]>();
  readonly billingSetup = input.required<BillingSetup>();
  readonly downloaded = input(false);

  readonly closed = output<void>();
  readonly historyDownloadRequested = output<void>();

  protected readonly activityRows = computed(() => [
    ...this.activity(),
    new SubscriptionActivity({
      id: 'payment-method',
      title: 'Método de pago',
      detail: this.paymentMethodDetail(),
    }),
    new SubscriptionActivity({
      id: 'fiscal-data',
      title: 'Datos fiscales',
      detail: this.fiscalDataDetail(),
    }),
  ]);

  protected close(): void {
    this.closed.emit();
  }

  protected closeFromKeyboard(event: Event): void {
    event.preventDefault();
    this.close();
  }

  protected requestHistoryDownload(): void {
    this.historyDownloadRequested.emit();
  }

  private paymentMethodDetail(): string {
    const paymentMethod =
      this.billingSetup().paymentMethods.find((method) => method.isDefault) ??
      this.billingSetup().paymentMethods.at(-1);

    if (!paymentMethod) {
      return 'Sin método de pago registrado.';
    }

    return `${paymentMethod.cardBrand} terminada en ${paymentMethod.lastFour} registrada para pagos y renovaciones`;
  }

  private fiscalDataDetail(): string {
    const fiscalData = this.billingSetup().fiscalData;

    if (fiscalData === null) {
      return 'Datos fiscales pendientes de completar.';
    }

    return `${fiscalData.documentType} ${fiscalData.documentNumber} - ${fiscalData.businessName}`;
  }
}

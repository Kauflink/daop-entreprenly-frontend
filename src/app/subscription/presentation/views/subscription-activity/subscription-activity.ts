import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { BillingSetup as BillingSetupEntity } from '../../../domain/model/billing-setup.entity';
import { SubscriptionActivity as SubscriptionActivityEntity } from '../../../domain/model/subscription-activity.entity';

@Component({
  selector: 'app-subscription-activity',
  imports: [MatIconModule, TranslatePipe],
  templateUrl: './subscription-activity.html',
  styleUrl: './subscription-activity.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionActivity {
  readonly activity = input.required<SubscriptionActivityEntity[]>();
  readonly billingSetup = input.required<BillingSetupEntity>();

  readonly historyDownloadRequested = output<void>();

  protected readonly activityRows = computed(() => [
    ...this.activity(),
    new SubscriptionActivityEntity({
      id: 'payment-method',
      title: 'Método de pago',
      detail: this.paymentMethodDetail(),
    }),
    new SubscriptionActivityEntity({
      id: 'fiscal-data',
      title: 'Datos fiscales',
      detail: this.fiscalDataDetail(),
    }),
  ]);

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

import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
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

  readonly historyDownloadRequested = output<void>();

  private readonly translate = inject(TranslateService);

  protected readonly activityRows = computed(() => [
    ...this.activity(),
    new SubscriptionActivityEntity({
      id: 'payment-method',
      title: 'subscription.history.paymentMethod.title',
      detail: this.paymentMethodDetail(),
    }),
    new SubscriptionActivityEntity({
      id: 'fiscal-data',
      title: 'subscription.history.fiscalData.title',
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
      return this.translate.instant('subscription.history.paymentMethod.empty');
    }

    return this.translate.instant('subscription.history.paymentMethod.detail', {
      brand: paymentMethod.cardBrand,
      lastFour: paymentMethod.lastFour,
    });
  }

  private fiscalDataDetail(): string {
    const fiscalData = this.billingSetup().fiscalData;

    if (fiscalData === null) {
      return this.translate.instant('subscription.history.fiscalData.empty');
    }

    return this.translate.instant('subscription.history.fiscalData.detail', {
      documentType: fiscalData.documentType,
      documentNumber: fiscalData.documentNumber,
      businessName: fiscalData.businessName,
    });
  }
}

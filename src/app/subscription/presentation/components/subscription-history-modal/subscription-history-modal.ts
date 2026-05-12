import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BillingSetup } from '../../../domain/model/billing-setup.entity';
import { SubscriptionActivity } from '../../../domain/model/subscription-activity.entity';

@Component({
  selector: 'app-subscription-history-modal',
  imports: [CdkTrapFocus, TranslatePipe],
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

  private readonly translate = inject(TranslateService);

  protected readonly activityRows = computed(() => [
    ...this.activity(),
    new SubscriptionActivity({
      id: 'payment-method',
      title: 'subscription.history.paymentMethod.title',
      detail: this.paymentMethodDetail(),
    }),
    new SubscriptionActivity({
      id: 'fiscal-data',
      title: 'subscription.history.fiscalData.title',
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

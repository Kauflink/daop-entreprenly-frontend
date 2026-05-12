import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BillingSetup as BillingSetupEntity } from '../../../domain/model/billing-setup.entity';

@Component({
  selector: 'app-billing-setup',
  imports: [MatIconModule, TranslatePipe],
  templateUrl: './billing-setup.html',
  styleUrl: './billing-setup.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingSetup {
  readonly billingSetup = input.required<BillingSetupEntity>();

  readonly paymentMethodRequested = output<void>();
  readonly fiscalDataRequested = output<void>();

  private readonly translate = inject(TranslateService);

  protected readonly primaryPaymentMethod = computed(
    () =>
      this.billingSetup().paymentMethods.find((paymentMethod) => paymentMethod.isDefault) ??
      this.billingSetup().paymentMethods.at(-1) ??
      null,
  );
  protected readonly fiscalData = computed(() => this.billingSetup().fiscalData);

  protected readonly hasPaymentMethod = computed(() => this.primaryPaymentMethod() !== null);
  protected readonly hasFiscalData = computed(() => this.fiscalData() !== null);
  protected readonly paymentActionLabelKey = computed(
    () => 'subscription.billing.paymentMethod.addAction',
  );
  protected readonly fiscalActionLabelKey = computed(() =>
    this.hasFiscalData()
      ? 'subscription.billing.fiscalData.editAction'
      : 'subscription.billing.fiscalData.addAction',
  );
  protected readonly extraPaymentMethodCount = computed(() =>
    Math.max(this.billingSetup().paymentMethods.length - 1, 0),
  );
  protected readonly extraPaymentMethodLabelKey = computed(() =>
    this.extraPaymentMethodCount() === 1
      ? 'subscription.billing.paymentMethod.additionalMethod'
      : 'subscription.billing.paymentMethod.additionalMethods',
  );

  protected requestPaymentMethod(): void {
    this.paymentMethodRequested.emit();
  }

  protected requestFiscalData(): void {
    this.fiscalDataRequested.emit();
  }

  protected cardBrandLabel(cardBrand: string): string {
    const normalizedBrand = cardBrand.trim().toLowerCase();

    return ['tarjeta', 'card'].includes(normalizedBrand)
      ? this.translate.instant('subscription.cardBrand.generic')
      : cardBrand;
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CurrencyService } from '../../../../shared/infrastructure/currency-service';
import { BillingSetup as BillingSetupEntity } from '../../../domain/model/billing-setup.entity';
import { SubscriptionActivity as SubscriptionActivityEntity } from '../../../domain/model/subscription-activity.entity';
import { BillingCycle, SubscriptionPlan } from '../../../domain/model/subscription-plan.entity';

interface ActivityRow {
  id: string;
  title?: string;
  detail?: string;
  titleKey?: string;
  detailKey?: string;
  detailParams?: Record<string, string>;
}

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
  readonly currentPlan = input.required<SubscriptionPlan>();
  readonly billingCycle = input.required<BillingCycle>();

  readonly historyDownloadRequested = output<void>();

  private readonly translate = inject(TranslateService);
  private readonly currencyAssembler = inject(CurrencyService);

  protected readonly activityRows = computed<ActivityRow[]>(() => [
    ...this.activity().map((item) => this.toActivityRow(item)),
    {
      id: 'payment-method',
      titleKey: 'subscription.history.paymentMethod.title',
      detailKey: this.paymentMethodDetailKey(),
      detailParams: this.paymentMethodDetailParams(),
    },
    {
      id: 'fiscal-data',
      titleKey: 'subscription.history.fiscalData.title',
      detailKey: this.fiscalDataDetailKey(),
      detailParams: this.fiscalDataDetailParams(),
    },
  ]);

  protected requestHistoryDownload(): void {
    this.historyDownloadRequested.emit();
  }

  private toActivityRow(item: SubscriptionActivityEntity): ActivityRow {
    if (item.id === 'created-account') {
      return {
        id: item.id,
        titleKey: 'subscription.activity.created-account.title',
        detailKey: 'subscription.activity.created-account.detail',
      };
    }

    if (item.id === 'current-status') {
      return {
        id: item.id,
        titleKey: 'subscription.activity.current-status.title',
        detailKey: `subscription.activity.current-status.detail.${this.currentPlan().status}`,
        detailParams: this.currentStatusDetailParams(),
      };
    }

    if (item.id === 'billing') {
      return this.toBillingActivityRow(item);
    }

    return item;
  }

  private toBillingActivityRow(item: SubscriptionActivityEntity): ActivityRow {
    if (this.currentPlan().status === 'free') {
      return {
        id: item.id,
        titleKey: 'subscription.activity.billing.title',
        detailKey: 'subscription.activity.billing.detail.free',
      };
    }

    const cancellationScheduled = this.currentPlan().status === 'scheduled-cancellation';

    return {
      id: item.id,
      titleKey: 'subscription.activity.billing.title',
      detailKey: cancellationScheduled
        ? 'subscription.activity.billing.detail.accessUntil'
        : 'subscription.activity.billing.detail.renewalWithDate',
      detailParams: {
        date: this.formatPlanDate(this.currentPlan().currentPeriodEndDate),
        cycle: this.billingCycleLabel(),
      },
    };
  }

  private paymentMethodDetailKey(): string {
    return this.selectedPaymentMethod()
      ? 'subscription.history.paymentMethod.detail'
      : 'subscription.history.paymentMethod.empty';
  }

  private paymentMethodDetailParams(): Record<string, string> {
    const paymentMethod = this.selectedPaymentMethod();

    if (!paymentMethod) {
      return {};
    }

    return {
      brand: this.cardBrandLabel(paymentMethod.cardBrand),
      lastFour: paymentMethod.lastFour,
    };
  }

  private fiscalDataDetailKey(): string {
    return this.billingSetup().fiscalData
      ? 'subscription.history.fiscalData.detail'
      : 'subscription.history.fiscalData.empty';
  }

  private fiscalDataDetailParams(): Record<string, string> {
    const fiscalData = this.billingSetup().fiscalData;

    if (fiscalData === null) {
      return {};
    }

    return {
      documentType: fiscalData.documentType,
      documentNumber: fiscalData.documentNumber,
      businessName: fiscalData.businessName,
    };
  }

  private selectedPaymentMethod() {
    return (
      this.billingSetup().paymentMethods.find((method) => method.isDefault) ??
      this.billingSetup().paymentMethods.at(-1)
    );
  }

  private cardBrandLabel(cardBrand: string): string {
    const normalizedBrand = cardBrand.trim().toLowerCase();

    return ['tarjeta', 'card'].includes(normalizedBrand)
      ? this.translate.instant('subscription.cardBrand.generic')
      : cardBrand;
  }

  private currentStatusDetailParams(): Record<string, string> {
    return {
      price: this.currencyAssembler.format(this.currentPlan().monthlyPrice),
    };
  }

  private billingCycleLabel(): string {
    const key =
      this.billingCycle() === 'annual'
        ? 'subscription.overview.priceLabel.annual'
        : 'subscription.overview.priceLabel.monthly';

    return this.translate.instant(key);
  }

  private formatPlanDate(dateValue: string): string {
    const date = this.toLocalDate(dateValue);

    if (date === null) {
      return this.translate.instant('subscription.planAction.fallbackDate');
    }

    return new Intl.DateTimeFormat(this.currentDateLocale(), {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  private currentDateLocale(): string {
    return (this.translate.currentLang ?? this.translate.defaultLang ?? 'en').startsWith('es')
      ? 'es-PE'
      : 'en-US';
  }

  private toLocalDate(dateValue: string): Date | null {
    const [year, month, day] = dateValue.split('-').map((value) => Number(value));

    if (!year || !month || !day) {
      return null;
    }

    return new Date(year, month - 1, day);
  }
}

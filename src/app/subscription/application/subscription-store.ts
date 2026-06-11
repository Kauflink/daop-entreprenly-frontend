import { Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InventoryStoreService } from '../../inventory/application/inventory-store.service';
import { CurrencyService } from '../../shared/infrastructure/currency-service';
import {
  BillingFiscalData,
  BillingPaymentMethod,
  BillingPaymentMethodInput,
  BillingSetup,
  detectCardBrand,
} from '../domain/model/billing-setup.entity';
import { SubscriptionActivity } from '../domain/model/subscription-activity.entity';
import { SubscriptionDashboard } from '../domain/model/subscription-dashboard.entity';
import { SubscriptionLimit } from '../domain/model/subscription-limit.entity';
import { BillingCycle } from '../domain/model/subscription-plan.entity';
import { SubscriptionApi } from '../infrastructure/subscription-api';

interface SubscriptionInventoryUsageSnapshot {
  productCount: number;
  lotCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class SubscriptionStore {
  private readonly subscriptionApi = inject(SubscriptionApi);
  private readonly inventoryStore = inject(InventoryStoreService);
  private readonly currencyAssembler = inject(CurrencyService);
  private readonly translate = inject(TranslateService);
  private readonly dashboardSignal: WritableSignal<SubscriptionDashboard> = signal(
    new SubscriptionDashboard(),
  );
  private readonly loadedSignal = signal(false);
  private readonly loadingSignal = signal(false);
  private readonly selectedCycleSignal: WritableSignal<BillingCycle> = signal('monthly');
  private readonly selectedPlanIdSignal: WritableSignal<string | null> = signal(null);
  private readonly feedbackSignal = signal('');
  private readonly inventoryUsageObserver = computed<SubscriptionInventoryUsageSnapshot>(() => ({
    productCount: this.inventoryStore.unitProductCount() + this.inventoryStore.weightProductCount(),
    lotCount: this.inventoryStore.unitLotCount() + this.inventoryStore.weightLotCount(),
  }));

  readonly dashboard: Signal<SubscriptionDashboard> = computed(() =>
    this.withInventoryUsage(this.dashboardSignal(), this.inventoryUsageObserver()),
  );
  readonly loading: Signal<boolean> = computed(() => this.loadingSignal());
  readonly selectedCycle: Signal<BillingCycle> = computed(() => this.selectedCycleSignal());
  readonly selectedPlanId: Signal<string | null> = computed(() => this.selectedPlanIdSignal());
  readonly feedback: Signal<string> = computed(() => this.feedbackSignal());
  readonly controlPlanSelected: Signal<boolean> = computed(
    () => this.selectedPlanIdSignal() === this.dashboardSignal().recommendedPlan.id,
  );

  loadDashboard(): void {
    if (this.loadedSignal()) {
      return;
    }

    this.loadingSignal.set(true);
    this.subscriptionApi.getSubscriptionDashboard().subscribe((dashboard) => {
      this.dashboardSignal.set(dashboard);
      this.selectedCycleSignal.set('monthly');
      this.loadedSignal.set(true);
      this.loadingSignal.set(false);
    });
  }

  selectBillingCycle(cycle: BillingCycle): void {
    this.selectedCycleSignal.set(cycle);
  }

  selectControlPlan(): void {
    const plan = this.dashboardSignal().recommendedPlan;
    this.selectedPlanIdSignal.set(plan.id);
    this.feedbackSignal.set('subscription.store.feedback.planSelected');
  }

  activateControlPlan(): void {
    this.subscriptionApi
      .activateControlPlan(this.selectedCycleSignal(), this.dashboard())
      .subscribe((dashboard) => {
        this.dashboardSignal.set(dashboard);
        this.selectedPlanIdSignal.set(null);
        this.feedbackSignal.set('subscription.store.feedback.activated');
      });
  }

  scheduleCancellation(): void {
    this.subscriptionApi.scheduleCancellation(this.dashboard()).subscribe((dashboard) => {
      this.dashboardSignal.set(dashboard);
      this.feedbackSignal.set('subscription.store.feedback.cancelled');
    });
  }

  keepControlPlan(): void {
    this.subscriptionApi.keepControlPlan(this.dashboard()).subscribe((dashboard) => {
      this.dashboardSignal.set(dashboard);
      this.feedbackSignal.set('subscription.store.feedback.kept');
    });
  }

  addPaymentMethod(paymentMethodInput: BillingPaymentMethodInput): void {
    const dashboard = this.dashboard();
    const currentPaymentMethods = dashboard.billingSetup.paymentMethods;
    const paymentMethod = this.toPaymentMethod(paymentMethodInput, currentPaymentMethods);
    const billingSetup = new BillingSetup({
      ...dashboard.billingSetup,
      hasPaymentMethod: true,
      paymentMethodDescription: this.toPaymentMethodDescription(paymentMethod),
      paymentMethodActionLabel: this.translate.instant(
        'subscription.store.paymentMethodActionLabel',
      ),
      paymentMethods: [
        ...currentPaymentMethods.map((method) => ({ ...method, isDefault: false })),
        paymentMethod,
      ],
    });

    this.saveBillingSetup(billingSetup, 'subscription.store.feedback.paymentAdded');
  }

  selectPaymentMethod(paymentMethodId: string): void {
    const dashboard = this.dashboard();
    const selectedPaymentMethod = dashboard.billingSetup.paymentMethods.find(
      (paymentMethod) => paymentMethod.id === paymentMethodId,
    );

    if (!selectedPaymentMethod) {
      return;
    }

    const billingSetup = new BillingSetup({
      ...dashboard.billingSetup,
      hasPaymentMethod: true,
      paymentMethodDescription: this.toPaymentMethodDescription(selectedPaymentMethod),
      paymentMethods: dashboard.billingSetup.paymentMethods.map((paymentMethod) => ({
        ...paymentMethod,
        isDefault: paymentMethod.id === paymentMethodId,
      })),
    });

    this.saveBillingSetup(billingSetup, 'subscription.store.feedback.paymentSelected');
  }

  completeFiscalData(fiscalData: BillingFiscalData): void {
    const dashboard = this.dashboard();
    const billingSetup = new BillingSetup({
      ...dashboard.billingSetup,
      hasFiscalData: true,
      fiscalDataDescription: this.translate.instant('subscription.store.fiscalDataDescription', {
        documentType: fiscalData.documentType,
        documentNumber: fiscalData.documentNumber,
        businessName: fiscalData.businessName,
      }),
      fiscalDataActionLabel: this.translate.instant('subscription.store.fiscalDataActionLabel'),
      fiscalData,
    });

    this.saveBillingSetup(billingSetup, 'subscription.store.feedback.fiscalCompleted');
  }

  downloadActivityHistory(): void {
    const activity = this.subscriptionActivityRows();

    if (activity.length === 0) {
      this.feedbackSignal.set('subscription.store.feedback.emptyHistory');
      return;
    }

    const csvContent = `﻿${this.toSubscriptionActivityCsv(activity)}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = this.translate.instant('subscription.store.csv.filename');
    anchor.click();
    URL.revokeObjectURL(url);
    this.feedbackSignal.set('subscription.store.feedback.historyDownloaded');
  }

  private toSubscriptionActivityCsv(activity: SubscriptionActivity[]): string {
    const rows = activity.map((item) =>
      [item.title, item.detail].map((value) => this.toCsvValue(value)).join(','),
    );

    return ['sep=,', this.translate.instant('subscription.store.csv.header'), ...rows].join('\r\n');
  }

  private toCsvValue(value: string): string {
    return `"${value.replaceAll('"', '""')}"`;
  }

  private subscriptionActivityRows(): SubscriptionActivity[] {
    const dashboard = this.dashboard();

    return [
      ...dashboard.activity.map((item) => this.toTranslatedActivity(item, dashboard)),
      new SubscriptionActivity({
        id: 'payment-method',
        title: this.translate.instant('subscription.history.paymentMethod.title'),
        detail: this.paymentMethodActivityDetail(dashboard.billingSetup),
      }),
      new SubscriptionActivity({
        id: 'fiscal-data',
        title: this.translate.instant('subscription.history.fiscalData.title'),
        detail: this.fiscalDataActivityDetail(dashboard.billingSetup),
      }),
    ];
  }

  private toTranslatedActivity(
    activity: SubscriptionActivity,
    dashboard: SubscriptionDashboard,
  ): SubscriptionActivity {
    if (activity.id === 'created-account') {
      return new SubscriptionActivity({
        id: activity.id,
        title: this.translate.instant('subscription.activity.created-account.title'),
        detail: this.translate.instant('subscription.activity.created-account.detail'),
      });
    }

    if (activity.id === 'current-status') {
      return new SubscriptionActivity({
        id: activity.id,
        title: this.translate.instant('subscription.activity.current-status.title'),
        detail: this.currentStatusActivityDetail(dashboard),
      });
    }

    if (activity.id === 'billing') {
      return new SubscriptionActivity({
        id: activity.id,
        title: this.translate.instant('subscription.activity.billing.title'),
        detail: this.billingActivityDetail(dashboard),
      });
    }

    return activity;
  }

  private currentStatusActivityDetail(dashboard: SubscriptionDashboard): string {
    const status = dashboard.currentPlan.status;

    if (status === 'free') {
      return this.translate.instant('subscription.activity.current-status.detail.free');
    }

    const price = this.currencyAssembler.format(dashboard.currentPlan.monthlyPrice);

    return this.translate.instant(`subscription.activity.current-status.detail.${status}`, {
      price,
    });
  }

  private billingActivityDetail(dashboard: SubscriptionDashboard): string {
    const currentPlan = dashboard.currentPlan;

    if (currentPlan.status === 'free') {
      return this.translate.instant('subscription.activity.billing.detail.free');
    }

    const date = this.formatPlanDate(currentPlan.currentPeriodEndDate);

    if (currentPlan.status === 'scheduled-cancellation') {
      return this.translate.instant('subscription.activity.billing.detail.accessUntil', { date });
    }

    return this.translate.instant('subscription.activity.billing.detail.renewalWithDate', {
      date,
      cycle: this.billingCycleLabel(dashboard.defaultBillingCycle),
    });
  }

  private paymentMethodActivityDetail(billingSetup: BillingSetup): string {
    const paymentMethod =
      billingSetup.paymentMethods.find((method) => method.isDefault) ??
      billingSetup.paymentMethods.at(-1);

    if (!paymentMethod) {
      return this.translate.instant('subscription.history.paymentMethod.empty');
    }

    return this.translate.instant('subscription.history.paymentMethod.detail', {
      brand: this.cardBrandLabel(paymentMethod.cardBrand),
      lastFour: paymentMethod.lastFour,
    });
  }

  private fiscalDataActivityDetail(billingSetup: BillingSetup): string {
    const fiscalData = billingSetup.fiscalData;

    if (fiscalData === null) {
      return this.translate.instant('subscription.history.fiscalData.empty');
    }

    return this.translate.instant('subscription.history.fiscalData.detail', {
      documentType: fiscalData.documentType,
      documentNumber: fiscalData.documentNumber,
      businessName: fiscalData.businessName,
    });
  }

  private withInventoryUsage(
    dashboard: SubscriptionDashboard,
    inventoryUsage: SubscriptionInventoryUsageSnapshot,
  ): SubscriptionDashboard {
    return new SubscriptionDashboard({
      ...dashboard,
      limits: dashboard.limits.map((limit) => this.withCurrentLimitUsage(limit, inventoryUsage)),
    });
  }

  private withCurrentLimitUsage(
    limit: SubscriptionLimit,
    inventoryUsage: SubscriptionInventoryUsageSnapshot,
  ): SubscriptionLimit {
    if (limit.id === 'products') {
      return new SubscriptionLimit({
        ...limit,
        usedValue: inventoryUsage.productCount,
      });
    }

    if (limit.id === 'active-batches') {
      return new SubscriptionLimit({
        ...limit,
        usedValue: inventoryUsage.lotCount,
      });
    }

    return limit;
  }

  private saveBillingSetup(billingSetup: BillingSetup, feedback: string): void {
    const nextDashboard = new SubscriptionDashboard({
      ...this.dashboard(),
      billingSetup,
    });

    this.dashboardSignal.set(nextDashboard);
    this.subscriptionApi
      .updateBillingSetup(nextDashboard, billingSetup)
      .subscribe((dashboard) => {
        this.dashboardSignal.set(dashboard);
        this.feedbackSignal.set(feedback);
      });
  }

  private toPaymentMethod(
    paymentMethodInput: BillingPaymentMethodInput,
    currentPaymentMethods: BillingPaymentMethod[],
  ): BillingPaymentMethod {
    const sanitizedCardNumber = paymentMethodInput.cardNumber.replace(/\D/g, '');

    return {
      id: this.nextPaymentMethodId(currentPaymentMethods),
      cardBrand: detectCardBrand(sanitizedCardNumber).label,
      lastFour: sanitizedCardNumber.slice(-4),
      holderName: paymentMethodInput.holderName.trim(),
      expiryMonth: paymentMethodInput.expiryMonth.padStart(2, '0'),
      expiryYear: paymentMethodInput.expiryYear.slice(-2),
      isDefault: true,
    };
  }

  private nextPaymentMethodId(paymentMethods: BillingPaymentMethod[]): string {
    return `payment-method-${paymentMethods.length + 1}`;
  }

  private toPaymentMethodDescription(paymentMethod: BillingPaymentMethod): string {
    return this.translate.instant('subscription.store.paymentMethodDescription', {
      brand: this.cardBrandLabel(paymentMethod.cardBrand),
      lastFour: paymentMethod.lastFour,
      month: paymentMethod.expiryMonth,
      year: paymentMethod.expiryYear,
    });
  }

  private billingCycleLabel(billingCycle: BillingCycle): string {
    return this.translate.instant(
      billingCycle === 'annual'
        ? 'subscription.overview.priceLabel.annual'
        : 'subscription.overview.priceLabel.monthly',
    );
  }

  private cardBrandLabel(cardBrand: string): string {
    const normalizedBrand = cardBrand.trim().toLowerCase();

    return ['tarjeta', 'card'].includes(normalizedBrand)
      ? this.translate.instant('subscription.cardBrand.generic')
      : cardBrand;
  }

  private formatPlanDate(dateValue: string | undefined): string {
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

  private toLocalDate(dateValue: string | undefined): Date | null {
    if (dateValue === undefined) {
      return null;
    }

    const [year, month, day] = dateValue.split('-').map((value) => Number(value));

    if (!year || !month || !day) {
      return null;
    }

    return new Date(year, month - 1, day);
  }
}

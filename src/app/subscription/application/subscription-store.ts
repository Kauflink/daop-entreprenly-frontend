import { Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
<<<<<<< Updated upstream
import { BillingSetup } from '../domain/model/billing-setup.entity';
=======
import { TranslateService } from '@ngx-translate/core';
import { InventoryStoreService } from '../../inventory/application/inventory-store.service';
import {
  BillingFiscalData,
  BillingPaymentMethod,
  BillingPaymentMethodInput,
  BillingSetup,
  detectCardBrand,
} from '../domain/model/billing-setup.entity';
>>>>>>> Stashed changes
import { SubscriptionActivity } from '../domain/model/subscription-activity.entity';
import { SubscriptionDashboard } from '../domain/model/subscription-dashboard.entity';
import { BillingCycle } from '../domain/model/subscription-plan.entity';
import { SubscriptionApi } from '../infrastructure/subscription-api';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionStore {
  private readonly subscriptionApi = inject(SubscriptionApi);
<<<<<<< Updated upstream
=======
  private readonly translate = inject(TranslateService);
  private readonly inventoryStore = inject(InventoryStoreService);
>>>>>>> Stashed changes
  private readonly dashboardSignal: WritableSignal<SubscriptionDashboard> = signal(
    new SubscriptionDashboard(),
  );
  private readonly loadedSignal = signal(false);
  private readonly loadingSignal = signal(false);
  private readonly selectedCycleSignal: WritableSignal<BillingCycle> = signal('monthly');
  private readonly selectedPlanIdSignal: WritableSignal<string | null> = signal(null);
  private readonly feedbackSignal = signal('');

  readonly dashboard: Signal<SubscriptionDashboard> = computed(() => this.dashboardSignal());
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
<<<<<<< Updated upstream
    this.subscriptionApi.activateControlPlan().subscribe((dashboard) => {
      this.dashboardSignal.set(dashboard);
      this.selectedPlanIdSignal.set(null);
      this.feedbackSignal.set('SuscripciÃ³n actualizada a Plan Control.');
    });
  }

  addPaymentMethod(): void {
=======
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
>>>>>>> Stashed changes
    const billingSetup = new BillingSetup({
      ...this.dashboardSignal().billingSetup,
      hasPaymentMethod: true,
<<<<<<< Updated upstream
      paymentMethodDescription: 'Método de pago preparado para futuros cobros.',
      paymentMethodActionLabel: 'Editar método de pago',
    });

    this.dashboardSignal.update(
      (dashboard) =>
        new SubscriptionDashboard({
          ...dashboard,
          billingSetup,
        }),
    );
    this.feedbackSignal.set('Método de pago registrado para la suscripción.');
=======
      paymentMethodDescription: this.toPaymentMethodDescription(paymentMethod),
      paymentMethodActionLabel: 'subscription.store.paymentMethodActionLabel',
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
>>>>>>> Stashed changes
  }

  completeFiscalData(): void {
    const billingSetup = new BillingSetup({
      ...this.dashboardSignal().billingSetup,
      hasFiscalData: true,
<<<<<<< Updated upstream
      fiscalDataDescription: 'Datos fiscales listos para emitir comprobantes.',
      fiscalDataActionLabel: 'Editar datos fiscales',
    });

    this.dashboardSignal.update(
      (dashboard) =>
        new SubscriptionDashboard({
          ...dashboard,
          billingSetup,
        }),
    );
    this.feedbackSignal.set('Datos fiscales completados para facturación.');
=======
      fiscalDataDescription: this.translate.instant('subscription.store.fiscalDataDescription', {
        documentType: fiscalData.documentType,
        documentNumber: fiscalData.documentNumber,
        businessName: fiscalData.businessName,
      }),
      fiscalDataActionLabel: 'subscription.store.fiscalDataActionLabel',
      fiscalData,
    });

    this.saveBillingSetup(billingSetup, 'subscription.store.feedback.fiscalCompleted');
>>>>>>> Stashed changes
  }

  downloadActivityHistory(): void {
    const activity = this.dashboardSignal().activity;

    if (activity.length === 0) {
      this.feedbackSignal.set('subscription.store.feedback.emptyHistory');
      return;
    }

    const csvContent = this.toSubscriptionActivityCsv(activity);
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

<<<<<<< Updated upstream
    return ['Evento,Detalle', ...rows].join('\n');
=======
    return ['sep=,', this.translate.instant('subscription.store.csv.header'), ...rows].join('\r\n');
>>>>>>> Stashed changes
  }

  private toCsvValue(value: string): string {
    return `"${value.replaceAll('"', '""')}"`;
  }
<<<<<<< Updated upstream
=======

  private subscriptionActivityRows(): SubscriptionActivity[] {
    const dashboard = this.dashboard();

    return [
      ...dashboard.activity,
      new SubscriptionActivity({
        id: 'payment-method',
        title: 'subscription.history.paymentMethod.title',
        detail: this.paymentMethodActivityDetail(dashboard.billingSetup),
      }),
      new SubscriptionActivity({
        id: 'fiscal-data',
        title: 'subscription.history.fiscalData.title',
        detail: this.fiscalDataActivityDetail(dashboard.billingSetup),
      }),
    ];
  }

  private paymentMethodActivityDetail(billingSetup: BillingSetup): string {
    const paymentMethod =
      billingSetup.paymentMethods.find((method) => method.isDefault) ??
      billingSetup.paymentMethods.at(-1);

    if (!paymentMethod) {
      return this.translate.instant('subscription.history.paymentMethod.empty');
    }

    return this.translate.instant('subscription.history.paymentMethod.detail', {
      brand: paymentMethod.cardBrand,
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

  private withInventoryUsage(dashboard: SubscriptionDashboard): SubscriptionDashboard {
    return new SubscriptionDashboard({
      ...dashboard,
      limits: dashboard.limits.map((limit) => this.withCurrentLimitUsage(limit)),
    });
  }

  private withCurrentLimitUsage(limit: SubscriptionLimit): SubscriptionLimit {
    if (limit.id === 'products') {
      return new SubscriptionLimit({
        ...limit,
        usedValue: this.inventoryProductCount(),
      });
    }

    if (limit.id === 'active-batches') {
      return new SubscriptionLimit({
        ...limit,
        usedValue: this.inventoryLotCount(),
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
      brand: paymentMethod.cardBrand,
      lastFour: paymentMethod.lastFour,
      month: paymentMethod.expiryMonth,
      year: paymentMethod.expiryYear,
    });
  }
>>>>>>> Stashed changes
}

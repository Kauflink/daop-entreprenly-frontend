import { Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
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
    this.feedbackSignal.set('Plan Control seleccionado. Completa facturación para continuar.');
  }

  activateControlPlan(): void {
    this.subscriptionApi
      .activateControlPlan(this.selectedCycleSignal(), this.dashboard())
      .subscribe((dashboard) => {
        this.dashboardSignal.set(dashboard);
        this.selectedPlanIdSignal.set(null);
        this.feedbackSignal.set('Suscripción actualizada a Plan Control.');
      });
  }

  scheduleCancellation(): void {
    this.subscriptionApi.scheduleCancellation(this.dashboard()).subscribe((dashboard) => {
      this.dashboardSignal.set(dashboard);
      this.feedbackSignal.set('Cancelación programada.');
    });
  }

  keepControlPlan(): void {
    this.subscriptionApi.keepControlPlan(this.dashboard()).subscribe((dashboard) => {
      this.dashboardSignal.set(dashboard);
      this.feedbackSignal.set('Plan Control se mantendrá activo.');
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
      paymentMethodActionLabel: 'Agregar métodos de pago',
      paymentMethods: [
        ...currentPaymentMethods.map((method) => ({ ...method, isDefault: false })),
        paymentMethod,
      ],
    });

    this.saveBillingSetup(billingSetup, 'Método de pago registrado para la suscripción.');
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

    this.saveBillingSetup(billingSetup, 'Método de pago seleccionado para la suscripción.');
  }

  completeFiscalData(fiscalData: BillingFiscalData): void {
    const dashboard = this.dashboard();
    const billingSetup = new BillingSetup({
      ...dashboard.billingSetup,
      hasFiscalData: true,
      fiscalDataDescription: `${fiscalData.documentType} ${fiscalData.documentNumber} - ${fiscalData.businessName}`,
      fiscalDataActionLabel: 'Editar datos fiscales',
      fiscalData,
    });

    this.saveBillingSetup(billingSetup, 'Datos fiscales completados para facturación.');
  }

  downloadActivityHistory(): void {
    const activity = this.subscriptionActivityRows();

    if (activity.length === 0) {
      this.feedbackSignal.set('No hay actividad suficiente para descargar.');
      return;
    }

    const csvContent = `\uFEFF${this.toSubscriptionActivityCsv(activity)}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'historial-suscripcion-entreprenly.csv';
    anchor.click();
    URL.revokeObjectURL(url);
    this.feedbackSignal.set('Historial de suscripción descargado.');
  }

  private toSubscriptionActivityCsv(activity: SubscriptionActivity[]): string {
    const rows = activity.map((item) =>
      [item.title, item.detail].map((value) => this.toCsvValue(value)).join(','),
    );

    return ['sep=,', 'Evento,Detalle', ...rows].join('\r\n');
  }

  private toCsvValue(value: string): string {
    return `"${value.replaceAll('"', '""')}"`;
  }

  private subscriptionActivityRows(): SubscriptionActivity[] {
    const dashboard = this.dashboard();

    return [
      ...dashboard.activity.map((item) => this.withCurrentCurrencyActivityDetail(item, dashboard)),
      new SubscriptionActivity({
        id: 'payment-method',
        title: 'Método de pago',
        detail: this.paymentMethodActivityDetail(dashboard.billingSetup),
      }),
      new SubscriptionActivity({
        id: 'fiscal-data',
        title: 'Datos fiscales',
        detail: this.fiscalDataActivityDetail(dashboard.billingSetup),
      }),
    ];
  }

  private withCurrentCurrencyActivityDetail(
    activity: SubscriptionActivity,
    dashboard: SubscriptionDashboard,
  ): SubscriptionActivity {
    if (activity.id !== 'current-status') {
      return activity;
    }

    return new SubscriptionActivity({
      ...activity,
      detail: this.currentStatusActivityDetail(dashboard),
    });
  }

  private currentStatusActivityDetail(dashboard: SubscriptionDashboard): string {
    if (dashboard.currentPlan.status === 'free') {
      return 'Plan Free activo - Sin cargos registrados';
    }

    const price = this.currencyAssembler.format(dashboard.currentPlan.monthlyPrice);

    if (dashboard.currentPlan.status === 'scheduled-cancellation') {
      return `Cancelacion programada - ${price}/mes`;
    }

    return `Plan Control activo - ${price}/mes`;
  }

  private paymentMethodActivityDetail(billingSetup: BillingSetup): string {
    const paymentMethod =
      billingSetup.paymentMethods.find((method) => method.isDefault) ??
      billingSetup.paymentMethods.at(-1);

    if (!paymentMethod) {
      return 'Sin método de pago registrado.';
    }

    return `${paymentMethod.cardBrand} terminada en ${paymentMethod.lastFour} registrada para pagos y renovaciones`;
  }

  private fiscalDataActivityDetail(billingSetup: BillingSetup): string {
    const fiscalData = billingSetup.fiscalData;

    if (fiscalData === null) {
      return 'Datos fiscales pendientes de completar.';
    }

    return `${fiscalData.documentType} ${fiscalData.documentNumber} - ${fiscalData.businessName}`;
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
    return `${paymentMethod.cardBrand} terminada en ${paymentMethod.lastFour} - vence ${paymentMethod.expiryMonth}/${paymentMethod.expiryYear}`;
  }
}

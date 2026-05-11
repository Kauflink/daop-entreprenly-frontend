import { Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { BillingSetup } from '../domain/model/billing-setup.entity';
import { SubscriptionActivity } from '../domain/model/subscription-activity.entity';
import { SubscriptionDashboard } from '../domain/model/subscription-dashboard.entity';
import { BillingCycle } from '../domain/model/subscription-plan.entity';
import { SubscriptionApi } from '../infrastructure/subscription-api';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionStore {
  private readonly subscriptionApi = inject(SubscriptionApi);
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
    this.feedbackSignal.set('Plan Control seleccionado. Completa facturación para continuar.');
  }

  activateControlPlan(): void {
    this.subscriptionApi.activateControlPlan(this.selectedCycleSignal()).subscribe((dashboard) => {
      this.dashboardSignal.set(dashboard);
      this.selectedPlanIdSignal.set(null);
      this.feedbackSignal.set('Suscripción actualizada a Plan Control.');
    });
  }

  scheduleCancellation(): void {
    this.subscriptionApi.scheduleCancellation(this.dashboardSignal()).subscribe((dashboard) => {
      this.dashboardSignal.set(dashboard);
      this.feedbackSignal.set('Cancelación programada.');
    });
  }

  keepControlPlan(): void {
    this.subscriptionApi.keepControlPlan(this.dashboardSignal()).subscribe((dashboard) => {
      this.dashboardSignal.set(dashboard);
      this.feedbackSignal.set('Plan Control se mantendrá activo.');
    });
  }

  addPaymentMethod(): void {
    const billingSetup = new BillingSetup({
      ...this.dashboardSignal().billingSetup,
      hasPaymentMethod: true,
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
  }

  completeFiscalData(): void {
    const billingSetup = new BillingSetup({
      ...this.dashboardSignal().billingSetup,
      hasFiscalData: true,
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
  }

  downloadActivityHistory(): void {
    const activity = this.dashboardSignal().activity;

    if (activity.length === 0) {
      this.feedbackSignal.set('No hay actividad suficiente para descargar.');
      return;
    }

    const csvContent = this.toSubscriptionActivityCsv(activity);
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

    return ['Evento,Detalle', ...rows].join('\n');
  }

  private toCsvValue(value: string): string {
    return `"${value.replaceAll('"', '""')}"`;
  }
}

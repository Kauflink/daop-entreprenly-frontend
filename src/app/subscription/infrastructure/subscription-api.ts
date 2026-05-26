import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BillingSetup } from '../domain/model/billing-setup.entity';
import { SubscriptionDashboard } from '../domain/model/subscription-dashboard.entity';
import { BillingCycle } from '../domain/model/subscription-plan.entity';
import { SubscriptionAssembler } from './subscription-assembler';
import { SubscriptionDashboardResponse, SubscriptionPlanResponse } from './subscription-response';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.entreprenlyProviderApiBaseUrl;
  private readonly subscriptionDashboardEndpoint =
    environment.entreprenlyProviderSubscriptionDashboardEndpointPath;
  private readonly subscriptionActivationEndpoint =
    environment.entreprenlyProviderSubscriptionActivationEndpointPath;

  private readonly longDateFormatter = new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  getSubscriptionDashboard(): Observable<SubscriptionDashboard> {
    return this.http
      .get<SubscriptionDashboardResponse>(`${this.baseUrl}${this.subscriptionDashboardEndpoint}`)
      .pipe(map((response) => SubscriptionAssembler.toEntityFromResponse(response)));
  }

  activateControlPlan(
    billingCycle: BillingCycle,
    currentDashboard: SubscriptionDashboard,
  ): Observable<SubscriptionDashboard> {
    return this.http
      .get<SubscriptionDashboardResponse>(`${this.baseUrl}${this.subscriptionActivationEndpoint}`)
      .pipe(
        map((response) => ({
          ...response,
          billingSetup: this.toDashboardResponseFromEntity(currentDashboard).billingSetup,
        })),
        map((response) => this.withNewSubscriptionPeriod(response, billingCycle)),
        switchMap((response) => this.saveSubscriptionDashboard(response)),
        map((response) => SubscriptionAssembler.toEntityFromResponse(response)),
      );
  }

  updateBillingSetup(
    currentDashboard: SubscriptionDashboard,
    billingSetup: BillingSetup,
  ): Observable<SubscriptionDashboard> {
    const response = {
      ...this.toDashboardResponseFromEntity(currentDashboard),
      billingSetup: this.toBillingSetupResponseFromEntity(billingSetup),
    };

    return this.saveSubscriptionDashboard(response).pipe(
      map((savedResponse) => SubscriptionAssembler.toEntityFromResponse(savedResponse)),
    );
  }

  scheduleCancellation(currentDashboard: SubscriptionDashboard): Observable<SubscriptionDashboard> {
    const response = this.withScheduledCancellation(
      this.toDashboardResponseFromEntity(currentDashboard),
    );

    return this.saveSubscriptionDashboard(response).pipe(
      map((savedResponse) => SubscriptionAssembler.toEntityFromResponse(savedResponse)),
    );
  }

  keepControlPlan(currentDashboard: SubscriptionDashboard): Observable<SubscriptionDashboard> {
    const response = this.withActiveRenewal(this.toDashboardResponseFromEntity(currentDashboard));

    return this.saveSubscriptionDashboard(response).pipe(
      map((savedResponse) => SubscriptionAssembler.toEntityFromResponse(savedResponse)),
    );
  }

  private withNewSubscriptionPeriod(
    response: SubscriptionDashboardResponse,
    billingCycle: BillingCycle,
  ): SubscriptionDashboardResponse {
    const startDate = this.today();
    const endDate = this.addBillingCycle(startDate, billingCycle);
    const startDateText = this.toDateInputValue(startDate);
    const endDateText = this.toDateInputValue(endDate);
    const endDateLabel = this.formatDate(endDateText);

    return this.withActiveRenewal({
      ...response,
      defaultBillingCycle: billingCycle,
      currentPlan: {
        ...response.currentPlan,
        currentPeriodStartDate: startDateText,
        currentPeriodEndDate: endDateText,
        shortDescription: `Tu plan sigue activo hasta el ${endDateLabel}. Se renovará automáticamente.`,
      },
    });
  }

  private withScheduledCancellation(
    response: SubscriptionDashboardResponse,
  ): SubscriptionDashboardResponse {
    const currentPlan = response.currentPlan;
    const endDateLabel = this.formatDate(currentPlan.currentPeriodEndDate);

    return {
      ...response,
      currentPlan: {
        ...currentPlan,
        status: 'scheduled-cancellation',
        statusLabel: 'Cancelación programada',
        shortDescription: `Tu plan sigue activo hasta el ${endDateLabel}. No se renovará automáticamente.`,
      },
      activity: this.withSubscriptionActivity(response, {
        statusDetail: 'Cancelacion programada',
        billingDetail: `Acceso vigente hasta el ${endDateLabel} - sin siguiente cobro`,
      }),
    };
  }

  private withActiveRenewal(response: SubscriptionDashboardResponse): SubscriptionDashboardResponse {
    const currentPlan = response.currentPlan;
    const endDateLabel = this.formatDate(currentPlan.currentPeriodEndDate);

    return {
      ...response,
      currentPlan: {
        ...currentPlan,
        status: 'active',
        statusLabel: 'Plan Control activo',
        shortDescription: `Tu plan sigue activo hasta el ${endDateLabel}. Se renovará automáticamente.`,
      },
      activity: this.withSubscriptionActivity(response, {
        statusDetail: 'Plan Control activo',
        billingDetail: `Próxima renovación: ${endDateLabel} - ${this.billingCycleLabel(
          response.defaultBillingCycle,
        )}`,
      }),
    };
  }

  private withSubscriptionActivity(
    response: SubscriptionDashboardResponse,
    activity: { statusDetail: string; billingDetail: string },
  ): SubscriptionDashboardResponse['activity'] {
    const existingCreatedAccount = response.activity.find((item) => item.id === 'created-account');

    return [
      existingCreatedAccount ?? {
        id: 'created-account',
        title: 'Cuenta creada',
        detail: '16 abril 2026 - Plan Free asignado automáticamente',
      },
      {
        id: 'current-status',
        title: 'Estado actual',
        detail: activity.statusDetail,
      },
      {
        id: 'billing',
        title: 'Facturación',
        detail: activity.billingDetail,
      },
    ];
  }

  private toDashboardResponseFromEntity(
    dashboard: SubscriptionDashboard,
  ): SubscriptionDashboardResponse {
    return {
      id: 1,
      defaultBillingCycle: dashboard.defaultBillingCycle,
      currentPlan: this.toPlanResponseFromEntity(dashboard.currentPlan),
      recommendedPlan: this.toPlanResponseFromEntity(dashboard.recommendedPlan),
      limits: dashboard.limits.map((limit) => ({
        id: limit.id,
        label: limit.label,
        usedValue: limit.usedValue,
        maxValue: limit.maxValue,
      })),
      billingSetup: {
        ...this.toBillingSetupResponseFromEntity(dashboard.billingSetup),
      },
      activity: dashboard.activity.map((item) => ({
        id: item.id,
        title: item.title,
        detail: item.detail,
      })),
    };
  }

  private toPlanResponseFromEntity(plan: SubscriptionDashboard['currentPlan']): SubscriptionPlanResponse {
    const response: SubscriptionPlanResponse = {
      id: plan.id,
      name: plan.name,
      shortDescription: plan.shortDescription,
      monthlyPrice: plan.monthlyPrice,
      annualPrice: plan.annualPrice,
      status: plan.status,
      statusLabel: plan.statusLabel,
      badgeLabel: plan.badgeLabel,
      recommended: plan.recommended,
      features: plan.features.map((feature) => ({
        description: feature.description,
        available: feature.available,
      })),
    };

    if (plan.currentPeriodStartDate) {
      response.currentPeriodStartDate = plan.currentPeriodStartDate;
    }

    if (plan.currentPeriodEndDate) {
      response.currentPeriodEndDate = plan.currentPeriodEndDate;
    }

    return response;
  }

  private toBillingSetupResponseFromEntity(
    billingSetup: BillingSetup,
  ): SubscriptionDashboardResponse['billingSetup'] {
    return {
      paymentMethodTitle: billingSetup.paymentMethodTitle,
      paymentMethodDescription: billingSetup.paymentMethodDescription,
      paymentMethodActionLabel: billingSetup.paymentMethodActionLabel,
      fiscalDataTitle: billingSetup.fiscalDataTitle,
      fiscalDataDescription: billingSetup.fiscalDataDescription,
      fiscalDataActionLabel: billingSetup.fiscalDataActionLabel,
      hasPaymentMethod: billingSetup.hasPaymentMethod,
      hasFiscalData: billingSetup.hasFiscalData,
      paymentMethods: billingSetup.paymentMethods.map((paymentMethod) => ({
        id: paymentMethod.id,
        cardBrand: paymentMethod.cardBrand,
        lastFour: paymentMethod.lastFour,
        holderName: paymentMethod.holderName,
        expiryMonth: paymentMethod.expiryMonth,
        expiryYear: paymentMethod.expiryYear,
        isDefault: paymentMethod.isDefault,
      })),
      fiscalData: billingSetup.fiscalData
        ? {
            documentType: billingSetup.fiscalData.documentType,
            documentNumber: billingSetup.fiscalData.documentNumber,
            businessName: billingSetup.fiscalData.businessName,
            receiptEmail: billingSetup.fiscalData.receiptEmail,
            fiscalAddress: billingSetup.fiscalData.fiscalAddress,
          }
        : null,
    };
  }

  private saveSubscriptionDashboard(
    response: SubscriptionDashboardResponse,
  ): Observable<SubscriptionDashboardResponse> {
    return this.http
      .put<SubscriptionDashboardResponse>(
        `${this.baseUrl}${this.subscriptionDashboardEndpoint}`,
        response,
      )
      .pipe(catchError(() => of(response)));
  }

  private today(): Date {
    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  private addBillingCycle(date: Date, billingCycle: BillingCycle): Date {
    return billingCycle === 'annual'
      ? this.addMonthsPreservingMonthEnd(date, 12)
      : this.addMonthsPreservingMonthEnd(date, 1);
  }

  private addMonthsPreservingMonthEnd(date: Date, months: number): Date {
    const targetMonthStart = new Date(date.getFullYear(), date.getMonth() + months, 1);
    const originalMonthLastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const targetMonthLastDay = new Date(
      targetMonthStart.getFullYear(),
      targetMonthStart.getMonth() + 1,
      0,
    ).getDate();
    const targetDay =
      date.getDate() === originalMonthLastDay
        ? targetMonthLastDay
        : Math.min(date.getDate(), targetMonthLastDay);

    return new Date(targetMonthStart.getFullYear(), targetMonthStart.getMonth(), targetDay);
  }

  private toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
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

  private formatDate(dateValue: string | undefined): string {
    const date = this.toLocalDate(dateValue);

    return date === null ? 'la fecha registrada en tu suscripción' : this.longDateFormatter.format(date);
  }

  private billingCycleLabel(billingCycle: BillingCycle): string {
    return billingCycle === 'annual' ? 'pago anual' : 'pago mensual';
  }
}

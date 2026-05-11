import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SubscriptionStore } from '../../../application/subscription-store';
import {
  BillingFiscalData,
  BillingPaymentMethodInput,
} from '../../../domain/model/billing-setup.entity';
import { BillingCycle } from '../../../domain/model/subscription-plan.entity';
import { BillingDataModal } from '../../components/billing-data-modal/billing-data-modal';
import { PaymentMethodModal } from '../../components/payment-method-modal/payment-method-modal';
import { SubscriptionHistoryModal } from '../../components/subscription-history-modal/subscription-history-modal';
import {
  SubscriptionPlanActionModal,
  SubscriptionPlanActionModalMode,
} from '../../components/subscription-plan-action-modal/subscription-plan-action-modal';
import { UpgradePlanModal } from '../../components/upgrade-plan-modal/upgrade-plan-modal';
import { BillingSetup } from '../billing-setup/billing-setup';
import { PlanOverview } from '../plan-overview/plan-overview';
import { PlanUsage } from '../plan-usage/plan-usage';
import { SubscriptionActivity } from '../subscription-activity/subscription-activity';

@Component({
  selector: 'app-subscription-page',
  imports: [
    PlanOverview,
    PlanUsage,
    BillingSetup,
    SubscriptionActivity,
    UpgradePlanModal,
    SubscriptionPlanActionModal,
    PaymentMethodModal,
    BillingDataModal,
    SubscriptionHistoryModal,
    TranslatePipe,
  ],
  templateUrl: './subscription-page.html',
  styleUrl: './subscription-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionPage implements OnInit {
  protected readonly subscriptionApp = inject(SubscriptionStore);
  protected readonly dashboard = this.subscriptionApp.dashboard;
  protected readonly loading = this.subscriptionApp.loading;
  protected readonly selectedCycle = this.subscriptionApp.selectedCycle;
  protected readonly controlPlanSelected = this.subscriptionApp.controlPlanSelected;
  protected readonly feedback = this.subscriptionApp.feedback;
  protected readonly upgradeModalOpen = signal(false);
  protected readonly planActionModalMode = signal<SubscriptionPlanActionModalMode | null>(null);
  protected readonly paymentMethodModalOpen = signal(false);
  protected readonly billingDataModalOpen = signal(false);
  protected readonly historyModalOpen = signal(false);
  protected readonly historyDownloaded = signal(false);

  ngOnInit(): void {
    this.subscriptionApp.loadDashboard();
  }

  protected selectBillingCycle(cycle: BillingCycle): void {
    this.subscriptionApp.selectBillingCycle(cycle);
  }

  protected selectControlPlan(): void {
    this.upgradeModalOpen.set(true);
  }

  protected closeUpgradeModal(): void {
    this.upgradeModalOpen.set(false);
  }

  protected activateControlPlan(): void {
    this.subscriptionApp.activateControlPlan();
  }

  protected openRenewalModal(): void {
    this.planActionModalMode.set('renew');
  }

  protected openCancellationModal(): void {
    this.planActionModalMode.set('cancel');
  }

  protected openKeepPlanModal(): void {
    this.planActionModalMode.set('keep');
  }

  protected closePlanActionModal(): void {
    this.planActionModalMode.set(null);
  }

  protected confirmCancellation(): void {
    this.subscriptionApp.scheduleCancellation();
    this.planActionModalMode.set('cancel-success');
  }

  protected keepControlPlan(): void {
    this.subscriptionApp.keepControlPlan();
    this.closePlanActionModal();
  }

  protected openPaymentMethodModal(): void {
    this.paymentMethodModalOpen.set(true);
  }

  protected closePaymentMethodModal(): void {
    this.paymentMethodModalOpen.set(false);
  }

  protected savePaymentMethod(paymentMethod: BillingPaymentMethodInput): void {
    this.subscriptionApp.addPaymentMethod(paymentMethod);
    this.closePaymentMethodModal();
  }

  protected saveUpgradePaymentMethod(paymentMethod: BillingPaymentMethodInput): void {
    this.subscriptionApp.addPaymentMethod(paymentMethod);
  }

  protected selectUpgradePaymentMethod(paymentMethodId: string): void {
    this.subscriptionApp.selectPaymentMethod(paymentMethodId);
  }

  protected openBillingDataModal(): void {
    this.billingDataModalOpen.set(true);
  }

  protected closeBillingDataModal(): void {
    this.billingDataModalOpen.set(false);
  }

  protected saveFiscalData(fiscalData: BillingFiscalData): void {
    this.subscriptionApp.completeFiscalData(fiscalData);
    this.closeBillingDataModal();
  }

  protected saveUpgradeFiscalData(fiscalData: BillingFiscalData): void {
    this.subscriptionApp.completeFiscalData(fiscalData);
  }

  protected openHistoryModal(): void {
    this.historyDownloaded.set(false);
    this.historyModalOpen.set(true);
  }

  protected closeHistoryModal(): void {
    this.historyModalOpen.set(false);
    this.historyDownloaded.set(false);
  }

  protected downloadActivityHistory(): void {
    this.subscriptionApp.downloadActivityHistory();
    this.historyDownloaded.set(true);
  }
}

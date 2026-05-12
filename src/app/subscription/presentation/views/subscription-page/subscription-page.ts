import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SubscriptionStore } from '../../../application/subscription-store';
import { BillingCycle } from '../../../domain/model/subscription-plan.entity';
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

  protected addPaymentMethod(): void {
    this.subscriptionApp.addPaymentMethod();
  }

  protected completeFiscalData(): void {
    this.subscriptionApp.completeFiscalData();
  }

  protected downloadActivityHistory(): void {
    this.subscriptionApp.downloadActivityHistory();
  }
}

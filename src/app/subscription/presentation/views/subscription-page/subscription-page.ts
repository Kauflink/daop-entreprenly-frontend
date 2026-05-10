import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SubscriptionStore } from '../../../application/subscription-store';
import { BillingCycle } from '../../../domain/model/subscription-plan.entity';
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

  ngOnInit(): void {
    this.subscriptionApp.loadDashboard();
  }

  protected selectBillingCycle(cycle: BillingCycle): void {
    this.subscriptionApp.selectBillingCycle(cycle);
  }

  protected selectControlPlan(): void {
    this.subscriptionApp.selectControlPlan();
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

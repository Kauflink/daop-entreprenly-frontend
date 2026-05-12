import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { startWith } from 'rxjs';
import {
  BillingFiscalData,
  BillingPaymentMethodInput,
  BillingSetup,
  detectCardBrand,
} from '../../../domain/model/billing-setup.entity';
import { BillingCycle, SubscriptionPlan } from '../../../domain/model/subscription-plan.entity';

type UpgradeStep = 'plan' | 'billing' | 'payment' | 'activation';

interface StepItem {
  id: UpgradeStep;
  label: string;
}

@Component({
  selector: 'app-upgrade-plan-modal',
  imports: [CdkTrapFocus, ReactiveFormsModule, CardBrandBadge, TranslatePipe],
  templateUrl: './upgrade-plan-modal.html',
  styleUrl: './upgrade-plan-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closeFromKeyboard($event)',
  },
})
export class UpgradePlanModal {
  readonly plan = input.required<SubscriptionPlan>();
  readonly billingCycle = input.required<BillingCycle>();

  readonly closed = output<void>();
  readonly subscriptionActivated = output<void>();

  private readonly formBuilder = inject(NonNullableFormBuilder);
  protected readonly activeStep = signal<UpgradeStep>('plan');
  protected readonly activated = signal(false);

  protected readonly fiscalForm = this.formBuilder.group({
    ruc: ['20614578219', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    businessName: ['Kauflink Retail SAC', Validators.required],
    billingEmail: ['pagos@entreprenly.pe', [Validators.required, Validators.email]],
    district: ['Lima', Validators.required],
  });

  protected readonly steps: StepItem[] = [
    { id: 'plan', label: 'subscription.upgrade.steps.plan' },
    { id: 'billing', label: 'subscription.upgrade.steps.billing' },
    { id: 'payment', label: 'subscription.upgrade.steps.payment' },
    { id: 'activation', label: 'subscription.upgrade.steps.activation' },
  ];

  protected readonly activeIndex = computed(() =>
    this.steps.findIndex((step) => step.id === this.activeStep()),
  );
  protected readonly planPrice = computed(() =>
    this.billingCycle() === 'monthly' ? this.plan().monthlyPrice : this.plan().annualPrice,
  );
  protected readonly planPriceLabel = computed(() =>
    this.billingCycle() === 'monthly'
      ? 'subscription.upgrade.plan.priceLabel.monthly'
      : 'subscription.upgrade.plan.priceLabel.annual',
  );
  protected readonly billingLabel = computed(() =>
    this.billingCycle() === 'monthly'
      ? 'subscription.upgrade.plan.billingLabel.monthly'
      : 'subscription.upgrade.plan.billingLabel.annual',
  );

  protected close(): void {
    this.closed.emit();
  }

  protected closeFromKeyboard(event: Event): void {
    event.preventDefault();
    this.close();
  }

  protected goToStep(step: UpgradeStep): void {
    const targetIndex = this.stepIndex(step);

    if (targetIndex <= this.activeIndex()) {
      this.activeStep.set(step);
    }
  }

  protected continue(): void {
    if (this.activeStep() === 'billing' && this.fiscalForm.invalid) {
      this.fiscalForm.markAllAsTouched();
      return;
    }

    const nextStep = this.steps[this.activeIndex() + 1];

    if (nextStep) {
      this.activeStep.set(nextStep.id);
    }
  }

  protected back(): void {
    const previousStep = this.steps[this.activeIndex() - 1];

    if (previousStep) {
      this.activeStep.set(previousStep.id);
    }
  }

  protected activateSubscription(): void {
    this.subscriptionActivated.emit();
    this.activated.set(true);
  }

  protected isStepActive(step: UpgradeStep): boolean {
    return this.activeStep() === step;
  }

  protected isStepComplete(step: UpgradeStep): boolean {
    return this.stepIndex(step) < this.activeIndex();
  }

  protected hasFieldError(fieldName: keyof typeof this.fiscalForm.controls): boolean {
    const field = this.fiscalForm.controls[fieldName];
    return field.invalid && (field.dirty || field.touched);
  }

  private stepIndex(step: UpgradeStep): number {
    return this.steps.findIndex((item) => item.id === step);
  }
}

import { CdkTrapFocus } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { startWith } from 'rxjs';
import { CurrencyService } from '../../../../shared/infrastructure/currency-service';
import {
  BillingFiscalData,
  BillingPaymentMethodInput,
  BillingSetup,
  detectCardBrand,
} from '../../../domain/model/billing-setup.entity';
import { BillingCycle, SubscriptionPlan } from '../../../domain/model/subscription-plan.entity';
import { CardBrandBadge } from '../card-brand-badge/card-brand-badge';

type UpgradeStep = 'plan' | 'billing' | 'payment' | 'activation';

interface StepItem {
  id: UpgradeStep;
  labelKey: string;
}

@Component({
  selector: 'app-upgrade-plan-modal',
  imports: [CdkTrapFocus, ReactiveFormsModule, TranslatePipe, CardBrandBadge],
  templateUrl: './upgrade-plan-modal.html',
  styleUrl: './upgrade-plan-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closeFromKeyboard($event)',
  },
})
export class UpgradePlanModal implements OnInit {
  readonly plan = input.required<SubscriptionPlan>();
  readonly billingCycle = input.required<BillingCycle>();
  readonly billingSetup = input.required<BillingSetup>();

  readonly closed = output<void>();
  readonly fiscalDataSaved = output<BillingFiscalData>();
  readonly paymentMethodSaved = output<BillingPaymentMethodInput>();
  readonly paymentMethodSelected = output<string>();
  readonly subscriptionActivated = output<void>();

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly translate = inject(TranslateService);
  private readonly currencyAssembler = inject(CurrencyService);
  protected readonly activeStep = signal<UpgradeStep>('plan');
  protected readonly activated = signal(false);
  protected readonly selectedPaymentMethodId = signal('');

  protected readonly fiscalForm = this.formBuilder.group({
    documentType: ['RUC', Validators.required],
    documentNumber: ['', [Validators.required, Validators.pattern(/^\d{8,11}$/)]],
    businessName: ['', Validators.required],
    receiptEmail: ['', [Validators.required, Validators.email]],
    fiscalAddress: ['', Validators.required],
  });

  protected readonly paymentForm = this.formBuilder.group({
    cardNumber: ['', [Validators.required, Validators.pattern(/^(?:\d[ -]?){13,19}$/)]],
    holderName: ['', [Validators.required, Validators.minLength(3)]],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
  });
  private readonly paymentCardNumberValue = toSignal(
    this.paymentForm.controls.cardNumber.valueChanges.pipe(
      startWith(this.paymentForm.controls.cardNumber.value),
    ),
    { initialValue: this.paymentForm.controls.cardNumber.value },
  );
  protected readonly detectedPaymentCardBrand = computed(
    () => detectCardBrand(this.paymentCardNumberValue()).label,
  );

  protected readonly steps: StepItem[] = [
    { id: 'plan', labelKey: 'subscription.upgrade.steps.plan' },
    { id: 'billing', labelKey: 'subscription.upgrade.steps.billing' },
    { id: 'payment', labelKey: 'subscription.upgrade.steps.payment' },
    { id: 'activation', labelKey: 'subscription.upgrade.steps.activation' },
  ];

  protected readonly activeIndex = computed(() =>
    this.steps.findIndex((step) => step.id === this.activeStep()),
  );
  protected readonly planPrice = computed(() =>
    this.billingCycle() === 'monthly' ? this.plan().monthlyPrice : this.plan().annualPrice,
  );
  protected readonly formattedPlanPrice = computed(() => this.currencyAssembler.format(this.planPrice()));
  protected readonly planPriceSuffixKey = computed(() =>
    this.billingCycle() === 'monthly'
      ? 'subscription.upgrade.plan.priceLabel.monthly'
      : 'subscription.upgrade.plan.priceLabel.annual',
  );
  protected readonly billingLabelKey = computed(() =>
    this.billingCycle() === 'monthly'
      ? 'subscription.upgrade.plan.billingLabel.monthly'
      : 'subscription.upgrade.plan.billingLabel.annual',
  );
  protected readonly paymentMethods = computed(() => this.billingSetup().paymentMethods);
  protected readonly defaultPaymentMethodId = computed(
    () =>
      this.paymentMethods().find((paymentMethod) => paymentMethod.isDefault)?.id ??
      this.paymentMethods()[0]?.id ??
      '',
  );
  protected readonly effectiveSelectedPaymentMethodId = computed(() => {
    const selectedId = this.selectedPaymentMethodId();

    if (this.paymentMethods().some((paymentMethod) => paymentMethod.id === selectedId)) {
      return selectedId;
    }

    return this.defaultPaymentMethodId();
  });
  protected readonly selectedPaymentMethod = computed(
    () =>
      this.paymentMethods().find(
        (paymentMethod) => paymentMethod.id === this.effectiveSelectedPaymentMethodId(),
      ) ?? null,
  );

  ngOnInit(): void {
    const fiscalData = this.billingSetup().fiscalData;

    if (fiscalData !== null) {
      this.fiscalForm.setValue({
        documentType: fiscalData.documentType,
        documentNumber: fiscalData.documentNumber,
        businessName: fiscalData.businessName,
        receiptEmail: fiscalData.receiptEmail,
        fiscalAddress: fiscalData.fiscalAddress,
      });
    }

    this.selectedPaymentMethodId.set(this.defaultPaymentMethodId());
  }

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
    if (this.activeStep() === 'billing') {
      this.continueFromBilling();
      return;
    }

    if (this.activeStep() === 'payment') {
      this.continueFromPayment();
      return;
    }

    this.goToNextStep();
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

  protected selectPaymentMethod(paymentMethodId: string): void {
    this.selectedPaymentMethodId.set(paymentMethodId);
  }

  protected isStepActive(step: UpgradeStep): boolean {
    return this.activeStep() === step;
  }

  protected isStepComplete(step: UpgradeStep): boolean {
    return this.stepIndex(step) < this.activeIndex();
  }

  protected stepBackgroundColor(step: UpgradeStep): string {
    if (this.isStepActive(step)) {
      return '#FFFCF5';
    }

    return this.isStepComplete(step) ? '#F2FBF5' : '#FBFAF8';
  }

  protected stepBorderColor(step: UpgradeStep): string {
    if (this.isStepActive(step)) {
      return '#FDEAD3';
    }

    return this.isStepComplete(step) ? '#BEE3CB' : '#ECE6E3';
  }

  protected stepTextColor(step: UpgradeStep): string {
    if (this.isStepActive(step)) {
      return '#511E00';
    }

    return this.isStepComplete(step) ? '#004E1D' : 'rgb(81 30 0 / 50%)';
  }

  protected hasFiscalFieldError(fieldName: keyof typeof this.fiscalForm.controls): boolean {
    const field = this.fiscalForm.controls[fieldName];
    return field.invalid && (field.dirty || field.touched);
  }

  protected hasPaymentFieldError(fieldName: keyof typeof this.paymentForm.controls): boolean {
    const field = this.paymentForm.controls[fieldName];
    return field.invalid && (field.dirty || field.touched);
  }

  protected cardBrandLabel(cardBrand: string): string {
    const normalizedBrand = cardBrand.trim().toLowerCase();

    return ['tarjeta', 'card'].includes(normalizedBrand)
      ? this.translate.instant('subscription.cardBrand.generic')
      : cardBrand;
  }

  private continueFromBilling(): void {
    if (this.fiscalForm.invalid) {
      this.fiscalForm.markAllAsTouched();
      return;
    }

    this.fiscalDataSaved.emit(this.fiscalForm.getRawValue());
    this.goToNextStep();
  }

  private continueFromPayment(): void {
    if (this.paymentMethods().length > 0) {
      this.paymentMethodSelected.emit(this.effectiveSelectedPaymentMethodId());
      this.goToNextStep();
      return;
    }

    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const { cardNumber, holderName, expiry } = this.paymentForm.getRawValue();
    const [expiryMonth, expiryYear] = expiry.split('/');

    this.paymentMethodSaved.emit({
      cardNumber,
      holderName,
      expiryMonth,
      expiryYear,
    });
    this.goToNextStep();
  }

  private goToNextStep(): void {
    const nextStep = this.steps[this.activeIndex() + 1];

    if (nextStep) {
      this.activeStep.set(nextStep.id);
    }
  }

  private stepIndex(step: UpgradeStep): number {
    return this.steps.findIndex((item) => item.id === step);
  }
}

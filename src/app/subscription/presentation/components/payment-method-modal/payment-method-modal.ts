import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { startWith } from 'rxjs';
import { BillingPaymentMethodInput, detectCardBrand } from '../../../domain/model/billing-setup.entity';
import { CardBrandBadge } from '../card-brand-badge/card-brand-badge';

@Component({
  selector: 'app-payment-method-modal',
  imports: [CdkTrapFocus, ReactiveFormsModule, CardBrandBadge],
  templateUrl: './payment-method-modal.html',
  styleUrl: './payment-method-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closeFromKeyboard($event)',
  },
})
export class PaymentMethodModal {
  readonly closed = output<void>();
  readonly saved = output<BillingPaymentMethodInput>();

  private readonly formBuilder = inject(NonNullableFormBuilder);

  protected readonly paymentForm = this.formBuilder.group({
    cardNumber: ['', [Validators.required, Validators.pattern(/^(?:\d[ -]?){13,19}$/)]],
    holderName: ['', [Validators.required, Validators.minLength(3)]],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
  });
  private readonly cardNumberValue = toSignal(
    this.paymentForm.controls.cardNumber.valueChanges.pipe(
      startWith(this.paymentForm.controls.cardNumber.value),
    ),
    { initialValue: this.paymentForm.controls.cardNumber.value },
  );
  protected readonly detectedCardBrand = computed(
    () => detectCardBrand(this.cardNumberValue()).label,
  );

  protected close(): void {
    this.closed.emit();
  }

  protected closeFromKeyboard(event: Event): void {
    event.preventDefault();
    this.close();
  }

  protected save(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const { cardNumber, holderName, expiry } = this.paymentForm.getRawValue();
    const [expiryMonth, expiryYear] = expiry.split('/');

    this.saved.emit({
      cardNumber,
      holderName,
      expiryMonth,
      expiryYear,
    });
  }

  protected hasFieldError(fieldName: keyof typeof this.paymentForm.controls): boolean {
    const field = this.paymentForm.controls[fieldName];
    return field.invalid && (field.dirty || field.touched);
  }
}

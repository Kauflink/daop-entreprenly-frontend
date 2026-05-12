import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, OnInit, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { BillingFiscalData } from '../../../domain/model/billing-setup.entity';

@Component({
  selector: 'app-billing-data-modal',
  imports: [CdkTrapFocus, ReactiveFormsModule, TranslatePipe],
  templateUrl: './billing-data-modal.html',
  styleUrl: './billing-data-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closeFromKeyboard($event)',
  },
})
export class BillingDataModal implements OnInit {
  readonly fiscalData = input<BillingFiscalData | null>(null);

  readonly closed = output<void>();
  readonly saved = output<BillingFiscalData>();

  private readonly formBuilder = inject(NonNullableFormBuilder);

  protected readonly fiscalForm = this.formBuilder.group({
    documentType: ['RUC', Validators.required],
    documentNumber: ['', [Validators.required, Validators.pattern(/^\d{8,11}$/)]],
    businessName: ['', Validators.required],
    receiptEmail: ['', [Validators.required, Validators.email]],
    fiscalAddress: ['', Validators.required],
  });

  ngOnInit(): void {
    const fiscalData = this.fiscalData();

    if (fiscalData === null) {
      return;
    }

    this.fiscalForm.setValue({
      documentType: fiscalData.documentType,
      documentNumber: fiscalData.documentNumber,
      businessName: fiscalData.businessName,
      receiptEmail: fiscalData.receiptEmail,
      fiscalAddress: fiscalData.fiscalAddress,
    });
  }

  protected close(): void {
    this.closed.emit();
  }

  protected closeFromKeyboard(event: Event): void {
    event.preventDefault();
    this.close();
  }

  protected save(): void {
    if (this.fiscalForm.invalid) {
      this.fiscalForm.markAllAsTouched();
      return;
    }

    this.saved.emit(this.fiscalForm.getRawValue());
  }

  protected hasFieldError(fieldName: keyof typeof this.fiscalForm.controls): boolean {
    const field = this.fiscalForm.controls[fieldName];
    return field.invalid && (field.dirty || field.touched);
  }
}

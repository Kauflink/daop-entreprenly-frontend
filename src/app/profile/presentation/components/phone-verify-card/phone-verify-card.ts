import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-phone-verify-card',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './phone-verify-card.html',
  styleUrl: './phone-verify-card.css',
})
export class PhoneVerifyCard {
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-()]{7,20}$/)]],
  });

  protected onSubmit(): void {
    if (this.form.invalid) return;
    // Verification logic delegated to a future service
  }
}

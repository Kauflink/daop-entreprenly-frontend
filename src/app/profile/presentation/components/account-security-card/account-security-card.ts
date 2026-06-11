import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

const passwordsMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const newPwd = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return newPwd && confirm && newPwd !== confirm ? { passwordsMismatch: true } : null;
};

/**
 * Single card grouping the account security actions: phone verification,
 * email change with re-verification and password change.
 */
@Component({
  selector: 'app-account-security-card',
  imports: [ReactiveFormsModule, MatIconModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account-security-card.html',
  styleUrl: './account-security-card.css',
})
export class AccountSecurityCard {
  private readonly fb = inject(FormBuilder);

  protected readonly showCurrent = signal(false);
  protected readonly showNew = signal(false);
  protected readonly showConfirm = signal(false);

  protected readonly phoneForm = this.fb.nonNullable.group({
    phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-()]{7,20}$/)]],
  });

  protected readonly emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected readonly passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator },
  );

  protected get mismatch(): boolean {
    return (
      this.passwordForm.hasError('passwordsMismatch') &&
      this.passwordForm.get('confirmPassword')!.dirty
    );
  }

  protected onPhoneSubmit(): void {
    if (this.phoneForm.invalid) return;
    // Verification logic delegated to a future service
  }

  protected onEmailSubmit(): void {
    if (this.emailForm.invalid) return;
    // Re-verification flow delegated to a future service
  }

  protected onPasswordSubmit(): void {
    if (this.passwordForm.invalid) return;
    // Password update delegated to a future service
    this.passwordForm.reset();
  }
}

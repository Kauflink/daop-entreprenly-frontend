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
import { AuthApi } from '../../../../auth/infrastructure/auth-api';

const passwordsMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const newPwd = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return newPwd && confirm && newPwd !== confirm ? { passwordsMismatch: true } : null;
};

@Component({
  selector: 'app-change-password-card',
  imports: [ReactiveFormsModule, MatIconModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './change-password-card.html',
  styleUrl: './change-password-card.css',
})
export class ChangePasswordCard {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApi);

  protected readonly showCurrent = signal(false);
  protected readonly showNew = signal(false);
  protected readonly showConfirm = signal(false);

  /** Submission feedback: 'idle' | 'pending' | 'success' | 'error'. */
  protected readonly status = signal<'idle' | 'pending' | 'success' | 'error'>('idle');

  protected readonly form = this.fb.nonNullable.group(
    {
      currentPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator },
  );

  protected get mismatch(): boolean {
    return this.form.hasError('passwordsMismatch') && this.form.get('confirmPassword')!.dirty;
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.status() === 'pending') return;
    const { currentPassword, newPassword } = this.form.getRawValue();
    this.status.set('pending');
    this.authApi.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.status.set('success');
        this.form.reset();
      },
      error: () => this.status.set('error'),
    });
  }
}

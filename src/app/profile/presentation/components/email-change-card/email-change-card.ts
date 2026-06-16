import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthApi } from '../../../../auth/infrastructure/auth-api';
import { AuthStore } from '../../../../auth/application/auth-store';

@Component({
  selector: 'app-email-change-card',
  imports: [ReactiveFormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './email-change-card.html',
  styleUrl: './email-change-card.css',
})
export class EmailChangeCard {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApi);
  private readonly authStore = inject(AuthStore);

  /** Submission feedback: 'idle' | 'pending' | 'success' | 'error'. */
  protected readonly status = signal<'idle' | 'pending' | 'success' | 'error'>('idle');

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected onSubmit(): void {
    if (this.form.invalid || this.status() === 'pending') return;
    const { email } = this.form.getRawValue();
    this.status.set('pending');
    this.authApi.changeEmail(email).subscribe({
      next: () => {
        // The JWT subject is now stale; force a fresh sign-in with the new email.
        this.status.set('success');
        this.form.reset();
        setTimeout(() => this.authStore.logout(), 2500);
      },
      error: () => this.status.set('error'),
    });
  }
}

import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileStore } from '../../../application/profile-store';

@Component({
  selector: 'app-phone-verify-card',
  imports: [ReactiveFormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './phone-verify-card.html',
  styleUrl: './phone-verify-card.css',
})
export class PhoneVerifyCard {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(ProfileStore);

  /** Submission feedback: 'idle' | 'success'. */
  protected readonly status = signal<'idle' | 'success'>('idle');

  protected readonly form = this.fb.nonNullable.group({
    phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-()]{7,20}$/)]],
  });

  constructor() {
    effect(() => {
      const phone = this.store.profile().phone;
      this.form.setValue({ phone: phone ?? '' }, { emitEvent: false });
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;
    this.store.updateProfile({ phone: this.form.getRawValue().phone });
    this.status.set('success');
  }
}

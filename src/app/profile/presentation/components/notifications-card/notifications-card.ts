import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileStore } from '../../../application/profile-store';

@Component({
  selector: 'app-notifications-card',
  imports: [ReactiveFormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notifications-card.html',
  styleUrl: './notifications-card.css',
})
export class NotificationsCard {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly store = inject(ProfileStore);

  protected readonly form = this.fb.nonNullable.group({
    stockAlerts: [false],
    paymentAlerts: [false],
    chatbotMessages: [false],
  });

  constructor() {
    effect(() => {
      const { stockAlerts, paymentAlerts, chatbotMessages } = this.store.notificationSettings();
      this.form.setValue({ stockAlerts, paymentAlerts, chatbotMessages }, { emitEvent: false });
    });

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.store.updateNotifications(value));
  }
}

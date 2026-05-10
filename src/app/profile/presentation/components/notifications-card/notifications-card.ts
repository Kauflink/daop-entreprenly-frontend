import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProfileStore } from '../../../application/profile-store';

@Component({
  selector: 'app-notifications-card',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notifications-card.html',
  styleUrl: './notifications-card.css',
})
export class NotificationsCard {
  private readonly fb = inject(FormBuilder);
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
  }

  protected onSubmit(): void {
    this.store.updateNotifications(this.form.getRawValue());
  }
}

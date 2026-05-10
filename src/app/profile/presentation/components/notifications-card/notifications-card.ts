import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProfileStore } from '../../../application/profile-store';

@Component({
  selector: 'app-notifications-card',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notifications-card.html',
  styleUrl: './notifications-card.css',
})
export class NotificationsCard implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly store = inject(ProfileStore);

  protected readonly form = this.fb.nonNullable.group({
    stockAlerts: [false],
    paymentAlerts: [false],
    chatbotMessages: [false],
  });

  ngOnInit(): void {
    const { stockAlerts, paymentAlerts, chatbotMessages } = this.store.notificationSettings();
    this.form.setValue({ stockAlerts, paymentAlerts, chatbotMessages });
  }

  protected onSubmit(): void {
    this.store.updateNotifications(this.form.getRawValue());
  }
}

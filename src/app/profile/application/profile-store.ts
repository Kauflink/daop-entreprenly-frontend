import { computed, Injectable, signal } from '@angular/core';
import { UserProfile } from '../domain/model/user-profile.entity';
import { UserPreferences } from '../domain/model/user-preferences.entity';
import { NotificationSettings } from '../domain/model/notification-settings.entity';

@Injectable({ providedIn: 'root' })
export class ProfileStore {
  readonly profile = signal<UserProfile>({
    id: 1,
    firstName: 'Fernando',
    lastName: 'Flores',
    avatarUrl: null,
    role: 'Administrador',
    plan: 'Plan Control',
  });

  readonly preferences = signal<UserPreferences>({
    id: 1,
    language: 'Español (Perú)',
    timezone: 'America/Lima (UTC-05:00)',
    theme: 'light',
  });

  readonly notificationSettings = signal<NotificationSettings>({
    id: 1,
    stockAlerts: false,
    paymentAlerts: false,
    chatbotMessages: false,
  });

  readonly fullName = computed(() => `${this.profile().firstName} ${this.profile().lastName}`);

  readonly roleAndPlan = computed(() => `${this.profile().role} - ${this.profile().plan}`);

  updateProfile(partial: Partial<Omit<UserProfile, 'id'>>): void {
    this.profile.update((p) => ({ ...p, ...partial }));
  }

  updatePreferences(partial: Partial<Omit<UserPreferences, 'id'>>): void {
    this.preferences.update((p) => ({ ...p, ...partial }));
  }

  updateNotifications(partial: Partial<Omit<NotificationSettings, 'id'>>): void {
    this.notificationSettings.update((n) => ({ ...n, ...partial }));
  }
}

import { BaseResource } from '../../shared/infrastructure/base-response';

/** Preferences as returned/accepted by the backend (nested in the profile). */
export interface PreferencesResource {
  language: string;
  timezone: string;
  theme: string;
  currency: string;
}

/** Notification settings as returned/accepted by the backend (nested in the profile). */
export interface NotificationSettingsResource {
  stockAlerts: boolean;
}

/** Profile resource from the backend clean REST contract (camelCase, nested). */
export interface ProfileResource extends BaseResource {
  userId: number;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  plan: string;
  preferences: PreferencesResource;
  notificationSettings: NotificationSettingsResource;
}

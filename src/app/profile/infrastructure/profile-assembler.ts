import { Injectable } from '@angular/core';
import { UserProfile } from '../domain/model/user-profile.entity';
import { UserPreferences, Theme } from '../domain/model/user-preferences.entity';
import { NotificationSettings } from '../domain/model/notification-settings.entity';
import { ProfileResource } from './profile-response';
import { isSupportedCurrency } from '../../shared/infrastructure/currency-service';

/**
 * Converts the backend {@link ProfileResource} into the profile domain models
 * (profile, preferences and notification settings) and back into request payloads.
 */
@Injectable({ providedIn: 'root' })
export class ProfileAssembler {
  toProfile(resource: ProfileResource): UserProfile {
    return {
      id: resource.id,
      firstName: resource.firstName,
      lastName: resource.lastName,
      phone: resource.phone,
      avatarUrl: resource.avatarUrl,
      role: resource.role,
      plan: resource.plan,
    };
  }

  toPreferences(resource: ProfileResource): UserPreferences {
    return {
      id: resource.id,
      language: resource.preferences.language,
      timezone: resource.preferences.timezone,
      theme: (resource.preferences.theme === 'dark' ? 'dark' : 'light') as Theme,
      currency: isSupportedCurrency(resource.preferences.currency)
        ? resource.preferences.currency
        : 'PEN',
    };
  }

  toNotifications(resource: ProfileResource): NotificationSettings {
    return {
      id: resource.id,
      stockAlerts: resource.notificationSettings.stockAlerts,
      paymentAlerts: resource.notificationSettings.paymentAlerts,
      chatbotMessages: resource.notificationSettings.chatbotMessages,
    };
  }
}

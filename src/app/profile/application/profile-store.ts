import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../domain/model/user-profile.entity';
import { UserPreferences } from '../domain/model/user-preferences.entity';
import { NotificationSettings } from '../domain/model/notification-settings.entity';
import {
  NotificationSettingsResource,
  UserPreferencesResource,
  UserProfileResource,
} from '../infrastructure/profile-response';
import {
  Currency,
  CurrencyService,
  isSupportedCurrency,
} from '../../shared/infrastructure/currency-service';

interface ProfileResponse {
  user: UserProfileResource;
  preferences: UserPreferencesResource;
  notification_settings: NotificationSettingsResource;
}

@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private static readStorage(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  private readonly http = inject(HttpClient);
  private readonly translate = inject(TranslateService);
  private readonly currencyAssembler = inject(CurrencyService);
  private readonly profileUrl =
    environment.entreprenlyProviderApiBaseUrl + environment.entreprenlyProviderProfileEndpointPath;

  readonly profile = signal<UserProfile>({
    id: 0,
    firstName: '',
    lastName: '',
    avatarUrl: null,
    role: '',
    plan: '',
  });

  readonly preferences = signal<UserPreferences>({
    id: 0,
    language: ProfileStore.readStorage('entreprenly-lang') ?? '',
    timezone: '',
    theme: (ProfileStore.readStorage('entreprenly-theme') as UserPreferences['theme']) ?? 'light',
    currency: this.readStoredCurrency(),
  });

  readonly notificationSettings = signal<NotificationSettings>({
    id: 0,
    stockAlerts: false,
    paymentAlerts: false,
    chatbotMessages: false,
  });

  readonly fullName = computed(() => `${this.profile().firstName} ${this.profile().lastName}`);

  readonly roleAndPlan = computed(() => `${this.profile().role} - ${this.profile().plan}`);

  constructor() {
    effect(() => {
      const lang = this.preferences().language;
      if (lang) {
        if (lang !== this.translate.currentLang) {
          this.translate.use(lang);
        }
        try {
          localStorage.setItem('entreprenly-lang', lang);
        } catch {}
      }
    });
    effect(() => {
      const theme = this.preferences().theme;
      if (theme) {
        document.documentElement.dataset['theme'] = theme;
        try {
          localStorage.setItem('entreprenly-theme', theme);
        } catch {}
      }
    });
    effect(() => {
      const currency = this.preferences().currency;
      if (currency) {
        this.currencyAssembler.setCurrency(currency);
      }
    });
    this.load();
  }

  load(): void {
    this.http
      .get<ProfileResponse>(this.profileUrl)
      .pipe(
        tap((response) => {
          this.profile.set(this.toProfile(response.user));
          this.preferences.set(this.toPreferences(response.preferences));
          this.notificationSettings.set(this.toNotifications(response.notification_settings));
        }),
        catchError((error) => {
          console.error('Failed to load profile', error);
          return of(null);
        }),
      )
      .subscribe();
  }

  updateProfile(partial: Partial<Omit<UserProfile, 'id'>>): void {
    const updated: UserProfile = { ...this.profile(), ...partial };
    this.profile.set(updated);
    this.persist({ user: this.toUserResource(updated) });
  }

  updatePreferences(partial: Partial<Omit<UserPreferences, 'id'>>): void {
    const updated: UserPreferences = { ...this.preferences(), ...partial };
    this.preferences.set(updated);
    this.persist({ preferences: this.toPreferencesResource(updated) });
  }

  updateNotifications(partial: Partial<Omit<NotificationSettings, 'id'>>): void {
    const updated: NotificationSettings = { ...this.notificationSettings(), ...partial };
    this.notificationSettings.set(updated);
    this.persist({ notification_settings: this.toNotificationsResource(updated) });
  }

  private persist(payload: Partial<ProfileResponse>): void {
    this.http
      .patch(this.profileUrl, payload)
      .pipe(
        catchError((error) => {
          console.error('Failed to persist profile changes', error);
          return of(null);
        }),
      )
      .subscribe();
  }

  private toProfile(r: UserProfileResource): UserProfile {
    return {
      id: r.id,
      firstName: r.first_name,
      lastName: r.last_name,
      avatarUrl: r.avatar_url,
      role: r.role,
      plan: r.plan,
    };
  }

  private toPreferences(r: UserPreferencesResource): UserPreferences {
    const currency = r.currency ?? null;

    return {
      id: r.id,
      language: r.language,
      timezone: r.timezone,
      theme: r.theme,
      currency: isSupportedCurrency(currency) ? currency : 'PEN',
    };
  }

  private toNotifications(r: NotificationSettingsResource): NotificationSettings {
    return {
      id: r.id,
      stockAlerts: r.stock_alerts,
      paymentAlerts: r.payment_alerts,
      chatbotMessages: r.chatbot_messages,
    };
  }

  private toUserResource(e: UserProfile): UserProfileResource {
    return {
      id: e.id,
      first_name: e.firstName,
      last_name: e.lastName,
      avatar_url: e.avatarUrl,
      role: e.role,
      plan: e.plan,
    };
  }

  private toPreferencesResource(e: UserPreferences): UserPreferencesResource {
    return {
      id: e.id,
      language: e.language,
      timezone: e.timezone,
      theme: e.theme,
      currency: e.currency,
    };
  }

  private toNotificationsResource(e: NotificationSettings): NotificationSettingsResource {
    return {
      id: e.id,
      stock_alerts: e.stockAlerts,
      payment_alerts: e.paymentAlerts,
      chatbot_messages: e.chatbotMessages,
    };
  }

  private readStoredCurrency(): Currency {
    const storedCurrency = ProfileStore.readStorage('entreprenly-currency');
    return isSupportedCurrency(storedCurrency) ? storedCurrency : 'PEN';
  }
}

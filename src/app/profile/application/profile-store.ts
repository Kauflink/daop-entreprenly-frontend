import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../domain/model/user-profile.entity';
import { UserPreferences, Theme } from '../domain/model/user-preferences.entity';
import { NotificationSettings } from '../domain/model/notification-settings.entity';
import {
  Currency,
  CurrencyService,
  isSupportedCurrency,
} from '../../shared/infrastructure/currency-service';
import { AuthStore } from '../../auth/application/auth-store';

/** Backend profile resource (clean REST contract, camelCase, nested). */
interface PreferencesResource {
  language: string;
  timezone: string;
  theme: string;
  currency: string;
}
interface NotificationSettingsResource {
  stockAlerts: boolean;
  paymentAlerts: boolean;
  chatbotMessages: boolean;
}
interface ProfileResource {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: string;
  plan: string;
  preferences: PreferencesResource;
  notificationSettings: NotificationSettingsResource;
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
  private readonly authStore = inject(AuthStore);
  private readonly profilesUrl =
    environment.entreprenlyProviderApiBaseUrl + environment.entreprenlyProviderProfilesEndpointPath;

  /** Identifier of the loaded profile, used to target update endpoints. */
  private readonly profileId = signal<number>(0);

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
    theme: (ProfileStore.readStorage('entreprenly-theme') as Theme) ?? 'light',
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
    const userId = this.authStore.userId;
    if (!userId) return;
    this.http
      .get<ProfileResource>(`${this.profilesUrl}?userId=${userId}`)
      .pipe(
        tap((resource) => this.applyResource(resource)),
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
    this.put(`${this.profilesUrl}/${this.profileId()}`, {
      firstName: updated.firstName,
      lastName: updated.lastName,
      avatarUrl: updated.avatarUrl,
    });
  }

  updatePreferences(partial: Partial<Omit<UserPreferences, 'id'>>): void {
    const updated: UserPreferences = { ...this.preferences(), ...partial };
    this.preferences.set(updated);
    this.put(`${this.profilesUrl}/${this.profileId()}/preferences`, {
      language: updated.language,
      timezone: updated.timezone,
      theme: updated.theme,
      currency: updated.currency,
    });
  }

  updateNotifications(partial: Partial<Omit<NotificationSettings, 'id'>>): void {
    const updated: NotificationSettings = { ...this.notificationSettings(), ...partial };
    this.notificationSettings.set(updated);
    this.put(`${this.profilesUrl}/${this.profileId()}/notification-settings`, {
      stockAlerts: updated.stockAlerts,
      paymentAlerts: updated.paymentAlerts,
      chatbotMessages: updated.chatbotMessages,
    });
  }

  private put(url: string, body: unknown): void {
    this.http
      .put<ProfileResource>(url, body)
      .pipe(
        tap((resource) => this.applyResource(resource)),
        catchError((error) => {
          console.error('Failed to persist profile changes', error);
          return of(null);
        }),
      )
      .subscribe();
  }

  private applyResource(resource: ProfileResource): void {
    this.profileId.set(resource.id);
    this.profile.set({
      id: resource.id,
      firstName: resource.firstName,
      lastName: resource.lastName,
      avatarUrl: resource.avatarUrl,
      role: resource.role,
      plan: resource.plan,
    });
    this.preferences.set({
      id: resource.id,
      language: resource.preferences.language,
      timezone: resource.preferences.timezone,
      theme: resource.preferences.theme === 'dark' ? 'dark' : 'light',
      currency: isSupportedCurrency(resource.preferences.currency)
        ? resource.preferences.currency
        : 'PEN',
    });
    this.notificationSettings.set({
      id: resource.id,
      stockAlerts: resource.notificationSettings.stockAlerts,
      paymentAlerts: resource.notificationSettings.paymentAlerts,
      chatbotMessages: resource.notificationSettings.chatbotMessages,
    });
  }

  private readStoredCurrency(): Currency {
    const storedCurrency = ProfileStore.readStorage('entreprenly-currency');
    return isSupportedCurrency(storedCurrency) ? storedCurrency : 'PEN';
  }
}

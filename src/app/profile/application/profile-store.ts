import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../domain/model/user-profile.entity';
import { UserPreferences, Theme } from '../domain/model/user-preferences.entity';
import { NotificationSettings } from '../domain/model/notification-settings.entity';
import { Currency, CurrencyService, isSupportedCurrency } from '../../shared/infrastructure/currency-service';
import { AuthStore } from '../../auth/application/auth-store';
import { ProfileResource } from '../infrastructure/profile-response';
import { ProfileAssembler } from '../infrastructure/profile-assembler';

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
  private readonly assembler = inject(ProfileAssembler);
  private readonly profilesUrl =
    environment.entreprenlyProviderApiBaseUrl + environment.entreprenlyProviderProfilesEndpointPath;

  /** Identifier of the loaded profile, used to target update endpoints. */
  private readonly profileId = signal<number>(0);

  readonly profile = signal<UserProfile>({
    id: 0,
    firstName: '',
    lastName: '',
    phone: null,
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
    // React to authentication changes: load the profile on login, clear it on logout.
    // Without this the root-singleton store keeps the previous user's data after a
    // logout/login until a full page reload.
    effect(() => {
      const user = this.authStore.user();
      if (user) {
        this.load();
      } else {
        this.reset();
      }
    });
  }

  /** Clears the in-memory profile (used on logout / when no user is authenticated). */
  private reset(): void {
    this.profileId.set(0);
    this.profile.set({
      id: 0,
      firstName: '',
      lastName: '',
      phone: null,
      avatarUrl: null,
      role: '',
      plan: '',
    });
    this.notificationSettings.set({
      id: 0,
      stockAlerts: false,
      paymentAlerts: false,
      chatbotMessages: false,
    });
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
      phone: updated.phone,
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
    this.profile.set(this.assembler.toProfile(resource));
    this.preferences.set(this.assembler.toPreferences(resource));
    this.notificationSettings.set(this.assembler.toNotifications(resource));
  }

  private readStoredCurrency(): Currency {
    const storedCurrency = ProfileStore.readStorage('entreprenly-currency');
    return isSupportedCurrency(storedCurrency) ? storedCurrency : 'PEN';
  }
}

import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { UserProfile } from '../domain/model/user-profile.entity';
import { UserPreferences, Theme } from '../domain/model/user-preferences.entity';
import { NotificationSettings } from '../domain/model/notification-settings.entity';
import { Currency, CurrencyService, isSupportedCurrency } from '../../shared/infrastructure/currency-service';
import { AuthStore } from '../../auth/application/auth-store';
import { ProfileResource } from '../infrastructure/profile-response';
import { ProfileAssembler } from '../infrastructure/profile-assembler';
import { ProfileApiService } from '../infrastructure/profile-api.service';

@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private static readStorage(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  private readonly api = inject(ProfileApiService);
  private readonly translate = inject(TranslateService);
  private readonly currencyAssembler = inject(CurrencyService);
  private readonly authStore = inject(AuthStore);
  private readonly assembler = inject(ProfileAssembler);

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
    this.persist(this.api.getByUserId(userId), 'Failed to load profile');
  }

  updateProfile(partial: Partial<Omit<UserProfile, 'id'>>): void {
    const updated: UserProfile = { ...this.profile(), ...partial };
    this.profile.set(updated);
    this.persist(
      this.api.updateProfile(this.profileId(), {
        firstName: updated.firstName,
        lastName: updated.lastName,
        phone: updated.phone,
        avatarUrl: updated.avatarUrl,
      }),
      'Failed to persist profile changes',
    );
  }

  updatePreferences(partial: Partial<Omit<UserPreferences, 'id'>>): void {
    const updated: UserPreferences = { ...this.preferences(), ...partial };
    this.preferences.set(updated);
    this.persist(
      this.api.updatePreferences(this.profileId(), {
        language: updated.language,
        timezone: updated.timezone,
        theme: updated.theme,
        currency: updated.currency,
      }),
      'Failed to persist profile changes',
    );
  }

  updateNotifications(partial: Partial<Omit<NotificationSettings, 'id'>>): void {
    const updated: NotificationSettings = { ...this.notificationSettings(), ...partial };
    this.notificationSettings.set(updated);
    this.persist(
      this.api.updateNotifications(this.profileId(), {
        stockAlerts: updated.stockAlerts,
        paymentAlerts: updated.paymentAlerts,
        chatbotMessages: updated.chatbotMessages,
      }),
      'Failed to persist profile changes',
    );
  }

  private persist(request: Observable<ProfileResource>, errorMessage: string): void {
    request
      .pipe(
        tap((resource) => this.applyResource(resource)),
        catchError((error) => {
          console.error(errorMessage, error);
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

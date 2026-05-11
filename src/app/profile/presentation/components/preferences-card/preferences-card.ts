import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProfileStore } from '../../../application/profile-store';
import { Theme } from '../../../domain/model/user-preferences.entity';

interface LanguageOption {
  code: string;
  label: string;
}

@Component({
  selector: 'app-preferences-card',
  imports: [ReactiveFormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './preferences-card.html',
  styleUrl: './preferences-card.css',
})
export class PreferencesCard {
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);
  protected readonly store = inject(ProfileStore);

  protected readonly languages: LanguageOption[] = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
  ];

  protected readonly timezones = [
    'America/Lima (UTC-05:00)',
    'America/Bogota (UTC-05:00)',
    'America/Mexico_City (UTC-06:00)',
    'America/Sao_Paulo (UTC-03:00)',
    'Europe/Madrid (UTC+01:00)',
  ];

  protected readonly form = this.fb.nonNullable.group({
    language: ['es'],
    timezone: [''],
    theme: ['light' as Theme],
  });

  constructor() {
    effect(() => {
      const { language, timezone, theme } = this.store.preferences();
      this.form.setValue({ language, timezone, theme }, { emitEvent: false });
    });
  }

  protected onLanguageChange(code: string): void {
    this.form.patchValue({ language: code });
    this.translate.use(code);
    this.store.updatePreferences({ language: code });
  }

  protected onTimezoneChange(timezone: string): void {
    this.form.patchValue({ timezone });
    this.store.updatePreferences({ timezone });
  }

  protected setTheme(theme: Theme): void {
    this.form.patchValue({ theme });
    this.store.updatePreferences({ theme });
  }
}

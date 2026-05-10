import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProfileStore } from '../../../application/profile-store';
import { Theme } from '../../../domain/model/user-preferences.entity';

@Component({
  selector: 'app-preferences-card',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './preferences-card.html',
  styleUrl: './preferences-card.css',
})
export class PreferencesCard {
  private readonly fb = inject(FormBuilder);
  protected readonly store = inject(ProfileStore);

  protected readonly languages = [
    'Español (Perú)',
    'Español (México)',
    'English (US)',
    'Português (BR)',
  ];

  protected readonly timezones = [
    'America/Lima (UTC-05:00)',
    'America/Bogota (UTC-05:00)',
    'America/Mexico_City (UTC-06:00)',
    'America/Sao_Paulo (UTC-03:00)',
    'Europe/Madrid (UTC+01:00)',
  ];

  protected readonly form = this.fb.nonNullable.group({
    language: [''],
    timezone: [''],
    theme: ['light' as Theme],
  });

  constructor() {
    effect(() => {
      const { language, timezone, theme } = this.store.preferences();
      this.form.setValue({ language, timezone, theme }, { emitEvent: false });
    });
  }

  protected setTheme(theme: Theme): void {
    this.form.patchValue({ theme });
    this.store.updatePreferences({ theme });
  }

  protected onSubmit(): void {
    const { language, timezone } = this.form.getRawValue();
    this.store.updatePreferences({ language, timezone });
  }
}

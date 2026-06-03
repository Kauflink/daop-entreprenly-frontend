import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../application/auth-store';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="w-full max-w-sm bg-white rounded-xl shadow p-8 space-y-5"
      >
        <h1 class="text-2xl font-semibold text-center">Entreprenly</h1>
        <p class="text-center text-gray-500 text-sm">Inicia sesión</p>

        <div class="space-y-1">
          <label class="text-sm font-medium">Email</label>
          <input
            type="email"
            formControlName="email"
            class="w-full border rounded-lg px-3 py-2"
            placeholder="tu@correo.com"
          />
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium">Contraseña</label>
          <input
            type="password"
            formControlName="password"
            class="w-full border rounded-lg px-3 py-2"
            placeholder="••••••••"
          />
        </div>

        @if (error()) {
          <p class="text-sm text-red-600">{{ error() }}</p>
        }

        <button
          type="submit"
          [disabled]="form.invalid || loading()"
          class="w-full bg-black text-white rounded-lg py-2 disabled:opacity-50"
        >
          {{ loading() ? 'Entrando...' : 'Entrar' }}
        </button>

        <p class="text-center text-sm text-gray-500">
          ¿No tienes cuenta?
          <a routerLink="/register" class="text-black font-medium">Regístrate</a>
        </p>
      </form>
    </div>
  `,
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    this.authStore.signIn(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error.set('Credenciales inválidas');
        this.loading.set(false);
      },
    });
  }
}

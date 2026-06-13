import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../application/auth-store';

interface Benefit {
  title: string;
  copy: string;
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);

  protected readonly benefits: Benefit[] = [
    { title: 'Inventario visible', copy: 'Productos, lotes y alertas quedan listos desde el dashboard.' },
    { title: 'Caja clara', copy: 'Ventas y pagos del turno se revisan desde un solo flujo.' },
    { title: 'Pedidos conectados', copy: 'WhatsApp, stock y seguimiento trabajan con el mismo contexto.' },
    { title: 'Acceso rápido', copy: 'Ingresa con tu cuenta para administrar tu negocio.' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberSession: [true],
  });

  protected submitLogin(): void {
    this.error.set(null);
    this.notice.set(null);
    if (this.form.invalid) {
      this.error.set('Completa correo y contraseña para ingresar.');
      return;
    }
    this.loading.set(true);
    const { email, password } = this.form.getRawValue();
    this.authStore.signIn(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error.set('Credenciales incorrectas.');
        this.loading.set(false);
      },
    });
  }

  protected forgotPassword(): void {
    this.error.set(null);
    this.notice.set('Se simularía el envío de recuperación al correo indicado.');
  }

  protected loginWithGoogle(): void {
    this.error.set(null);
    this.notice.set('Acceso con Google no disponible aún.');
  }
}

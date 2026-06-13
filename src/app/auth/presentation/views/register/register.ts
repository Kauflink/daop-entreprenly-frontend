import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../application/auth-store';

interface Benefit {
  title: string;
  copy: string;
}

const passwordsMatch: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const pwd = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pwd && confirm && pwd !== confirm ? { passwordsMismatch: true } : null;
};

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register.html',
  styleUrl: '../login/login.css',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly errors = signal<string[]>([]);
  protected readonly notice = signal<string | null>(null);

  protected readonly timezones: string[] = [
    'America/Lima (UTC-05:00)',
    'America/Bogota (UTC-05:00)',
    'America/Mexico_City (UTC-06:00)',
    'America/Buenos_Aires (UTC-03:00)',
    'America/Santiago (UTC-04:00)',
    'Europe/Madrid (UTC+01:00)',
    'UTC',
  ];

  protected readonly benefits: Benefit[] = [
    { title: 'Inicio simple', copy: 'Crea tu cuenta en pocos pasos y entra al dashboard.' },
    { title: 'Plan Free listo', copy: 'Tu cuenta arranca con el plan inicial asignado.' },
    { title: 'Operación ordenada', copy: 'La cuenta representa un negocio con inventario, ventas y caja.' },
    { title: 'Acceso inmediato', copy: 'Al registrarte quedas listo para iniciar sesión.' },
  ];

  protected readonly form = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      timezone: [this.timezones[0]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      acceptedTerms: [false, [Validators.requiredTrue]],
    },
    { validators: passwordsMatch },
  );

  protected submitRegister(): void {
    this.notice.set(null);
    const messages: string[] = [];
    if (this.form.get('firstName')?.invalid) messages.push('Ingresa tu nombre.');
    if (this.form.get('lastName')?.invalid) messages.push('Ingresa tu apellido.');
    if (this.form.get('email')?.invalid) messages.push('Ingresa un correo válido.');
    if (this.form.get('password')?.invalid) messages.push('La contraseña debe tener al menos 8 caracteres.');
    if (this.form.hasError('passwordsMismatch')) messages.push('Las contraseñas no coinciden.');
    if (this.form.get('acceptedTerms')?.invalid) messages.push('Debes aceptar los términos.');
    if (messages.length > 0) {
      this.errors.set(messages);
      return;
    }
    this.errors.set([]);
    this.loading.set(true);
    const { email, password, firstName, lastName, phone, timezone } = this.form.getRawValue();
    this.authStore.register({ email, password, firstName, lastName, phone, timezone }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.errors.set(['No se pudo crear la cuenta (el correo ya podría estar registrado).']);
        this.loading.set(false);
      },
    });
  }

  protected registerWithGoogle(): void {
    this.errors.set([]);
    this.notice.set('Registro con Google no disponible aún.');
  }
}

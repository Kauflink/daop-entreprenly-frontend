import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-phone-verify-card',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <h2 class="card__title">Verificar o cambiar número de teléfono</h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
        <div class="field">
          <label for="phone" class="field__label">Número</label>
          <div class="field__row">
            <input
              id="phone"
              type="tel"
              formControlName="phone"
              class="field__input"
              placeholder="+51 999 999 999"
              autocomplete="tel"
            />
            <button
              type="submit"
              class="btn-verify"
              [disabled]="form.invalid"
            >
              Verificar
            </button>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: `
    .card {
      background: #ffffff;
      border: 1px solid #c9c9c9;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.25);
      border-radius: 25px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .card__title {
      font-family: 'Reddit Sans', sans-serif;
      font-weight: 800;
      font-size: 16px;
      line-height: 21px;
      color: #292a2d;
      margin: 0;
    }
    form { display: flex; flex-direction: column; gap: 12px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field__label {
      font-family: 'Reddit Sans', sans-serif;
      font-weight: 800;
      font-size: 12px;
      line-height: 16px;
      color: #65381e;
    }
    .field__row { display: flex; gap: 12px; align-items: center; }
    .field__input {
      flex: 1;
      background: #ffffff;
      border: 1px solid #c9c9c9;
      border-radius: 25px;
      padding: 12px 20px;
      font-family: 'Reddit Sans', sans-serif;
      font-weight: 500;
      font-size: 12px;
      color: #292a2d;
      outline: none;
      transition: border-color 0.2s;
    }
    .field__input::placeholder { color: #8e8f90; }
    .field__input:focus { border-color: #f38313; }
    .btn-verify {
      background: #f38313;
      border: 1px solid #c9c9c9;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.25);
      border-radius: 25px;
      padding: 12px 24px;
      font-family: 'Reddit Sans', sans-serif;
      font-weight: 800;
      font-size: 12px;
      color: #f6e8dc;
      cursor: pointer;
      white-space: nowrap;
      transition: opacity 0.2s;
    }
    .btn-verify:hover:not(:disabled) { opacity: 0.9; }
    .btn-verify:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-verify:focus-visible { outline: 2px solid #65381e; outline-offset: 2px; }
  `,
})
export class PhoneVerifyCard {
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-()]{7,20}$/)]],
  });

  protected onSubmit(): void {
    if (this.form.invalid) return;
    // Verification logic delegated to a future service
  }
}

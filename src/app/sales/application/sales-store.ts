import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of, retry, switchMap } from 'rxjs';
import { CashRegister } from '../domain/model/cash-register.entity';
import { ProductSummary } from '../domain/model/product-summary.entity';
import { SalesApi } from '../infrastructure/sales-api';

@Injectable({ providedIn: 'root' })
export class SalesStore {
  // === ESTADO ===
  private readonly productsSignal = signal<ProductSummary[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly cashRegisterSignal = signal<CashRegister | null>(null);

  // === SIGNALS PÚBLICOS DE LECTURA ===
  readonly products = this.productsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly cashRegister = this.cashRegisterSignal.asReadonly();

  // === COMPUTED ===
  readonly productCount = computed(() => this.products().length);
  readonly totalCash = computed(() => this.cashRegisterSignal()?.totalCash ?? 0);
  readonly totalDigital = computed(() => this.cashRegisterSignal()?.totalDigital ?? 0);
  readonly totalDay = computed(() => this.cashRegisterSignal()?.totalDay ?? 0);

  private readonly salesApi = inject(SalesApi);

  constructor() {
    this.loadProducts();
    this.loadTodayCashRegister();
  }

  private loadProducts(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.salesApi
      .getProducts()
      .pipe(retry(2), takeUntilDestroyed())
      .subscribe({
        next: (products) => {
          console.log('✅ Products loaded:', products);
          this.productsSignal.set(products);
          this.loadingSignal.set(false);
        },
        error: (err) => {
          console.error('❌ Error loading products:', err);
          this.errorSignal.set(this.formatError(err, 'Failed to load products'));
          this.loadingSignal.set(false);
        },
      });
  }

  private loadTodayCashRegister(): void {
    const today = new Date().toISOString().split('T')[0];
    this.salesApi
      .getTodayCashRegister(today)
      .pipe(
        switchMap((register) =>
          register ? of(register) : this.salesApi.createTodayCashRegister(today),
        ),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (register) => this.cashRegisterSignal.set(register),
        error: (err) => console.error('❌ Error loading/creating cash register:', err),
      });
  }

  addSaleToRegister(amount: number, isDigital: boolean): void {
    const current = this.cashRegisterSignal();
    if (!current) return;

    const updated = new CashRegister({
      id: current.id,
      date: current.date,
      totalCash: isDigital
        ? current.totalCash
        : Number((current.totalCash + amount).toFixed(2)),
      totalDigital: isDigital
        ? Number((current.totalDigital + amount).toFixed(2))
        : current.totalDigital,
    });

    this.cashRegisterSignal.set(updated);

    this.salesApi.updateCashRegister(updated).subscribe({
      next: (persisted) => {
        console.log('✅ Cash register updated:', persisted);
        this.cashRegisterSignal.set(persisted);
      },
      error: (err) => {
        console.error('❌ Error updating cash register:', err);
      },
    });
  }

  private formatError(error: unknown, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found')
        ? `${fallback}: Not found`
        : error.message;
    }
    return fallback;
  }
}

import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { retry } from 'rxjs';
import { PaymentMethod } from '../domain/model/payment-method.enum';
import { ProductSummary } from '../domain/model/product-summary.entity';
import { Sale } from '../domain/model/sale.entity';
import { SaleItem } from '../domain/model/sale-item.entity';
import { SaleStatus } from '../domain/model/sale-status.enum';
import { SalesApi } from '../infrastructure/sales-api';

/** Rounds a monetary amount to two decimals to avoid floating-point drift. */
function roundToCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}

@Injectable({ providedIn: 'root' })
export class SalesStore {
  // === ESTADO ===
  private readonly productsSignal = signal<ProductSummary[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly salesSignal = signal<Sale[]>([]);
  private readonly salesLoadingSignal = signal<boolean>(false);
  private readonly selectedDateSignal = signal<string>(
    new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date()),
  );

  // === SIGNALS PÚBLICOS DE LECTURA ===
  readonly products = this.productsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly sales = this.salesSignal.asReadonly();
  readonly salesLoading = this.salesLoadingSignal.asReadonly();
  readonly selectedDate = this.selectedDateSignal.asReadonly();

  // === COMPUTED ===
  readonly productCount = computed(() => this.products().length);
  // Cash summary totals are derived from the real sales of the selected day so that
  // the "Resumen de Caja" always matches the sales history (single source of truth).
  readonly totalCash = computed(() =>
    roundToCents(
      this.salesSignal()
        .filter((sale) => sale.paymentMethod === PaymentMethod.CASH)
        .reduce((sum, sale) => sum + sale.total, 0),
    ),
  );
  readonly totalDigital = computed(() =>
    roundToCents(
      this.salesSignal()
        .filter((sale) => sale.paymentMethod !== PaymentMethod.CASH)
        .reduce((sum, sale) => sum + sale.total, 0),
    ),
  );
  readonly totalDay = computed(() => roundToCents(this.totalCash() + this.totalDigital()));
  readonly saleCount = computed(() => this.salesSignal().length);

  private readonly destroyRef = inject(DestroyRef);
  private readonly salesApi = inject(SalesApi);

  constructor() {
    this.loadProducts();
    this.loadSales();
  }

  /** Loads the sales registered on the currently selected business day, newest first. */
  loadSales(): void {
    this.salesLoadingSignal.set(true);
    this.salesApi
      .getSalesByDate(this.selectedDateSignal())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (sales) => {
          this.salesSignal.set(
            [...sales].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
          );
          this.salesLoadingSignal.set(false);
        },
        error: (err) => {
          console.error('❌ Error loading sales:', err);
          this.salesLoadingSignal.set(false);
        },
      });
  }

  /** Selects a business day and reloads its sales. */
  selectDate(date: string): void {
    this.selectedDateSignal.set(date);
    this.loadSales();
  }

  private todayLocalIso(): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date());
  }

  private reloadSalesIfViewingToday(): void {
    if (this.selectedDateSignal() === this.todayLocalIso()) {
      this.loadSales();
    }
  }

  /** Refetches the product list from the API. Call when the Sales view is (re)entered. */
  reloadProducts(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.salesApi
      .getProducts()
      .pipe(retry(2), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (products) => {
          this.productsSignal.set(products);
          this.loadingSignal.set(false);
        },
        error: (err) => {
          this.errorSignal.set(this.formatError(err, 'Failed to load products'));
          this.loadingSignal.set(false);
        },
      });
  }

  createSale(items: SaleItem[], paymentMethod: PaymentMethod, total: number): void {
    const sale = new Sale({
      id: 0,
      sellerId: 1,
      items,
      total,
      paymentMethod,
      status: SaleStatus.COMPLETED,
      createdAt: new Date(),
      completedAt: new Date(),
    });

    this.salesApi
      .createSale(sale)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          // The backend decrements inventory stock while registering the sale, so we just
          // reload the catalog to reflect the updated stock.
          this.reloadSalesIfViewingToday();
          this.loadProducts();
        },
        error: (err) => console.error('❌ Error persisting sale:', err),
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

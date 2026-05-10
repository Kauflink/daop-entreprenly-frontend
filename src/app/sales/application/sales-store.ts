import { Injectable, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { retry } from 'rxjs';
import { ProductSummary } from '../domain/model/product-summary.entity';
import { SalesApi } from '../infrastructure/sales-api';

@Injectable({ providedIn: 'root' })
export class SalesStore {
  // === ESTADO ===
  private readonly productsSignal = signal<ProductSummary[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // === SIGNALS PÚBLICOS DE LECTURA ===
  readonly products = this.productsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // === COMPUTED ===
  readonly productCount = computed(() => this.products().length);

  constructor(private salesApi: SalesApi) {
    this.loadProducts();
  }

  /**
   * Loads all products from the API.
   */
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

  /**
   * Formats error messages for user-friendly display.
   */
  private formatError(error: any, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found')
        ? `${fallback}: Not found`
        : error.message;
    }
    return fallback;
  }
}

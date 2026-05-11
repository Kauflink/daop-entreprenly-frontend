import { DestroyRef, Injectable, inject } from '@angular/core';
import { computed, Signal, signal } from '@angular/core';
import { Lot } from '../domain/model/lot.entity';
import { UnitProduct } from '../domain/model/unit-product.entity';
import { UnitLot } from '../domain/model/unit-lot.entity';
import { WeightProduct } from '../domain/model/weight-product.entity';
import { WeightLot } from '../domain/model/weight-lot.entity';
import { StockAlert } from '../domain/model/stock-alert.entity';
import { InventoryApi } from '../infrastructure/inventory-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { retry } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryStoreService {

  // ─── Signals ─────────────────────────────────────────────────
  private readonly lotsSignal           = signal<Lot[]>([]);
  private readonly unitLotsSignal       = signal<UnitLot[]>([]);
  private readonly weightLotsSignal     = signal<WeightLot[]>([]);
  private readonly unitProductsSignal   = signal<UnitProduct[]>([]);
  private readonly weightProductsSignal = signal<WeightProduct[]>([]);
  private readonly stockAlertsSignal    = signal<StockAlert[]>([]);
  private readonly loadingSignal        = signal<boolean>(false);
  private readonly errorSignal          = signal<string | null>(null);

  // ─── Public Readonly ─────────────────────────────────────────
  readonly lots           = this.lotsSignal.asReadonly();
  readonly unitLots       = this.unitLotsSignal.asReadonly();
  readonly weightLots     = this.weightLotsSignal.asReadonly();
  readonly unitProducts   = this.unitProductsSignal.asReadonly();
  readonly weightProducts = this.weightProductsSignal.asReadonly();
  readonly loading        = this.loadingSignal.asReadonly();
  readonly error          = this.errorSignal.asReadonly();
  readonly stockAlerts    = this.stockAlertsSignal.asReadonly();

  // ─── Computed ────────────────────────────────────────────────
  readonly lotCount           = computed(() => this.lots().length);
  readonly unitLotCount       = computed(() => this.unitLots().length);
  readonly weightLotCount     = computed(() => this.weightLots().length);
  readonly unitProductCount   = computed(() => this.unitProducts().length);
  readonly weightProductCount = computed(() => this.weightProducts().length);
  readonly stockAlertCount    = computed(() => this.stockAlerts().length);

  private readonly destroyRef = inject(DestroyRef);

  constructor(private inventoryApi: InventoryApi) {
    this.loadLots();
    this.loadUnitLots();
    this.loadWeightLots();
    this.loadUnitProducts();
    this.loadWeightProducts();
    this.loadStockAlerts();
  }

  // ─── Getters by ID ───────────────────────────────────────────
  getLotById(id: number | null | undefined): Signal<Lot | undefined> {
    return computed(() => id ? this.lots().find(l => l.id === id) : undefined);
  }

  getUnitLotById(id: number | null | undefined): Signal<UnitLot | undefined> {
    return computed(() => id ? this.unitLots().find(l => l.id === id) : undefined);
  }

  getWeightLotById(id: number | null | undefined): Signal<WeightLot | undefined> {
    return computed(() => id ? this.weightLots().find(l => l.id === id) : undefined);
  }

  getUnitProductById(id: number | null | undefined): Signal<UnitProduct | undefined> {
    return computed(() => id ? this.unitProducts().find(p => p.id === id) : undefined);
  }

  getWeightProductById(id: number | null | undefined): Signal<WeightProduct | undefined> {
    return computed(() => id ? this.weightProducts().find(p => p.id === id) : undefined);
  }

  getStockAlertById(id: number | null | undefined): Signal<StockAlert | undefined> {
    return computed(() => id ? this.stockAlerts().find(a => a.id === id) : undefined);
  }

  // ─── Unit Lots CRUD ──────────────────────────────────────────
  addUnitLot(lot: UnitLot): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.inventoryApi.createUnitLot(lot).pipe(retry(2)).subscribe({
      next: created => {
        this.unitLotsSignal.update(lots => {
          const exists = lots.some(l => l.id === created.id);
          return exists ? lots : [...lots, created];
        });
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to create unit lot'));
        this.loadingSignal.set(false);
      }
    });
  }

  updateUnitLot(lot: UnitLot): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.inventoryApi.updateUnitLot(lot).pipe(retry(2)).subscribe({
      next: updated => {
        this.unitLotsSignal.update(lots => lots.map(l => l.id === updated.id ? updated : l));
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to update unit lot'));
        this.loadingSignal.set(false);
      }
    });
  }

  deleteUnitLot(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.inventoryApi.deleteUnitLot(id).pipe(retry(2)).subscribe({
      next: () => {
        this.unitLotsSignal.update(lots => lots.filter(l => l.id !== id));
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to delete unit lot'));
        this.loadingSignal.set(false);
      }
    });
  }

  // ─── Weight Lots CRUD ────────────────────────────────────────
  addWeightLot(lot: WeightLot): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.inventoryApi.createWeightLot(lot).pipe(retry(2)).subscribe({
      next: created => {
        this.weightLotsSignal.update(lots => {
          const exists = lots.some(l => l.id === created.id);
          return exists ? lots : [...lots, created];
        });
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to create weight lot'));
        this.loadingSignal.set(false);
      }
    });
  }

  updateWeightLot(lot: WeightLot): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.inventoryApi.updateWeightLot(lot).pipe(retry(2)).subscribe({
      next: updated => {
        this.weightLotsSignal.update(lots => lots.map(l => l.id === updated.id ? updated : l));
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to update weight lot'));
        this.loadingSignal.set(false);
      }
    });
  }

  deleteWeightLot(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.inventoryApi.deleteWeightLot(id).pipe(retry(2)).subscribe({
      next: () => {
        this.weightLotsSignal.update(lots => lots.filter(l => l.id !== id));
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to delete weight lot'));
        this.loadingSignal.set(false);
      }
    });
  }

  // ─── Unit Products CRUD ──────────────────────────────────────
  addUnitProduct(product: UnitProduct): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.inventoryApi.createUnitProduct(product).pipe(retry(2)).subscribe({
      next: created => {
        this.unitProductsSignal.update(products => [...products, created]);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to create unit product'));
        this.loadingSignal.set(false);
      }
    });
  }

  updateUnitProduct(product: UnitProduct): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.inventoryApi.updateUnitProduct(product).pipe(retry(2)).subscribe({
      next: updated => {
        this.unitProductsSignal.update(products => products.map(p => p.id === updated.id ? updated : p));
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to update unit product'));
        this.loadingSignal.set(false);
      }
    });
  }

  deleteUnitProduct(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.inventoryApi.deleteUnitProduct(id).pipe(retry(2)).subscribe({
      next: () => {
        this.unitProductsSignal.update(products => products.filter(p => p.id !== id));
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to delete unit product'));
        this.loadingSignal.set(false);
      }
    });
  }

  // ─── Weight Products CRUD ────────────────────────────────────
  addWeightProduct(product: WeightProduct): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.inventoryApi.createWeightProduct(product).pipe(retry(2)).subscribe({
      next: created => {
        this.weightProductsSignal.update(products => [...products, created]);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to create weight product'));
        this.loadingSignal.set(false);
      }
    });
  }

  updateWeightProduct(product: WeightProduct): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.inventoryApi.updateWeightProduct(product).pipe(retry(2)).subscribe({
      next: updated => {
        this.weightProductsSignal.update(products => products.map(p => p.id === updated.id ? updated : p));
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to update weight product'));
        this.loadingSignal.set(false);
      }
    });
  }

  deleteWeightProduct(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.inventoryApi.deleteWeightProduct(id).pipe(retry(2)).subscribe({
      next: () => {
        this.weightProductsSignal.update(products => products.filter(p => p.id !== id));
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to delete weight product'));
        this.loadingSignal.set(false);
      }
    });
  }

  // ─── Stock Alerts CRUD ───────────────────────────────────────
  addStockAlert(alert: StockAlert): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.inventoryApi.createStockAlert(alert).pipe(retry(2)).subscribe({
      next: created => {
        this.stockAlertsSignal.update(alerts => [...alerts, created]);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to create stock alert'));
        this.loadingSignal.set(false);
      }
    });
  }

  updateStockAlert(alert: StockAlert): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.inventoryApi.updateStockAlert(alert).pipe(retry(2)).subscribe({
      next: updated => {
        this.stockAlertsSignal.update(alerts => alerts.map(a => a.id === updated.id ? updated : a));
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to update stock alert'));
        this.loadingSignal.set(false);
      }
    });
  }

  deleteStockAlert(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.inventoryApi.deleteStockAlert(id).pipe(retry(2)).subscribe({
      next: () => {
        this.stockAlertsSignal.update(alerts => alerts.filter(a => a.id !== id));
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to delete stock alert'));
        this.loadingSignal.set(false);
      }
    });
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  // ─── Private Loaders ─────────────────────────────────────────
  private loadLots(): void {
    this.loadingSignal.set(true);
    this.inventoryApi.getLots().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: lots => { this.lotsSignal.set(lots); this.loadingSignal.set(false); },
      error: err => { this.errorSignal.set(this.formatError(err, 'Failed to load lots')); this.loadingSignal.set(false); }
    });
  }

  private loadUnitLots(): void {
    this.loadingSignal.set(true);
    this.inventoryApi.getUnitLots().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: lots => {
        const unique = lots.filter((lot, i, self) => i === self.findIndex(l => l.id === lot.id));
        this.unitLotsSignal.set(unique);
        this.loadingSignal.set(false);
      },
      error: err => { this.errorSignal.set(this.formatError(err, 'Failed to load unit lots')); this.loadingSignal.set(false); }
    });
  }

  private loadWeightLots(): void {
    this.loadingSignal.set(true);
    this.inventoryApi.getWeightLots().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: lots => {
        const unique = lots.filter((lot, i, self) => i === self.findIndex(l => l.id === lot.id));
        this.weightLotsSignal.set(unique);
        this.loadingSignal.set(false);
      },
      error: err => { this.errorSignal.set(this.formatError(err, 'Failed to load weight lots')); this.loadingSignal.set(false); }
    });
  }

  private loadUnitProducts(): void {
    this.loadingSignal.set(true);
    this.inventoryApi.getUnitProducts().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: products => { this.unitProductsSignal.set(products); this.loadingSignal.set(false); },
      error: err => { this.errorSignal.set(this.formatError(err, 'Failed to load unit products')); this.loadingSignal.set(false); }
    });
  }

  private loadWeightProducts(): void {
    this.loadingSignal.set(true);
    this.inventoryApi.getWeightProducts().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: products => { this.weightProductsSignal.set(products); this.loadingSignal.set(false); },
      error: err => { this.errorSignal.set(this.formatError(err, 'Failed to load weight products')); this.loadingSignal.set(false); }
    });
  }

  private loadStockAlerts(): void {
    this.loadingSignal.set(true);
    this.inventoryApi.getStockAlerts().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: alerts => { this.stockAlertsSignal.set(alerts); this.loadingSignal.set(false); },
      error: err => { this.errorSignal.set(this.formatError(err, 'Failed to load stock alerts')); this.loadingSignal.set(false); }
    });
  }

  private formatError(error: unknown, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found') ? `${fallback}: Not found` : error.message;
    }
    return fallback;
  }
}

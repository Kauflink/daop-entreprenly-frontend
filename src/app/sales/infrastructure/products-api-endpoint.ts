import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ProductSummary } from '../domain/model/product-summary.entity';
import { ProductAssembler } from './product-assembler';
import {
  UnitLotResource,
  UnitProductResource,
  WeightLotResource,
  WeightProductResource,
} from './products-response';

const BASE = environment.entreprenlyProviderApiBaseUrl;

export class ProductsApiEndpoint {
  private readonly assembler = new ProductAssembler();

  private readonly unitProductsUrl =
    `${BASE}${environment.entreprenlyProviderInventoryUnitProductsEndpointPath}`;
  private readonly weightProductsUrl =
    `${BASE}${environment.entreprenlyProviderInventoryWeightProductsEndpointPath}`;
  private readonly unitLotsUrl =
    `${BASE}${environment.entreprenlyProviderInventoryUnitLotsEndpointPath}`;
  private readonly weightLotsUrl =
    `${BASE}${environment.entreprenlyProviderInventoryWeightLotsEndpointPath}`;

  constructor(private readonly http: HttpClient) {}

  // ===== Stock Decrement (FIFO across lots) =====

  decrementUnitStock(productId: number, quantity: number): Observable<void> {
    return this.http.get<UnitLotResource[]>(`${this.unitLotsUrl}?productId=${productId}`).pipe(
      switchMap((lots) => {
        const sorted = [...lots].sort(
          (a, b) => new Date(a.entryDate ?? 0).getTime() - new Date(b.entryDate ?? 0).getTime(),
        );
        const patches = this.buildUnitPatches(sorted, quantity);
        if (patches.length === 0) return of(void 0);
        return forkJoin(
          patches.map((p) =>
            this.http.patch(`${this.unitLotsUrl}/${p.id}`, { quantity: p.newQty }),
          ),
        ).pipe(map(() => void 0));
      }),
      catchError((err) => {
        throw new Error(`Failed to decrement unit stock: ${err.message}`);
      }),
    );
  }

  decrementWeightStock(inventoryProductId: number, quantityKg: number): Observable<void> {
    return this.http.get<WeightLotResource[]>(`${this.weightLotsUrl}?productId=${inventoryProductId}`).pipe(
      switchMap((lots) => {
        const sorted = [...lots].sort(
          (a, b) => new Date(a.entryDate ?? 0).getTime() - new Date(b.entryDate ?? 0).getTime(),
        );
        const patches = this.buildWeightPatches(sorted, quantityKg);
        if (patches.length === 0) return of(void 0);
        return forkJoin(
          patches.map((p) =>
            this.http.patch(`${this.weightLotsUrl}/${p.id}`, { quantityKg: p.newQty }),
          ),
        ).pipe(map(() => void 0));
      }),
      catchError((err) => {
        throw new Error(`Failed to decrement weight stock: ${err.message}`);
      }),
    );
  }

  private buildUnitPatches(
    lots: UnitLotResource[],
    toReduce: number,
  ): { id: number; newQty: number }[] {
    const patches: { id: number; newQty: number }[] = [];
    let remaining = toReduce;
    for (const lot of lots) {
      if (remaining <= 0) break;
      const take = Math.min(lot.quantity, remaining);
      if (take > 0) {
        patches.push({ id: lot.id, newQty: lot.quantity - take });
        remaining -= take;
      }
    }
    return patches;
  }

  private buildWeightPatches(
    lots: WeightLotResource[],
    toReduce: number,
  ): { id: number; newQty: number }[] {
    const patches: { id: number; newQty: number }[] = [];
    let remaining = toReduce;
    for (const lot of lots) {
      if (remaining <= 0) break;
      const take = Math.min(lot.quantityKg, remaining);
      if (take > 0) {
        patches.push({ id: lot.id, newQty: Number((lot.quantityKg - take).toFixed(3)) });
        remaining = Number((remaining - take).toFixed(3));
      }
    }
    return patches;
  }

  getAll(): Observable<ProductSummary[]> {
    return forkJoin({
      unitProducts: this.http.get<UnitProductResource[]>(this.unitProductsUrl),
      weightProducts: this.http.get<WeightProductResource[]>(this.weightProductsUrl),
      unitLots: this.http.get<UnitLotResource[]>(this.unitLotsUrl),
      weightLots: this.http.get<WeightLotResource[]>(this.weightLotsUrl),
    }).pipe(
      map(({ unitProducts, weightProducts, unitLots, weightLots }) => {
        const units = unitProducts.map((p) =>
          this.assembler.toEntityFromUnitResource(p, unitLots),
        );
        const weights = weightProducts.map((p) =>
          this.assembler.toEntityFromWeightResource(p, weightLots),
        );
        return [...units, ...weights];
      }),
      catchError((err) => {
        throw new Error(`Failed to fetch products: ${err.message}`);
      }),
    );
  }
}

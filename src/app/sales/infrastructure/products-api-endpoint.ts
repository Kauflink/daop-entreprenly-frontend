import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
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

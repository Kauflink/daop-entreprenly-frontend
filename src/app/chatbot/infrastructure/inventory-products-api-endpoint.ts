import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InventoryProduct } from '../domain/model/inventory-product.entity';

export class InventoryProductsApiEndpoint {
  private readonly unitUrl = `${environment.entreprenlyProviderApiBaseUrl}${environment.entreprenlyProviderInventoryUnitProductsEndpointPath}`;
  private readonly weightUrl = `${environment.entreprenlyProviderApiBaseUrl}${environment.entreprenlyProviderInventoryWeightProductsEndpointPath}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<InventoryProduct[]> {
    return forkJoin({
      unit: this.http.get<any[]>(this.unitUrl),
      weight: this.http.get<any[]>(this.weightUrl),
    }).pipe(
      map(({ unit, weight }) => {
        const unitProducts: InventoryProduct[] = (unit ?? []).map((p: any) => ({
          id: p.id,
          name: p.name,
          unitPrice: p.unitPrice,
          isWeighted: false,
          availableStock: p.availableStock ?? 0,
        }));
        const weightProducts: InventoryProduct[] = (weight ?? []).map((p: any) => ({
          id: p.id + 1000,
          name: p.name,
          unitPrice: p.unitPrice,
          isWeighted: true,
          availableStock: p.availableStock ?? 0,
        }));
        return [...unitProducts, ...weightProducts];
      }),
    );
  }
}

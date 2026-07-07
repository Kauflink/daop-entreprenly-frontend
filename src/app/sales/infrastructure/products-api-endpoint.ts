import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ProductSummary } from '../domain/model/product-summary.entity';
import { ProductAssembler } from './product-assembler';
import { SalesProductResource } from './products-response';

const BASE = environment.entreprenlyProviderApiBaseUrl;

export class ProductsApiEndpoint {
  private readonly assembler = new ProductAssembler();

  private readonly salesProductsUrl =
    `${BASE}${environment.entreprenlyProviderSalesProductsEndpointPath}`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Fetches the sellable catalog in a single request. The backend (Sales BC) returns each
   * product with its stock already computed by the Inventory context, so the client no longer
   * composes products and lots itself.
   */
  getAll(): Observable<ProductSummary[]> {
    return this.http.get<SalesProductResource[]>(this.salesProductsUrl).pipe(
      map((products) =>
        products.map((product, index) => this.assembler.toEntityFromSalesProduct(product, index)),
      ),
      catchError((err) => {
        throw new Error(`Failed to fetch products: ${err.message}`);
      }),
    );
  }
}

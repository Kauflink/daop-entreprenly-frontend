import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { ProductSummary } from '../domain/model/product-summary.entity';
import { ProductResource, ProductsResponse } from './products-response';
import { ProductAssembler } from './product-assembler';
import { environment } from '../../../environments/environment';

export class ProductsApiEndpoint extends BaseApiEndpoint<
  ProductSummary,
  ProductResource,
  ProductsResponse,
  ProductAssembler
> {
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.salesProviderApiBaseUrl}${environment.salesProviderProductsEndpointPath}`,
      new ProductAssembler(),
    );
  }
}

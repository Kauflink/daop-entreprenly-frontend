import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {Product} from '../domain/model/product.entity';
import {ProductsResponse, ProductResource} from './products-response';
import {ProductAssembler} from './product-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
export class ProductsApiEndpoint extends BaseApiEndpoint<Product, ProductResource, ProductsResponse, ProductAssembler> {
  /**
   * Creates an instance of ProductsApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor(http: HttpClient) {
    super(http, `${environment.entreprenlyProviderApiBaseUrl}${environment.entreprenlyProviderInventoryProductsEndpointPath}`,
      new ProductAssembler());
  }
}

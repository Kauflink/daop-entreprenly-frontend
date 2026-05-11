import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {UnitProduct} from '../domain/model/unit-product.entity';
import {UnitProductResource, UnitProductsResponse} from './unit-product-response';
import {UnitProductAssembler} from './unit-product-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
export class UnitProductsApiEndpoint extends BaseApiEndpoint<UnitProduct, UnitProductResource, UnitProductsResponse, UnitProductAssembler>{
  /**
   * Creates an instance of UnitProductsApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor(http: HttpClient) {
    super(http, `${environment.entreprenlyProviderApiBaseUrl}${environment.entreprenlyProviderInventoryUnitProductsEndpointPath}`,
      new UnitProductAssembler());
  }
}

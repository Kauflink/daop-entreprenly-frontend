import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {WeightProduct} from '../domain/model/weight-product.entity';
import {WeightProductResource, WeightProductsResponse} from './weight-product-response';
import {WeightProductAssembler} from './weight-product-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
export class WeightProductsApiEndpoint extends BaseApiEndpoint<WeightProduct, WeightProductResource, WeightProductsResponse, WeightProductAssembler>{

  constructor(http: HttpClient) {
    super(http, `${environment.entreprenlyProviderApiBaseUrl}${environment.entreprenlyProviderInventoryWeightProductsEndpointPath}`,
      new WeightProductAssembler());
  }
}

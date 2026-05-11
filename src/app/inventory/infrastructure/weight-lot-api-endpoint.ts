import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {WeightLot} from '../domain/model/weight-lot.entity';
import {WeightLotResource, WeightLotsResponse} from './weight-lot-response';
import {WeightLotAssembler} from './weight-lot-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
export class WeightLotsApiEndpoint extends BaseApiEndpoint<WeightLot, WeightLotResource, WeightLotsResponse, WeightLotAssembler>{
  /**
   * Creates an instance of WeightLotsApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor(http: HttpClient) {
    super(http, `${environment.entreprenlyProviderApiBaseUrl}${environment.entreprenlyProviderInventoryWeightLotsEndpointPath}`,
      new WeightLotAssembler());
  }
}

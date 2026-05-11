import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {Lot} from '../domain/model/lot.entity';
import {LotResource, LotsResponse} from './lots-response';
import {LotAssembler} from './lot-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
export class LotsApiEndpoint extends BaseApiEndpoint<Lot, LotResource, LotsResponse, LotAssembler>{
  /**
   * Creates an instance of LotsApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor(http: HttpClient) {
    super(http, `${environment.entreprenlyProviderApiBaseUrl}${environment.entreprenlyProviderInventoryLotsEndpointPath}`,
      new LotAssembler());
  }
}

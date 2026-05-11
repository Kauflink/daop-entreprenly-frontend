import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {UnitLot} from '../domain/model/unit-lot.entity';
import {UnitLotResource, UnitLotsResponse} from './unit-lot-response';
import {UnitLotAssembler} from './unit-lot-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
export class UnitLotsApiEndpoint extends BaseApiEndpoint<UnitLot, UnitLotResource, UnitLotsResponse, UnitLotAssembler>{
  /**
   * Creates an instance of UnittLotsApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor(http: HttpClient) {
    super(http, `${environment.entreprenlyProviderApiBaseUrl}${environment.entreprenlyProviderInventoryUnitLotsEndpointPath}`,
      new UnitLotAssembler());
  }
}

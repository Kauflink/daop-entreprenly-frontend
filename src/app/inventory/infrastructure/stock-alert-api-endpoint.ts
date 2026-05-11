import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { StockAlert } from '../domain/model/stock-alert.entity';
import { StockAlertsResponse, StockAlertResource } from './stock-alert-response';
import { StockAlertAssembler } from './stock-alert-assembler';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export class StockAlertsApiEndpoint extends BaseApiEndpoint<StockAlert, StockAlertResource, StockAlertsResponse, StockAlertAssembler> {

  constructor(http: HttpClient) {
    super(
      http,
      `${environment.entreprenlyProviderApiBaseUrl}${environment.entreprenlyProviderInventoryStockAlertsEndpointPath}`,
      new StockAlertAssembler()
    );
  }
}

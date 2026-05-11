import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Sale } from '../domain/model/sale.entity';
import { SaleAssembler } from './sale-assembler';
import { SaleResource, SalesResponse } from './sales-response';

export class SalesApiEndpoint extends BaseApiEndpoint<
  Sale,
  SaleResource,
  SalesResponse,
  SaleAssembler
> {
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.entreprenlyProviderApiBaseUrl}${environment.entreprenlyProviderSalesEndpointPath}`,
      new SaleAssembler(),
    );
  }

  createSale(sale: Sale): Observable<Sale> {
    return this.http
      .post<SaleResource>(this.endpointUrl, this.assembler.toResourceFromEntity(sale))
      .pipe(
        map((created) => this.assembler.toEntityFromResource(created)),
        catchError(this.handleError('Failed to create sale')),
      );
  }
}

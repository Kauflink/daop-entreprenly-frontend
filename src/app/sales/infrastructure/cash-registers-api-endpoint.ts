import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { CashRegister } from '../domain/model/cash-register.entity';
import { CashRegisterAssembler } from './cash-register-assembler';
import { CashRegisterResource, CashRegistersResponse } from './cash-register-response';
import { environment } from '../../../environments/environment';

export class CashRegistersApiEndpoint extends BaseApiEndpoint<
  CashRegister,
  CashRegisterResource,
  CashRegistersResponse,
  CashRegisterAssembler
> {
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.entreprenlyProviderApiBaseUrl}${environment.entreprenlyProviderCashRegistersEndpointPath}`,
      new CashRegisterAssembler(),
    );
  }

  getByDate(date: string): Observable<CashRegister | null> {
    return this.http
      .get<CashRegisterResource[]>(`${this.endpointUrl}?date=${date}`)
      .pipe(
        map((resources) =>
          resources.length > 0 ? this.assembler.toEntityFromResource(resources[0]) : null,
        ),
        catchError(this.handleError('Failed to fetch cash register by date')),
      );
  }

  createForDate(date: string): Observable<CashRegister> {
    return this.http
      .post<CashRegisterResource>(this.endpointUrl, { date, totalCash: 0, totalDigital: 0 })
      .pipe(
        map((created) => this.assembler.toEntityFromResource(created)),
        catchError(this.handleError('Failed to create cash register')),
      );
  }
}

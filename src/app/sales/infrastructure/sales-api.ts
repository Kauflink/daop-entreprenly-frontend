import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { ProductSummary } from '../domain/model/product-summary.entity';
import { CashRegister } from '../domain/model/cash-register.entity';
import { CashRegistersApiEndpoint } from './cash-registers-api-endpoint';
import { ProductsApiEndpoint } from './products-api-endpoint';
import { environment } from '../../../environments/environment';

export interface ScaleStatus {
  id: number;
  connected: boolean;
  deviceId: string;
}

@Injectable({ providedIn: 'root' })
export class SalesApi extends BaseApi {
  private readonly productsEndpoint: ProductsApiEndpoint;
  private readonly cashRegistersEndpoint: CashRegistersApiEndpoint;
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    super();
    this.http = http;
    this.productsEndpoint = new ProductsApiEndpoint(http);
    this.cashRegistersEndpoint = new CashRegistersApiEndpoint(http);
  }

  getProducts(): Observable<ProductSummary[]> {
    return this.productsEndpoint.getAll();
  }

  getProduct(id: number): Observable<ProductSummary> {
    return this.productsEndpoint.getById(id);
  }

  getScaleStatus(): Observable<ScaleStatus> {
    return this.http.get<ScaleStatus>(`${environment.salesProviderApiBaseUrl}/iot-scale`);
  }

  getTodayCashRegister(date: string): Observable<CashRegister | null> {
    return this.cashRegistersEndpoint.getByDate(date);
  }

  createTodayCashRegister(date: string): Observable<CashRegister> {
    return this.cashRegistersEndpoint.createForDate(date);
  }

  updateCashRegister(register: CashRegister): Observable<CashRegister> {
    return this.cashRegistersEndpoint.update(register, register.id);
  }
}

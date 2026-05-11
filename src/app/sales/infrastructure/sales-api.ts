import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Sale } from '../domain/model/sale.entity';
import { ProductSummary } from '../domain/model/product-summary.entity';
import { CashRegister } from '../domain/model/cash-register.entity';
import { CashRegistersApiEndpoint } from './cash-registers-api-endpoint';
import { ProductsApiEndpoint } from './products-api-endpoint';
import { SalesApiEndpoint } from './sales-api-endpoint';
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
  private readonly salesEndpoint: SalesApiEndpoint;
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    super();
    this.http = http;
    this.productsEndpoint = new ProductsApiEndpoint(http);
    this.cashRegistersEndpoint = new CashRegistersApiEndpoint(http);
    this.salesEndpoint = new SalesApiEndpoint(http);
  }

  getProducts(): Observable<ProductSummary[]> {
    return this.productsEndpoint.getAll();
  }

getSales(): Observable<Sale[]> {
    return this.salesEndpoint.getAll();
  }

  createSale(sale: Sale): Observable<Sale> {
    return this.salesEndpoint.createSale(sale);
  }

  getScaleStatus(): Observable<ScaleStatus> {
    return this.http.get<ScaleStatus>(`${environment.entreprenlyProviderApiBaseUrl}/iot-scale`);
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

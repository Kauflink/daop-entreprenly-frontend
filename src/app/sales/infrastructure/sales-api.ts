import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Sale } from '../domain/model/sale.entity';
import { ProductSummary } from '../domain/model/product-summary.entity';
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
  private readonly salesEndpoint: SalesApiEndpoint;
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    super();
    this.http = http;
    this.productsEndpoint = new ProductsApiEndpoint(http);
    this.salesEndpoint = new SalesApiEndpoint(http);
  }

  getProducts(): Observable<ProductSummary[]> {
    return this.productsEndpoint.getAll();
  }

  getSales(): Observable<Sale[]> {
    return this.salesEndpoint.getAll();
  }

  getSalesByDate(date: string): Observable<Sale[]> {
    return this.salesEndpoint.getByDate(date);
  }

  createSale(sale: Sale): Observable<Sale> {
    return this.salesEndpoint.createSale(sale);
  }

  getScaleStatus(): Observable<ScaleStatus> {
    return this.http.get<ScaleStatus>(`${environment.entreprenlyProviderApiBaseUrl}/iot-scale`);
  }
}

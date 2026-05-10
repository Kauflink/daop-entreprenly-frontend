import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { ProductSummary } from '../domain/model/product-summary.entity';
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
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    super();
    this.http = http;
    this.productsEndpoint = new ProductsApiEndpoint(http);
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
}

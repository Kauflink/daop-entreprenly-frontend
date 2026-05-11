import { Injectable } from '@angular/core';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Lot } from '../domain/model/lot.entity';
import { UnitLot } from '../domain/model/unit-lot.entity';
import { WeightLot } from '../domain/model/weight-lot.entity';
import { UnitProduct } from '../domain/model/unit-product.entity';
import { WeightProduct } from '../domain/model/weight-product.entity';
import { HttpClient } from '@angular/common/http';
import { LotsApiEndpoint } from './lots-api-endpoint';
import { UnitLotsApiEndpoint } from './unit-lot-api-endpoint';
import { WeightLotsApiEndpoint } from './weight-lot-api-endpoint';
import { UnitProductsApiEndpoint } from './unit-products-api-endpoint';
import { WeightProductsApiEndpoint } from './weight-products-api-endpoint';
import { StockAlert } from '../domain/model/stock-alert.entity';
import { StockAlertsApiEndpoint } from './stock-alert-api-endpoint';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryApi extends BaseApi {
  private readonly lotsEndpoint:           LotsApiEndpoint;
  private readonly unitLotsEndpoint:       UnitLotsApiEndpoint;
  private readonly weightLotsEndpoint:     WeightLotsApiEndpoint;
  private readonly unitProductsEndpoint:   UnitProductsApiEndpoint;
  private readonly weightProductsEndpoint: WeightProductsApiEndpoint;
  private readonly stockAlertsEndpoint:    StockAlertsApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.lotsEndpoint           = new LotsApiEndpoint(http);
    this.unitLotsEndpoint       = new UnitLotsApiEndpoint(http);
    this.weightLotsEndpoint     = new WeightLotsApiEndpoint(http);
    this.unitProductsEndpoint   = new UnitProductsApiEndpoint(http);
    this.weightProductsEndpoint = new WeightProductsApiEndpoint(http);
    this.stockAlertsEndpoint    = new StockAlertsApiEndpoint(http);
  }

  // ─── Lots ────────────────────────────────────────────────────
  getLots(): Observable<Lot[]>            { return this.lotsEndpoint.getAll(); }
  getLot(id: number): Observable<Lot>     { return this.lotsEndpoint.getById(id); }
  createLot(lot: Lot): Observable<Lot>    { return this.lotsEndpoint.create(lot); }
  updateLot(lot: Lot): Observable<Lot>    { return this.lotsEndpoint.update(lot, lot.id); }
  deleteLot(id: number): Observable<void> { return this.lotsEndpoint.delete(id); }

  // ─── Unit Lots ───────────────────────────────────────────────
  getUnitLots(): Observable<UnitLot[]>               { return this.unitLotsEndpoint.getAll(); }
  getUnitLot(id: number): Observable<UnitLot>        { return this.unitLotsEndpoint.getById(id); }
  createUnitLot(lot: UnitLot): Observable<UnitLot>   { return this.unitLotsEndpoint.create(lot); }
  updateUnitLot(lot: UnitLot): Observable<UnitLot>   { return this.unitLotsEndpoint.update(lot, lot.id); }
  deleteUnitLot(id: number): Observable<void>        { return this.unitLotsEndpoint.delete(id); }

  // ─── Weight Lots ─────────────────────────────────────────────
  getWeightLots(): Observable<WeightLot[]>                 { return this.weightLotsEndpoint.getAll(); }
  getWeightLot(id: number): Observable<WeightLot>          { return this.weightLotsEndpoint.getById(id); }
  createWeightLot(lot: WeightLot): Observable<WeightLot>   { return this.weightLotsEndpoint.create(lot); }
  updateWeightLot(lot: WeightLot): Observable<WeightLot>   { return this.weightLotsEndpoint.update(lot, lot.id); }
  deleteWeightLot(id: number): Observable<void>            { return this.weightLotsEndpoint.delete(id); }

  // ─── Unit Products ───────────────────────────────────────────
  getUnitProducts(): Observable<UnitProduct[]>                   { return this.unitProductsEndpoint.getAll(); }
  getUnitProduct(id: number): Observable<UnitProduct>            { return this.unitProductsEndpoint.getById(id); }
  createUnitProduct(p: UnitProduct): Observable<UnitProduct>     { return this.unitProductsEndpoint.create(p); }
  updateUnitProduct(p: UnitProduct): Observable<UnitProduct>     { return this.unitProductsEndpoint.update(p, p.id); }
  deleteUnitProduct(id: number): Observable<void>                { return this.unitProductsEndpoint.delete(id); }

  // ─── Weight Products ─────────────────────────────────────────
  getWeightProducts(): Observable<WeightProduct[]>                   { return this.weightProductsEndpoint.getAll(); }
  getWeightProduct(id: number): Observable<WeightProduct>            { return this.weightProductsEndpoint.getById(id); }
  createWeightProduct(p: WeightProduct): Observable<WeightProduct>   { return this.weightProductsEndpoint.create(p); }
  updateWeightProduct(p: WeightProduct): Observable<WeightProduct>   { return this.weightProductsEndpoint.update(p, p.id); }
  deleteWeightProduct(id: number): Observable<void>                  { return this.weightProductsEndpoint.delete(id); }

  // ─── Stock Alerts ─────────────────────────────────────────────
  getStockAlerts(): Observable<StockAlert[]>                       { return this.stockAlertsEndpoint.getAll(); }
  getStockAlert(id: number): Observable<StockAlert>                { return this.stockAlertsEndpoint.getById(id); }
  createStockAlert(alert: StockAlert): Observable<StockAlert>      { return this.stockAlertsEndpoint.create(alert); }
  updateStockAlert(alert: StockAlert): Observable<StockAlert>      { return this.stockAlertsEndpoint.update(alert, alert.id); }
  deleteStockAlert(id: number): Observable<void>                   { return this.stockAlertsEndpoint.delete(id); }
}

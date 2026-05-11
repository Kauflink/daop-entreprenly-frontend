import { BaseEntity } from '../../../shared/infrastructure/base-entity';
import { UnitProduct } from './unit-product.entity';
import { WeightProduct } from './weight-product.entity';
import { UnitLot } from './unit-lot.entity';
import { WeightLot } from './weight-lot.entity';

export type StockAlertTone = 'danger' | 'warning' | 'low';

export interface StockAlertSummary {
  alertType: typeof StockAlert.AlertType[keyof typeof StockAlert.AlertType];
  tone: StockAlertTone;
  icon: string;
  priority: number;
  count: number;
  titleKey: string;
  titleParams: Record<string, string | number>;
  detailKey: string;
  detailParams: Record<string, string | number>;
}

export class StockAlert implements BaseEntity {

  static readonly AlertType = {
    LOW_STOCK:     'low_stock',
    OUT_OF_STOCK:  'out_of_stock',
    EXPIRING_SOON: 'expiring_soon',
    EXPIRED:       'expired'
  } as const;

  static readonly AlertSeverity = {
    WARNING:  'warning',
    CRITICAL: 'critical'
  } as const;

  private _id:           number;
  private _lotId:        number | null;
  private _productId:    number;
  private _productType:  'unit' | 'weight' | null;
  private _productName:  string;
  private _alertType:    typeof StockAlert.AlertType[keyof typeof StockAlert.AlertType];
  private _severity:     typeof StockAlert.AlertSeverity[keyof typeof StockAlert.AlertSeverity];
  private _message:      string;
  private _createdAt:    Date;
  private _detailKey:    string;
  private _detailParams: Record<string, string | number>;

  constructor(data: {
    _id:           number;
    _lotId:        number | null;
    _productId:    number;
    _productType?: 'unit' | 'weight' | null;
    _productName?: string;
    _alertType:    typeof StockAlert.AlertType[keyof typeof StockAlert.AlertType];
    _severity:     typeof StockAlert.AlertSeverity[keyof typeof StockAlert.AlertSeverity];
    _message:      string;
    _createdAt:    Date;
    _detailKey?:   string;
    _detailParams?: Record<string, string | number>;
  }) {
    this._id           = data._id;
    this._lotId        = data._lotId;
    this._productId    = data._productId;
    this._productType  = data._productType ?? null;
    this._productName  = data._productName ?? '';
    this._alertType    = data._alertType;
    this._severity     = data._severity;
    this._message      = data._message;
    this._createdAt    = data._createdAt;
    this._detailKey    = data._detailKey ?? '';
    this._detailParams = data._detailParams ?? {};
  }

  get id():           number { return this._id; }
  set id(v: number)          { this._id = v; }

  get lotId():        number | null { return this._lotId; }
  set lotId(v: number | null)       { this._lotId = v; }

  get productId():    number { return this._productId; }
  set productId(v: number)   { this._productId = v; }

  get productType():  'unit' | 'weight' | null { return this._productType; }
  set productType(v: 'unit' | 'weight' | null) { this._productType = v; }

  get productName():  string { return this._productName; }
  set productName(v: string) { this._productName = v; }

  get alertType():    typeof StockAlert.AlertType[keyof typeof StockAlert.AlertType] { return this._alertType; }
  set alertType(v: typeof StockAlert.AlertType[keyof typeof StockAlert.AlertType])    { this._alertType = v; }

  get severity():     typeof StockAlert.AlertSeverity[keyof typeof StockAlert.AlertSeverity] { return this._severity; }
  set severity(v: typeof StockAlert.AlertSeverity[keyof typeof StockAlert.AlertSeverity])     { this._severity = v; }

  get message():      string { return this._message; }
  set message(v: string)     { this._message = v; }

  get createdAt():    Date { return this._createdAt; }
  set createdAt(v: Date)   { this._createdAt = v; }

  get detailKey():    string { return this._detailKey; }
  set detailKey(v: string)   { this._detailKey = v; }

  get detailParams(): Record<string, string | number> { return this._detailParams; }
  set detailParams(v: Record<string, string | number>) { this._detailParams = v; }

  // ─── Alert type helpers ──────────────────────────────────────────
  get isLowStock():     boolean { return this._alertType === StockAlert.AlertType.LOW_STOCK; }
  get isOutOfStock():   boolean { return this._alertType === StockAlert.AlertType.OUT_OF_STOCK; }
  get isExpiringSoon(): boolean { return this._alertType === StockAlert.AlertType.EXPIRING_SOON; }
  get isExpired():      boolean { return this._alertType === StockAlert.AlertType.EXPIRED; }
  get isCritical():     boolean { return this._severity  === StockAlert.AlertSeverity.CRITICAL; }

  // ─── Computed display properties ─────────────────────────────────
  get tone(): StockAlertTone {
    switch (this._alertType) {
      case StockAlert.AlertType.EXPIRED:
      case StockAlert.AlertType.OUT_OF_STOCK:  return 'danger';
      case StockAlert.AlertType.EXPIRING_SOON: return 'warning';
      case StockAlert.AlertType.LOW_STOCK:     return 'low';
    }
  }

  get icon(): string {
    switch (this._alertType) {
      case StockAlert.AlertType.EXPIRED:       return 'error_outline';
      case StockAlert.AlertType.OUT_OF_STOCK:  return 'priority_high';
      case StockAlert.AlertType.EXPIRING_SOON: return 'warning_amber';
      case StockAlert.AlertType.LOW_STOCK:     return 'trending_down';
    }
  }

  get priority(): number {
    switch (this._alertType) {
      case StockAlert.AlertType.EXPIRED:       return 1;
      case StockAlert.AlertType.OUT_OF_STOCK:  return 2;
      case StockAlert.AlertType.EXPIRING_SOON: return 3;
      case StockAlert.AlertType.LOW_STOCK:     return 4;
    }
  }

  // ─── Static factory: compute alerts from lot data ────────────────
  static buildFromLots(
    unitProducts: UnitProduct[],
    weightProducts: WeightProduct[],
    unitLots: UnitLot[],
    weightLots: WeightLot[],
    now = new Date()
  ): StockAlert[] {
    const EXPIRING_SOON_DAYS = 5;
    const LOW_UNIT_STOCK_THRESHOLD = 5;
    const LOW_WEIGHT_STOCK_THRESHOLD = 5;
    const today = _startOfDay(now);
    const alerts: StockAlert[] = [];

    for (const product of unitProducts) {
      const productLots = unitLots.filter(l => l.productId === product.id);
      const totalStock  = productLots.reduce((s, l) => s + Number(l.quantity || 0), 0);
      const outLots     = productLots.filter(l => Number(l.quantity || 0) <= 0);

      for (const lot of outLots) {
        alerts.push(StockAlert._make('out_of_stock', product, 'unit', lot.id, 'lots.alerts.detail.outOfStock'));
      }
      if (outLots.length === 0 && totalStock <= 0) {
        alerts.push(StockAlert._make('out_of_stock', product, 'unit', null, 'lots.alerts.detail.outOfStockNoLot'));
      }
      if (totalStock > 0 && totalStock <= LOW_UNIT_STOCK_THRESHOLD) {
        const lot = productLots[0];
        alerts.push(StockAlert._make(
          'low_stock', product, 'unit', lot?.id ?? null,
          lot ? 'lots.alerts.detail.lowStock' : 'lots.alerts.detail.lowStockNoLot'
        ));
      }
      for (const lot of productLots) {
        const expiryDate = _startOfDay(new Date(lot.expiryDate));
        if (Number.isNaN(expiryDate.getTime())) continue;
        const days = _daysBetween(today, expiryDate);
        if (days < 0) {
          alerts.push(StockAlert._make('expired', product, 'unit', lot.id, 'lots.alerts.detail.expired', { expiryDate: _fmtDate(expiryDate) }));
        } else if (days <= EXPIRING_SOON_DAYS) {
          alerts.push(StockAlert._make('expiring_soon', product, 'unit', lot.id, 'lots.alerts.detail.expiringSoon', { days, expiryDate: _fmtDate(expiryDate) }));
        }
      }
    }

    for (const product of weightProducts) {
      const productLots = weightLots.filter(l => l.productId === product.id);
      const totalStock  = productLots.reduce((s, l) => s + Number(l.quantityKg || 0), 0);
      const outLots     = productLots.filter(l => Number(l.quantityKg || 0) <= 0);

      for (const lot of outLots) {
        alerts.push(StockAlert._make('out_of_stock', product, 'weight', lot.id, 'lots.alerts.detail.outOfStock'));
      }
      if (outLots.length === 0 && totalStock <= 0) {
        alerts.push(StockAlert._make('out_of_stock', product, 'weight', null, 'lots.alerts.detail.outOfStockNoLot'));
      }
      if (totalStock > 0 && totalStock <= LOW_WEIGHT_STOCK_THRESHOLD) {
        const lot = productLots[0];
        alerts.push(StockAlert._make(
          'low_stock', product, 'weight', lot?.id ?? null,
          lot ? 'lots.alerts.detail.lowStock' : 'lots.alerts.detail.lowStockNoLot'
        ));
      }
    }

    return alerts.sort((a, b) => a.priority - b.priority);
  }

  // ─── Static method: summarize alerts by type+product ─────────────
  static summarize(alerts: StockAlert[]): StockAlertSummary[] {
    const summaries: StockAlertSummary[] = [];
    const types = [
      StockAlert.AlertType.EXPIRED,
      StockAlert.AlertType.OUT_OF_STOCK,
      StockAlert.AlertType.EXPIRING_SOON,
      StockAlert.AlertType.LOW_STOCK
    ] as const;

    for (const type of types) {
      const byType = alerts.filter(a => a.alertType === type);
      if (byType.length === 0) continue;

      const keys = [...new Set(byType.map(a => `${a.productType}:${a.productId}`))];

      for (const key of keys) {
        const [productType, productIdStr] = key.split(':');
        const productId = Number(productIdStr);
        const group = byType.filter(a => a.productId === productId && a.productType === productType);
        const first = group[0];

        summaries.push({
          alertType:   type,
          tone:        first.tone,
          icon:        first.icon,
          priority:    first.priority,
          count:       group.length,
          titleKey:    `lots.alerts.title.${_toCamel(type)}`,
          titleParams: { count: group.length },
          detailKey:   first.detailKey,
          detailParams: first.detailParams
        });
      }
    }

    return summaries.sort((a, b) => a.priority - b.priority);
  }

  private static _make(
    alertType: typeof StockAlert.AlertType[keyof typeof StockAlert.AlertType],
    product: UnitProduct | WeightProduct,
    productType: 'unit' | 'weight',
    lotId: number | null,
    detailKey: string,
    extra: Record<string, string | number> = {}
  ): StockAlert {
    const severity = (alertType === 'expired' || alertType === 'out_of_stock')
      ? StockAlert.AlertSeverity.CRITICAL
      : StockAlert.AlertSeverity.WARNING;

    return new StockAlert({
      _id:           0,
      _lotId:        lotId,
      _productId:    product.id,
      _productType:  productType,
      _productName:  product.name,
      _alertType:    alertType,
      _severity:     severity,
      _message:      '',
      _createdAt:    new Date(),
      _detailKey:    detailKey,
      _detailParams: { productName: product.name, lotId: lotId === null ? '' : `#${lotId}`, ...extra }
    });
  }
}

function _toCamel(type: string): string {
  switch (type) {
    case 'low_stock':     return 'lowStock';
    case 'out_of_stock':  return 'outOfStock';
    case 'expiring_soon': return 'expiringSoon';
    default:              return type;
  }
}

function _startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function _daysBetween(start: Date, end: Date): number {
  return Math.ceil((end.getTime() - start.getTime()) / 86_400_000);
}

function _fmtDate(date: Date): string {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

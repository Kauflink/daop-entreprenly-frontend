import { BaseEntity } from '../../../shared/infrastructure/base-entity';

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

  private _id:        number;
  private _lotId:     number;
  private _productId: number;
  private _alertType: typeof StockAlert.AlertType[keyof typeof StockAlert.AlertType];
  private _severity:  typeof StockAlert.AlertSeverity[keyof typeof StockAlert.AlertSeverity];
  private _message:   string;
  private _createdAt: Date;

  constructor(data: {
    _id:        number;
    _lotId:     number;
    _productId: number;
    _alertType: typeof StockAlert.AlertType[keyof typeof StockAlert.AlertType];
    _severity:  typeof StockAlert.AlertSeverity[keyof typeof StockAlert.AlertSeverity];
    _message:   string;
    _createdAt: Date;
  }) {
    this._id        = data._id;
    this._lotId     = data._lotId;
    this._productId = data._productId;
    this._alertType = data._alertType;
    this._severity  = data._severity;
    this._message   = data._message;
    this._createdAt = data._createdAt;
  }

  get id():        number { return this._id; }
  set id(value: number)   { this._id = value; }

  get lotId():     number { return this._lotId; }
  set lotId(value: number) { this._lotId = value; }

  get productId(): number { return this._productId; }
  set productId(value: number) { this._productId = value; }

  get alertType(): typeof StockAlert.AlertType[keyof typeof StockAlert.AlertType] { return this._alertType; }
  set alertType(value: typeof StockAlert.AlertType[keyof typeof StockAlert.AlertType]) { this._alertType = value; }

  get severity():  typeof StockAlert.AlertSeverity[keyof typeof StockAlert.AlertSeverity] { return this._severity; }
  set severity(value: typeof StockAlert.AlertSeverity[keyof typeof StockAlert.AlertSeverity]) { this._severity = value; }

  get message():   string { return this._message; }
  set message(value: string) { this._message = value; }

  get createdAt(): Date { return this._createdAt; }
  set createdAt(value: Date) { this._createdAt = value; }

  // ─── Helpers ─────────────────────────────────────────────────
  get isLowStock():     boolean { return this._alertType === StockAlert.AlertType.LOW_STOCK; }
  get isOutOfStock():   boolean { return this._alertType === StockAlert.AlertType.OUT_OF_STOCK; }
  get isExpiringSoon(): boolean { return this._alertType === StockAlert.AlertType.EXPIRING_SOON; }
  get isExpired():      boolean { return this._alertType === StockAlert.AlertType.EXPIRED; }
  get isCritical():     boolean { return this._severity  === StockAlert.AlertSeverity.CRITICAL; }
}

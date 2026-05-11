import { BaseEntity } from '../../../shared/infrastructure/base-entity';
import { SaleItem } from './sale-item.entity';
import { PaymentReceipt } from './payment-receipt.entity';
import { PaymentMethod } from './payment-method.enum';
import { SaleStatus } from './sale-status.enum';

export class Sale implements BaseEntity {
  private _id: number;
  private _sellerId: number;
  private _items: SaleItem[];
  private _total: number;
  private _paymentMethod: PaymentMethod;
  private _paymentReceipt: PaymentReceipt | null;
  private _status: SaleStatus;
  private _createdAt: Date;
  private _completedAt: Date | null;

  constructor(sale: {
    id: number;
    sellerId: number;
    items?: SaleItem[];
    total?: number;
    paymentMethod?: PaymentMethod;
    paymentReceipt?: PaymentReceipt | null;
    status?: SaleStatus;
    createdAt?: Date;
    completedAt?: Date | null;
  }) {
    this._id = sale.id;
    this._sellerId = sale.sellerId;
    this._items = sale.items ?? [];
    this._total = sale.total ?? 0;
    this._paymentMethod = sale.paymentMethod ?? PaymentMethod.CASH;
    this._paymentReceipt = sale.paymentReceipt ?? null;
    this._status = sale.status ?? SaleStatus.IN_PROGRESS;
    this._createdAt = sale.createdAt ?? new Date();
    this._completedAt = sale.completedAt ?? null;
  }

  get id(): number {
    return this._id;
  }
  set id(value: number) {
    this._id = value;
  }

  get sellerId(): number {
    return this._sellerId;
  }
  set sellerId(value: number) {
    this._sellerId = value;
  }

  get items(): SaleItem[] {
    return this._items;
  }
  set items(value: SaleItem[]) {
    this._items = value;
  }

  get total(): number {
    return this._total;
  }
  set total(value: number) {
    this._total = value;
  }

  get paymentMethod(): PaymentMethod {
    return this._paymentMethod;
  }
  set paymentMethod(value: PaymentMethod) {
    this._paymentMethod = value;
  }

  get paymentReceipt(): PaymentReceipt | null {
    return this._paymentReceipt;
  }
  set paymentReceipt(value: PaymentReceipt | null) {
    this._paymentReceipt = value;
  }

  get status(): SaleStatus {
    return this._status;
  }
  set status(value: SaleStatus) {
    this._status = value;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
  set createdAt(value: Date) {
    this._createdAt = value;
  }

  get completedAt(): Date | null {
    return this._completedAt;
  }
  set completedAt(value: Date | null) {
    this._completedAt = value;
  }
}

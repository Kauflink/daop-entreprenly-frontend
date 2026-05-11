import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export class ProductSummary implements BaseEntity {
  private _id: number;
  private _name: string;
  private _unitPrice: number;
  private _isWeighted: boolean;
  private _availableStock: number;

  constructor(product: {
    id: number;
    name: string;
    unitPrice: number;
    isWeighted: boolean;
    availableStock: number;
  }) {
    this._id = product.id;
    this._name = product.name;
    this._unitPrice = product.unitPrice;
    this._isWeighted = product.isWeighted;
    this._availableStock = product.availableStock;
  }

  get id(): number {
    return this._id;
  }
  set id(value: number) {
    this._id = value;
  }

  get name(): string {
    return this._name;
  }
  set name(value: string) {
    this._name = value;
  }

  get unitPrice(): number {
    return this._unitPrice;
  }
  set unitPrice(value: number) {
    this._unitPrice = value;
  }

  get isWeighted(): boolean {
    return this._isWeighted;
  }
  set isWeighted(value: boolean) {
    this._isWeighted = value;
  }

  get availableStock(): number {
    return this._availableStock;
  }
  set availableStock(value: number) {
    this._availableStock = value;
  }
}

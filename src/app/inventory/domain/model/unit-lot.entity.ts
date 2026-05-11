import { Lot } from './lot.entity';

export class UnitLot extends Lot {
  private _quantity: number;
  private _expiryDate: Date;

  constructor(data: {
    _id: number;
    _productId: number;
    _codeQR: string;
    _entryDate: Date;
    _quantity: number;
    _expiryDate: Date;
  }) {
    super({ ...data, _lotType: Lot.LotType.UNIT });
    this._quantity = data._quantity;
    this._expiryDate = data._expiryDate;
  }

  get quantity(): number { return this._quantity; }
  set quantity(value: number) { this._quantity = value; }

  get expiryDate(): Date { return this._expiryDate; }
  set expiryDate(value: Date) { this._expiryDate = value; }
}

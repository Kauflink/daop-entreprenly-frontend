import { Lot } from './lot.entity';

export class WeightLot extends Lot {
  private _quantityKg: number;

  constructor(data: {
    _id: number;
    _productId: number;
    _codeQR: string;
    _entryDate: Date;
    _quantityKg: number;
  }) {
    super({ ...data, _lotType: Lot.LotType.WEIGHT });
    this._quantityKg = data._quantityKg;
  }

  get quantityKg(): number { return this._quantityKg; }
  set quantityKg(value: number) { this._quantityKg = value; }
}

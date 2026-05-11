// lot.entity.ts
import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export class Lot implements BaseEntity {
  static readonly LotType = {
    UNIT: 'unit',
    WEIGHT: 'weight',
  } as const;

  private _id: number;
  private _productId: number;
  private _codeQR: string;
  private _entryDate: Date;
  private _lotType: typeof Lot.LotType[keyof typeof Lot.LotType];

  constructor(data: {
    _id: number;
    _productId: number;
    _codeQR: string;
    _entryDate: Date;
    _lotType: typeof Lot.LotType[keyof typeof Lot.LotType];
  }) {
    this._id = data._id;
    this._productId = data._productId;
    this._codeQR = data._codeQR;
    this._entryDate = data._entryDate;
    this._lotType = data._lotType;
  }

  get id(): number { return this._id; }
  set id(value: number) { this._id = value; }

  get productId(): number { return this._productId; }
  set productId(value: number) { this._productId = value; }

  get codeQR(): string { return this._codeQR; }
  set codeQR(value: string) { this._codeQR = value; }

  get entryDate(): Date { return this._entryDate; }
  set entryDate(value: Date) { this._entryDate = value; }

  get lotType(): typeof Lot.LotType[keyof typeof Lot.LotType] {
    return this._lotType;
  }
}

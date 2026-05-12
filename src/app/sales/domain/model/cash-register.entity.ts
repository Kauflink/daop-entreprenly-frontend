import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export class CashRegister implements BaseEntity {
  private _id: number;
  private _date: string;
  private _totalCash: number;
  private _totalDigital: number;

  private _saleCount: number;

  constructor(register: { id: number; date: string; totalCash?: number; totalDigital?: number; saleCount?: number }) {
    this._id = register.id;
    this._date = register.date;
    this._totalCash = register.totalCash ?? 0;
    this._totalDigital = register.totalDigital ?? 0;
    this._saleCount = register.saleCount ?? 0;
  }

  get totalDay(): number {
    return Number((this._totalCash + this._totalDigital).toFixed(2));
  }

  get id(): number {
    return this._id;
  }
  set id(value: number) {
    this._id = value;
  }

  get date(): string {
    return this._date;
  }
  set date(value: string) {
    this._date = value;
  }

  get totalCash(): number {
    return this._totalCash;
  }
  set totalCash(value: number) {
    this._totalCash = value;
  }

  get totalDigital(): number {
    return this._totalDigital;
  }
  set totalDigital(value: number) {
    this._totalDigital = value;
  }

  get saleCount(): number {
    return this._saleCount;
  }
  set saleCount(value: number) {
    this._saleCount = value;
  }
}

import { Product } from './product.entity';

export class UnitProduct extends Product {
  private _price: number;
  private _weightGrams: number;
  private _brand: string;

  constructor(data: {
    _id: number;
    _name: string;
    _description: string;
    _codeQR: string;
    _price: number;
    _weightGrams: number;
    _brand: string;
  }) {
    super({ ...data, _productType: Product.ProductType.UNIT }); // :white_check_mark:
    this._price = data._price;
    this._weightGrams = data._weightGrams;
    this._brand = data._brand;
  }

  get price(): number { return this._price; }
  set price(value: number) { this._price = value; }

  get weightGrams(): number { return this._weightGrams; }
  set weightGrams(value: number) { this._weightGrams = value; }

  get brand(): string { return this._brand; }
  set brand(value: string) { this._brand = value; }
}

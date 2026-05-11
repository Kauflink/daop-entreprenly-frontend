import { Product } from './product.entity';

export class WeightProduct extends Product {
  private _pricePerKg: number;

  constructor(data: {
    _id: number;
    _name: string;
    _description: string;
    _codeQR: string;
    _pricePerKg: number;
  }) {
    super({ ...data, _productType: Product.ProductType.WEIGHT }); // :white_check_mark:
    this._pricePerKg = data._pricePerKg;
  }

  get pricePerKg(): number { return this._pricePerKg; }
  set pricePerKg(value: number) { this._pricePerKg = value; }
}

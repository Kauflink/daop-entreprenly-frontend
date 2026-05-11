import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export class Product implements BaseEntity {
  static readonly ProductType = {        // :white_check_mark: Dentro de la clase
    UNIT: 'unit',
    WEIGHT: 'weight',
  } as const;

  private _id: number;
  private _name: string;
  private _description: string;
  private _codeQR: string;
  private _productType: typeof Product.ProductType[keyof typeof Product.ProductType];

  constructor(data: {
    _id: number;
    _name: string;
    _description: string;
    _codeQR: string;
    _productType: typeof Product.ProductType[keyof typeof Product.ProductType];
  }) {
    this._id = data._id;
    this._name = data._name;
    this._description = data._description;
    this._codeQR = data._codeQR;
    this._productType = data._productType;
  }

  get id(): number { return this._id; }
  set id(value: number) { this._id = value; }

  get name(): string { return this._name; }
  set name(value: string) { this._name = value; }

  get description(): string { return this._description; }
  set description(value: string) { this._description = value; }

  get codeQR(): string { return this._codeQR; }
  set codeQR(value: string) { this._codeQR = value; }

  get productType(): typeof Product.ProductType[keyof typeof Product.ProductType] {
    return this._productType;
  }
}

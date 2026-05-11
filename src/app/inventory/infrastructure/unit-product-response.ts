// unit-product-response.ts
import { BaseResponse } from '../../shared/infrastructure/base-response';
import { ProductResource } from './products-response';

export interface UnitProductResource extends ProductResource {
  price: number;
  weightGrams: number;
  brand: string;
}

export interface UnitProductsResponse extends BaseResponse {
  unitProducts: UnitProductResource[];
}

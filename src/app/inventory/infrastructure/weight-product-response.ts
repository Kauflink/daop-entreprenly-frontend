
import { BaseResponse } from '../../shared/infrastructure/base-response';
import { ProductResource } from './products-response';

export interface WeightProductResource extends ProductResource {
  pricePerKg: number;
}

export interface WeightProductsResponse extends BaseResponse {
  weightProducts: WeightProductResource[];
}

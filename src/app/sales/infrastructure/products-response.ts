import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface ProductsResponse extends BaseResponse {
  products: ProductResource[];
}

export interface ProductResource extends BaseResource {
  id: number;
  name: string;
  unitPrice: number;
  isWeighted: boolean;
  availableStock: number;
}

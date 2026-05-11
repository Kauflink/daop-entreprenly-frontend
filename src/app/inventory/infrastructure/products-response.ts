import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

/**
 * Represents the API response structure for a list of products.
 */
export interface ProductsResponse extends BaseResponse {
  /**
   * The list of products returned by the API.
   */
  products: ProductResource[];
}

export type ProductType = 'unit' | 'weight';

/**
 * Represents the API resource/DTO for a product.
 */
export interface ProductResource extends BaseResource {
  id: number;
  name: string;
  description: string;
  codeQR: string;
  productType: ProductType;
}

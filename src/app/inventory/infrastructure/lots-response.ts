import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

export interface LotsResponse extends BaseResponse {
  /**
   * Array of lot resources included in the response.
   */
  lots: LotResource[];
}
export type ProductType = 'unit' | 'weight';
/**
 * Represents a single lot resource returned from the API.
 *
 * @remarks
 * This interface extends {@link BaseResource} and includes the core properties of a lot.
 *
 * @property id - Unique identifier for the lot.
 */
export interface LotResource extends BaseResource {
  /**
   * Unique identifier for the lot.
   */
  id: number;
  productId: number;
  codeQR: string;
  entryDate: Date;
  lotType: ProductType;
}

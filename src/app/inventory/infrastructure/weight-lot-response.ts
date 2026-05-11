
import { BaseResponse } from '../../shared/infrastructure/base-response';
import { LotResource } from './lots-response';

export interface WeightLotResource extends LotResource {
  quantityKg: number;
}

export interface WeightLotsResponse extends BaseResponse {
  weightLots: WeightLotResource[];
}

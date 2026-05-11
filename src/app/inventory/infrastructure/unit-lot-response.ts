// unit-lot-response.ts
import { BaseResponse } from '../../shared/infrastructure/base-response';
import { LotResource } from './lots-response';

export interface UnitLotResource extends LotResource {
  quantity: number;
  expiryDate: Date;
}

export interface UnitLotsResponse extends BaseResponse {
  unitLots: UnitLotResource[];
}

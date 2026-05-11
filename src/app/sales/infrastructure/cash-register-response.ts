import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

// JSON-Server devuelve array plano, no objeto envuelto
export interface CashRegistersResponse extends BaseResponse {}

export interface CashRegisterResource extends BaseResource {
  id: number;
  date: string;
  totalCash: number;
  totalDigital: number;
}

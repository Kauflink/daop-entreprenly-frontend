import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { PaymentMethod } from '../domain/model/payment-method.enum';
import { SaleStatus } from '../domain/model/sale-status.enum';

// json-server returns a plain array, so SalesResponse is just a placeholder
export interface SalesResponse extends BaseResponse {}

export interface SaleItemResource {
  productId: number;
  productName: string;
  quantity: number | null;
  weightKg: number | null;
  unitPrice: number;
  subtotal: number;
}

export interface PaymentReceiptResource {
  method: PaymentMethod;
  transactionCode: string;
  amount: number;
  confirmedAt: string;
}

export interface SaleResource extends BaseResource {
  id: number;
  sellerId: number;
  items: SaleItemResource[];
  total: number;
  paymentMethod: PaymentMethod;
  paymentReceipt: PaymentReceiptResource | null;
  status: SaleStatus;
  createdAt: string;
  completedAt: string | null;
}

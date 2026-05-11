import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { OrderItem, OrderStatus } from '../domain/model/chat-order.entity';

export interface ChatOrderResource extends BaseResource {
  conversationId: number;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  deliveryAddress: string;
  paymentMethod: string;
  status: OrderStatus;
  hasReceipt: boolean;
  rejectionCount: number;
  createdAt: string;
}

export interface ChatOrdersResponse extends BaseResponse {
  orders: ChatOrderResource[];
}

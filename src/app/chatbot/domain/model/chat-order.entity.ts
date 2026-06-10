import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export type OrderStatus = 'PENDING' | 'WAITING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'BLOCKED';

export interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface ChatOrder extends BaseEntity {
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
  receiptImage?: string;
}

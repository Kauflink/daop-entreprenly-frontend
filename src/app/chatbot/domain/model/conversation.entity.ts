import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export type ConversationStatus = 'ACTIVE' | 'WAITING_PAYMENT' | 'COMPLETED' | 'CLOSED';

export interface Conversation extends BaseEntity {
  sellerId: number;
  clientPhone: string;
  clientName: string;
  lastMessage: string;
  lastMessageTime: string;
  status: ConversationStatus;
  createdAt: string;
  closedAt?: string;
}

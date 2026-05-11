import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { ConversationStatus } from '../domain/model/conversation.entity';

export interface ConversationResource extends BaseResource {
  sellerId: number;
  clientPhone: string;
  clientName: string;
  lastMessage: string;
  lastMessageTime: string;
  status: ConversationStatus;
  createdAt: string;
  closedAt?: string;
}

export interface ConversationsResponse extends BaseResponse {
  conversations: ConversationResource[];
}

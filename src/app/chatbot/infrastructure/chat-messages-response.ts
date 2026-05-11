import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { MessageSender, MessageType } from '../domain/model/chat-message.entity';

export interface ChatMessageResource extends BaseResource {
  conversationId: number;
  content: string;
  sender: MessageSender;
  type: MessageType;
  sentAt: string;
}

export interface ChatMessagesResponse extends BaseResponse {
  messages: ChatMessageResource[];
}

import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export type MessageSender = 'client' | 'bot' | 'system';
export type MessageType = 'text' | 'image';

export interface ChatMessage extends BaseEntity {
  conversationId: number;
  content: string;
  sender: MessageSender;
  type: MessageType;
  sentAt: string;
}

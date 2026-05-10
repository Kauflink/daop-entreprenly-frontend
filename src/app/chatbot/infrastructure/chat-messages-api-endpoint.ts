import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { ChatMessage } from '../domain/model/chat-message.entity';
import { ChatMessageResource, ChatMessagesResponse } from './chat-messages-response';
import { ChatMessageAssembler } from './chat-message-assembler';

export class ChatMessagesApiEndpoint extends BaseApiEndpoint<
  ChatMessage,
  ChatMessageResource,
  ChatMessagesResponse,
  ChatMessageAssembler
> {
  constructor(http: HttpClient, assembler: ChatMessageAssembler) {
    super(http, 'http://localhost:3000/chat-messages', assembler);
  }
}

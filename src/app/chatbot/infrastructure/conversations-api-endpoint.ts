import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Conversation } from '../domain/model/conversation.entity';
import { ConversationResource, ConversationsResponse } from './conversations-response';
import { ConversationAssembler } from './conversation-assembler';

export class ConversationsApiEndpoint extends BaseApiEndpoint<
  Conversation,
  ConversationResource,
  ConversationsResponse,
  ConversationAssembler
> {
  constructor(http: HttpClient, assembler: ConversationAssembler) {
    super(http, 'http://localhost:3000/conversations', assembler);
  }
}

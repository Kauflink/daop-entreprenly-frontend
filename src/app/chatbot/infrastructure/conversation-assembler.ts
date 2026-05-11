import { Injectable } from '@angular/core';
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Conversation } from '../domain/model/conversation.entity';
import { ConversationResource, ConversationsResponse } from './conversations-response';

@Injectable({ providedIn: 'root' })
export class ConversationAssembler implements BaseAssembler<Conversation, ConversationResource, ConversationsResponse> {
  toEntityFromResource(resource: ConversationResource): Conversation {
    return { ...resource };
  }

  toResourceFromEntity(entity: Conversation): ConversationResource {
    return { ...entity };
  }

  toEntitiesFromResponse(response: ConversationsResponse): Conversation[] {
    return response.conversations.map(r => this.toEntityFromResource(r));
  }
}

import { Injectable } from '@angular/core';
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { ChatMessage } from '../domain/model/chat-message.entity';
import { ChatMessageResource, ChatMessagesResponse } from './chat-messages-response';

@Injectable({ providedIn: 'root' })
export class ChatMessageAssembler implements BaseAssembler<ChatMessage, ChatMessageResource, ChatMessagesResponse> {
  toEntityFromResource(resource: ChatMessageResource): ChatMessage {
    return { ...resource };
  }

  toResourceFromEntity(entity: ChatMessage): ChatMessageResource {
    return { ...entity };
  }

  toEntitiesFromResponse(response: ChatMessagesResponse): ChatMessage[] {
    return response.messages.map(r => this.toEntityFromResource(r));
  }
}

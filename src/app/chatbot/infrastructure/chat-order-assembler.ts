import { Injectable } from '@angular/core';
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { ChatOrder } from '../domain/model/chat-order.entity';
import { ChatOrderResource, ChatOrdersResponse } from './chat-orders-response';

@Injectable({ providedIn: 'root' })
export class ChatOrderAssembler implements BaseAssembler<ChatOrder, ChatOrderResource, ChatOrdersResponse> {
  toEntityFromResource(resource: ChatOrderResource): ChatOrder {
    return { ...resource };
  }

  toResourceFromEntity(entity: ChatOrder): ChatOrderResource {
    return { ...entity };
  }

  toEntitiesFromResponse(response: ChatOrdersResponse): ChatOrder[] {
    return response.orders.map(r => this.toEntityFromResource(r));
  }
}

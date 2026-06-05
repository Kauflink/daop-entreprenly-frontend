import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { ChatOrder } from '../domain/model/chat-order.entity';
import { ChatOrderResource, ChatOrdersResponse } from './chat-orders-response';
import { ChatOrderAssembler } from './chat-order-assembler';

export class ChatOrdersApiEndpoint extends BaseApiEndpoint<
  ChatOrder,
  ChatOrderResource,
  ChatOrdersResponse,
  ChatOrderAssembler
> {
  constructor(http: HttpClient, assembler: ChatOrderAssembler) {
    super(http, `${environment.entreprenlyProviderApiBaseUrl}${environment.entreprenlyProviderChatOrdersEndpointPath}`, assembler);
  }
}

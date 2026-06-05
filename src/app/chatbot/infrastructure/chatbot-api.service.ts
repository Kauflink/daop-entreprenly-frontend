import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { ConversationsApiEndpoint } from './conversations-api-endpoint';
import { ChatMessagesApiEndpoint } from './chat-messages-api-endpoint';
import { ChatOrdersApiEndpoint } from './chat-orders-api-endpoint';
import { WhatsappSessionsApiEndpoint } from './whatsapp-sessions-api-endpoint';
import { InventoryProductsApiEndpoint } from './inventory-products-api-endpoint';
import { ConversationAssembler } from './conversation-assembler';
import { ChatMessageAssembler } from './chat-message-assembler';
import { ChatOrderAssembler } from './chat-order-assembler';
import { WhatsappSessionAssembler } from './whatsapp-session-assembler';

@Injectable({ providedIn: 'root' })
export class ChatbotApiService extends BaseApi {
  private http = inject(HttpClient);
  private conversationAssembler = inject(ConversationAssembler);
  private chatMessageAssembler = inject(ChatMessageAssembler);
  private chatOrderAssembler = inject(ChatOrderAssembler);
  private whatsappSessionAssembler = inject(WhatsappSessionAssembler);

  readonly conversations = new ConversationsApiEndpoint(this.http, this.conversationAssembler);
  readonly chatMessages = new ChatMessagesApiEndpoint(this.http, this.chatMessageAssembler);
  readonly chatOrders = new ChatOrdersApiEndpoint(this.http, this.chatOrderAssembler);
  readonly whatsappSessions = new WhatsappSessionsApiEndpoint(this.http, this.whatsappSessionAssembler);
  readonly inventoryProducts = new InventoryProductsApiEndpoint(this.http);

  /** Reads the real WhatsApp pairing QR and link state relayed by the bridge. */
  getBridgeQrState(): Observable<BridgeQrState> {
    const url = `${environment.entreprenlyProviderApiBaseUrl}${environment.entreprenlyProviderChatbotBridgeQrEndpointPath}`;
    return this.http.get<BridgeQrState>(url);
  }
}

export interface BridgeQrState {
  qr: string | null;
  connected: boolean;
}

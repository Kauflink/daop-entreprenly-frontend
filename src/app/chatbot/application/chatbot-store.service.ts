import { Injectable, inject, signal, computed } from '@angular/core';
import { timer } from 'rxjs';
import { ChatbotApiService } from '../infrastructure/chatbot-api.service';
import { Conversation } from '../domain/model/conversation.entity';
import { ChatMessage } from '../domain/model/chat-message.entity';
import { WhatsappSession } from '../domain/model/whatsapp-session.entity';
import { ChatOrder, OrderStatus } from '../domain/model/chat-order.entity';

@Injectable({ providedIn: 'root' })
export class ChatbotStoreService {
  private api = inject(ChatbotApiService);

  readonly session = signal<WhatsappSession | null>(null);
  readonly isSessionLoaded = signal(false);
  readonly conversations = signal<Conversation[]>([]);
  readonly selectedConversationId = signal<number | null>(null);
  readonly messages = signal<ChatMessage[]>([]);
  readonly isBotTyping = signal(false);
  readonly orders = signal<ChatOrder[]>([]);

  readonly selectedConversation = computed(() =>
    this.conversations().find(c => c.id === this.selectedConversationId()) ?? null,
  );

  readonly pendingOrder = computed(() =>
    this.orders().find(
      o => o.conversationId === this.selectedConversationId() && o.status === 'WAITING_PAYMENT',
    ) ?? null,
  );

  readonly isConnected = computed(() => this.session()?.status === 'connected');

  loadSession(): void {
    this.api.whatsappSessions.getAll().subscribe(sessions => {
      this.session.set(sessions[0] ?? null);
      this.isSessionLoaded.set(true);
    });
  }

  loadConversations(): void {
    this.api.conversations.getAll().subscribe(conversations => {
      this.conversations.set(conversations);
    });
  }

  loadOrders(): void {
    this.api.chatOrders.getAll().subscribe(orders => {
      this.orders.set(orders);
    });
  }

  private _playId = 0;

  selectConversation(id: number): void {
    this._playId++;
    const playId = this._playId;

    this.selectedConversationId.set(id);
    this.messages.set([]);
    this.isBotTyping.set(false);

    this.api.chatMessages.getAll().subscribe(all => {
      if (this._playId !== playId) return;
      this._playConversation(all.filter(m => m.conversationId === id), playId);
    });
  }

  private _playConversation(msgs: ChatMessage[], playId: number): void {
    let t = 0;

    for (const msg of msgs) {
      if (msg.sender === 'bot') {
        const typingAt = t;
        const msgAt = t + 1200;

        timer(typingAt).subscribe(() => {
          if (this._playId !== playId) return;
          this.isBotTyping.set(true);
        });

        timer(msgAt).subscribe(() => {
          if (this._playId !== playId) return;
          this.isBotTyping.set(false);
          this.messages.update(m => [...m, msg]);
        });

        t = msgAt + 400;
      } else if (msg.sender === 'system') {
        timer(t).subscribe(() => {
          if (this._playId !== playId) return;
          this.messages.update(m => [...m, msg]);
        });
        t += 400;
      } else {
        timer(t).subscribe(() => {
          if (this._playId !== playId) return;
          this.messages.update(m => [...m, msg]);
        });
        t += 800;
      }
    }
  }

  sendMessage(content: string): void {
    const conversationId = this.selectedConversationId();
    if (!conversationId) return;

    const message: ChatMessage = {
      id: 0,
      conversationId,
      content,
      sender: 'bot',
      type: 'text',
      sentAt: new Date().toISOString(),
    };

    this.api.chatMessages.create(message).subscribe(created => {
      this.messages.update(msgs => [...msgs, created]);
    });
  }

  simulateScan(): void {
    const current = this.session();
    if (!current) return;
    const updated: WhatsappSession = {
      ...current,
      status: 'connected',
      connectedAt: new Date().toLocaleString('es-PE'),
    };
    this.api.whatsappSessions.update(updated, current.id).subscribe(session => {
      this.session.set(session);
    });
  }

  simulateDisconnect(): void {
    const current = this.session();
    if (!current) return;
    const updated: WhatsappSession = { ...current, status: 'disconnected', connectedAt: undefined };
    this.api.whatsappSessions.update(updated, current.id).subscribe(session => {
      this.session.set(session);
    });
  }

  approveOrder(orderId: number): void {
    const order = this.orders().find(o => o.id === orderId);
    if (!order) return;

    const updated: ChatOrder = { ...order, status: 'CONFIRMED' as OrderStatus };
    this.api.chatOrders.update(updated, orderId).subscribe(confirmed => {
      this.orders.update(list => list.map(o => o.id === orderId ? confirmed : o));

      const time = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
      const sysMsg: ChatMessage = {
        id: 0, conversationId: order.conversationId,
        content: `Comerciante aprobó el pago — ${time}`,
        sender: 'system', type: 'text', sentAt: new Date().toISOString(),
      };
      const botMsg: ChatMessage = {
        id: 0, conversationId: order.conversationId,
        content: `Tu pago fue recibido y verificado correctamente.\nEl pedido ${order.orderNumber} está confirmado y en preparación.`,
        sender: 'bot', type: 'text', sentAt: new Date().toISOString(),
      };
      this.api.chatMessages.create(sysMsg).subscribe();
      this.api.chatMessages.create(botMsg).subscribe();
    });
  }

  rejectOrder(orderId: number): void {
    const order = this.orders().find(o => o.id === orderId);
    if (!order) return;

    const updated: ChatOrder = { ...order, status: 'CANCELLED' as OrderStatus };
    this.api.chatOrders.update(updated, orderId).subscribe(rejected => {
      this.orders.update(list => list.map(o => o.id === orderId ? rejected : o));

      const sysMsg: ChatMessage = {
        id: 0, conversationId: order.conversationId,
        content: 'Comerciante rechazó el pago',
        sender: 'system', type: 'text', sentAt: new Date().toISOString(),
      };
      const botMsg: ChatMessage = {
        id: 0, conversationId: order.conversationId,
        content: `Tu pago no pudo ser validado.\nMotivo: monto incorrecto.\n\nPor favor realiza nuevamente el pago al 999 888 777 y envía el comprobante.`,
        sender: 'bot', type: 'text', sentAt: new Date().toISOString(),
      };
      this.api.chatMessages.create(sysMsg).subscribe();
      this.api.chatMessages.create(botMsg).subscribe();
    });
  }
}

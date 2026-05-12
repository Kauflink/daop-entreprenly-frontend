import { Injectable, inject, signal, computed } from '@angular/core';
import { timer } from 'rxjs';
import { ChatbotApiService } from '../infrastructure/chatbot-api.service';
import { Conversation, ConversationStatus } from '../domain/model/conversation.entity';
import { ChatMessage } from '../domain/model/chat-message.entity';
import { WhatsappSession } from '../domain/model/whatsapp-session.entity';
import { ChatOrder, OrderStatus } from '../domain/model/chat-order.entity';
import { InventoryProduct } from '../domain/model/inventory-product.entity';

@Injectable({ providedIn: 'root' })
export class ChatbotStoreService {
  private api = inject(ChatbotApiService);

  readonly session = signal<WhatsappSession | null>(null);
  readonly isSessionLoaded = signal(false);
  readonly conversations = signal<Conversation[]>([]);
  readonly selectedConversationId = signal<number | null>(null);
  readonly messages = signal<ChatMessage[]>([]);
  /** CF ●●● — aparece cuando el cliente está "escribiendo" */
  readonly isClientTyping = signal(false);
  /** Texto que el bot va escribiendo letra a letra en la barra de input */
  readonly botInputText = signal('');
  readonly orders = signal<ChatOrder[]>([]);
  readonly inventoryProducts = signal<InventoryProduct[]>([]);

  readonly selectedConversation = computed(() =>
    this.conversations().find(c => c.id === this.selectedConversationId()) ?? null,
  );

  readonly pendingOrder = computed(() =>
    this.orders().find(
      o =>
        o.conversationId === this.selectedConversationId() &&
        o.status === 'WAITING_PAYMENT' &&
        o.hasReceipt === true,
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

  loadInventoryProducts(): void {
    this.api.inventoryProducts.getAll().subscribe(products => {
      this.inventoryProducts.set(products);
    });
  }

  private _playId = 0;

  selectConversation(id: number): void {
    this._playId++;
    const playId = this._playId;

    this.selectedConversationId.set(id);
    this.messages.set([]);
    this.isClientTyping.set(false);
    this.botInputText.set('');

    this.api.chatMessages.getAll().subscribe(all => {
      if (this._playId !== playId) return;
      const msgs = all.filter(m => m.conversationId === id);
      const conversation = this.conversations().find(c => c.id === id);
      const isLive = conversation?.status === 'ACTIVE' || conversation?.status === 'WAITING_PAYMENT';
      if (isLive) {
        this._playConversation(msgs, playId);
      } else {
        this.messages.set(msgs);
      }
    });
  }

  private _playConversation(msgs: ChatMessage[], playId: number): void {
    let t = 0;

    for (const msg of msgs) {
      if (msg.sender === 'bot') {
        // Escribe palabra a palabra en la barra de input, luego auto-envía
        const words = msg.content.split(' ');
        const msPerWord = 70;
        const startAt = t;

        for (let i = 0; i < words.length; i++) {
          const partial = words.slice(0, i + 1).join(' ');
          timer(startAt + i * msPerWord).subscribe(() => {
            if (this._playId !== playId) return;
            this.botInputText.set(partial);
          });
        }

        const sendAt = startAt + words.length * msPerWord + 250;
        timer(sendAt).subscribe(() => {
          if (this._playId !== playId) return;
          this.botInputText.set('');
          this.messages.update(m => [...m, msg]);
        });

        t = sendAt + 400;

      } else if (msg.sender === 'client') {
        // Muestra ●●● en el lado del cliente (CF), luego aparece el mensaje
        timer(t).subscribe(() => {
          if (this._playId !== playId) return;
          this.isClientTyping.set(true);
        });

        const showAt = t + 900;
        timer(showAt).subscribe(() => {
          if (this._playId !== playId) return;
          this.isClientTyping.set(false);
          this.messages.update(m => [...m, msg]);
        });

        t = showAt + 400;

      } else {
        // system
        timer(t).subscribe(() => {
          if (this._playId !== playId) return;
          this.messages.update(m => [...m, msg]);
        });
        t += 400;
      }
    }
  }

  /** Escribe el mensaje del bot palabra a palabra en la barra y lo envía al terminar */
  private _typewriteAndSend(msg: ChatMessage): void {
    const words = msg.content.split(' ');
    const msPerWord = 70;

    for (let i = 0; i < words.length; i++) {
      const partial = words.slice(0, i + 1).join(' ');
      timer(i * msPerWord).subscribe(() => this.botInputText.set(partial));
    }

    timer(words.length * msPerWord + 250).subscribe(() => {
      this.botInputText.set('');
      this.api.chatMessages.create(msg).subscribe(created => {
        this.messages.update(m => [...m, created]);
      });
    });
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
      this._updateConversationStatus(order.conversationId, 'COMPLETED');

      const time = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
      const sysMsg: ChatMessage = {
        id: 0, conversationId: order.conversationId,
        content: `Sistema: pago validado por el comerciante — ${time}`,
        sender: 'system', type: 'text', sentAt: new Date().toISOString(),
      };
      const botMsg: ChatMessage = {
        id: 0, conversationId: order.conversationId,
        content: `Tu pago fue recibido y verificado correctamente.\nEl pedido ${order.orderNumber} está confirmado y en preparación. ¡Gracias por tu compra!`,
        sender: 'bot', type: 'text', sentAt: new Date().toISOString(),
      };

      this.api.chatMessages.create(sysMsg).subscribe(created => {
        this.messages.update(m => [...m, created]);
        timer(400).subscribe(() => this._typewriteAndSend(botMsg));
      });
    });
  }

  rejectOrder(orderId: number, reason = 'Imagen ilegible'): void {
    const order = this.orders().find(o => o.id === orderId);
    if (!order) return;

    const newRejectionCount = (order.rejectionCount ?? 0) + 1;
    const isBlocked = newRejectionCount >= 2;
    const newStatus: OrderStatus = isBlocked ? 'BLOCKED' : 'WAITING_PAYMENT';

    const updated: ChatOrder = {
      ...order,
      status: newStatus,
      hasReceipt: false,
      rejectionCount: newRejectionCount,
    };

    this.api.chatOrders.update(updated, orderId).subscribe(rejected => {
      this.orders.update(list => list.map(o => o.id === orderId ? rejected : o));

      if (isBlocked) {
        this._updateConversationStatus(order.conversationId, 'CLOSED');
      }

      const time = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

      const sysContent = isBlocked
        ? `Sistema: pedido bloqueado por múltiples rechazos — ${time}`
        : `Sistema: comprobante rechazado — imagen ilegible — ${time}`;

      const botContent = isBlocked
        ? `Tu pedido ${order.orderNumber} ha sido bloqueado debido a múltiples rechazos de pago.\n\nPara resolver esta situación, comunícate directamente con la bodega:\nTeléfono: 999 888 777`
        : `Tu comprobante no pudo ser validado.\nMotivo: ${reason}.\n\nEl pedido ${order.orderNumber} ha vuelto al estado Esperando pago.\nPor favor envía un nuevo comprobante.`;

      const sysMsg: ChatMessage = {
        id: 0, conversationId: order.conversationId,
        content: sysContent, sender: 'system', type: 'text', sentAt: new Date().toISOString(),
      };
      const botMsg: ChatMessage = {
        id: 0, conversationId: order.conversationId,
        content: botContent, sender: 'bot', type: 'text', sentAt: new Date().toISOString(),
      };

      this.api.chatMessages.create(sysMsg).subscribe(created => {
        this.messages.update(m => [...m, created]);
        timer(400).subscribe(() => this._typewriteAndSend(botMsg));
      });
    });
  }

  private _updateConversationStatus(conversationId: number, status: ConversationStatus): void {
    const conv = this.conversations().find(c => c.id === conversationId);
    if (!conv) return;
    const updated = { ...conv, status };
    this.api.conversations.update(updated, conv.id).subscribe(c => {
      this.conversations.update(list => list.map(c2 => c2.id === conv.id ? c : c2));
    });
  }
}

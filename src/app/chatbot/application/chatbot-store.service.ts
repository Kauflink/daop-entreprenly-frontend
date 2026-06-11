import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timer } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ChatbotApiService } from '../infrastructure/chatbot-api.service';
import { ChatbotStreamService } from '../infrastructure/chatbot-stream.service';
import { Conversation, ConversationStatus } from '../domain/model/conversation.entity';
import { ChatMessage } from '../domain/model/chat-message.entity';
import { WhatsappSession } from '../domain/model/whatsapp-session.entity';
import { ChatOrder, OrderStatus } from '../domain/model/chat-order.entity';
import { environment } from '../../../environments/environment';

interface BridgeQrState { qr: string | null; connected: boolean; }

@Injectable({ providedIn: 'root' })
export class ChatbotStoreService {
  private api       = inject(ChatbotApiService);
  private stream    = inject(ChatbotStreamService);
  private translate = inject(TranslateService);
  private http      = inject(HttpClient);

  /** Guards against opening more than one realtime stream across views. */
  private realtimeConnected = false;

  /** Locale del idioma activo para formatear fechas */
  private get locale(): string {
    const lang = this.translate.currentLang ?? this.translate.defaultLang ?? 'es';
    return lang === 'en' ? 'en-US' : 'es-PE';
  }

  readonly session = signal<WhatsappSession | null>(null);
  readonly isSessionLoaded = signal(false);
  readonly conversations = signal<Conversation[]>([]);
  readonly selectedConversationId = signal<number | null>(null);
  readonly messages = signal<ChatMessage[]>([]);
  /** CF ●●● — aparece cuando el cliente está "escribiendo" */
  readonly isClientTyping = signal(false);
  /** Texto que el bot va escribiendo letra a letra en la barra de input */
  readonly botInputText = signal('');
  /**
   * true mientras la conversación se reproduce "en vivo" (mensaje a mensaje).
   * En conversaciones pasadas es false para que el historial aparezca de golpe,
   * sin animar burbuja por burbuja (como abrir un chat de WhatsApp).
   */
  readonly liveAnimation = signal(false);
  readonly orders = signal<ChatOrder[]>([]);

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

  /**
   * Subscribes to the backend realtime stream so conversations, orders and
   * messages update immediately. Idempotent: safe to call from several views.
   */
  connectRealtime(): void {
    if (this.realtimeConnected) return;
    this.realtimeConnected = true;
    this.stream.connect();
    this.stream.conversations$.subscribe(conversation => this.upsertConversation(conversation));
    this.stream.orders$.subscribe(order => this.upsertOrder(order));
    this.stream.messages$.subscribe(message => this.appendRealtimeMessage(message));
  }

  private upsertConversation(conversation: Conversation): void {
    this.conversations.update(list => {
      const index = list.findIndex(c => c.id === conversation.id);
      if (index === -1) return [conversation, ...list];
      const next = [...list];
      next[index] = conversation;
      return next;
    });
  }

  private upsertOrder(order: ChatOrder): void {
    this.orders.update(list => {
      const index = list.findIndex(o => o.id === order.id);
      if (index === -1) return [...list, order];
      const next = [...list];
      next[index] = order;
      return next;
    });
  }

  private appendRealtimeMessage(message: ChatMessage): void {
    if (message.conversationId !== this.selectedConversationId()) return;
    this.messages.update(list => {
      if (list.some(m => m.id === message.id)) return list;
      this.liveAnimation.set(true);
      return [...list, message];
    });
  }

  private _playId = 0;

  /** Returns to the conversation list (used by the mobile master-detail back button). */
  clearSelection(): void {
    this._playId++;
    this.selectedConversationId.set(null);
    this.messages.set([]);
    this.isClientTyping.set(false);
    this.botInputText.set('');
  }

  selectConversation(id: number): void {
    this._playId++;
    const playId = this._playId;

    this.selectedConversationId.set(id);
    this.messages.set([]);
    this.isClientTyping.set(false);
    this.botInputText.set('');
    this.liveAnimation.set(false);

    this.api.chatMessages.getAll().subscribe(all => {
      if (this._playId !== playId) return;
      const msgs = all.filter(m => m.conversationId === id);
      // Always show history instantly — no replay animation.
      // Real-time new messages arrive via SSE and are shown with liveAnimation.
      this.messages.set(msgs);
    });
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
        this.messages.update(m => m.some(x => x.id === created.id) ? m : [...m, created]);
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
      this.messages.update(msgs => msgs.some(x => x.id === created.id) ? msgs : [...msgs, created]);
    });
  }

  /**
   * Marks the session as connected in the DB and updates the signal so the
   * status card is shown. Called when QrConnectionCard reports that the bridge
   * is authenticated (either after a real QR scan or because the bridge was
   * already running when the QR card appeared).
   */
  markSessionConnected(): void {
    const current = this.session();
    if (!current || current.status === 'connected') return;
    const updated: WhatsappSession = { ...current, status: 'connected' };
    this.api.whatsappSessions.update(updated, current.id).subscribe(session => {
      this.session.set(session);
    });
  }

  /**
   * Marks the session as disconnected in the DB and updates the signal so the
   * QR card is shown. Used both by the manual "Disconnect" button and by the
   * background bridge-health check when unexpected disconnections are detected.
   */
  simulateDisconnect(): void {
    const current = this.session();
    if (!current) return;
    const updated: WhatsappSession = { ...current, status: 'disconnected', connectedAt: undefined };
    this.api.whatsappSessions.update(updated, current.id).subscribe(session => {
      this.session.set(session);
    });
  }

  /**
   * Polls the bridge QR state once. If the bridge generated a new QR while the
   * app still shows "connected" (unexpected disconnection: credentials expired,
   * bridge restarted), marks the session as disconnected so the QR card appears.
   */
  checkBridgeConnection(): void {
    const url = `${environment.entreprenlyProviderApiBaseUrl}/chatbot/whatsapp/bridge/qr`;
    this.http.get<BridgeQrState>(url).subscribe({
      next: state => {
        if (state.qr && this.session()?.status === 'connected') {
          this.simulateDisconnect();
        }
      },
      error: () => { /* bridge offline — keep current state */ },
    });
  }

  approveOrder(orderId: number): void {
    const order = this.orders().find(o => o.id === orderId);
    if (!order) return;

    const updated: ChatOrder = { ...order, status: 'CONFIRMED' as OrderStatus };
    this.api.chatOrders.update(updated, orderId).subscribe(confirmed => {
      this.orders.update(list => list.map(o => o.id === orderId ? confirmed : o));
      this._updateConversationStatus(order.conversationId, 'COMPLETED');

      const time = new Date().toLocaleTimeString(this.locale, { hour: '2-digit', minute: '2-digit' });
      const sysMsg: ChatMessage = {
        id: 0, conversationId: order.conversationId,
        content: this.translate.instant('chatbot.messages.sysPaymentApproved', { time }),
        sender: 'system', type: 'text', sentAt: new Date().toISOString(),
      };
      const botMsg: ChatMessage = {
        id: 0, conversationId: order.conversationId,
        content: this.translate.instant('chatbot.messages.botPaymentApproved', { orderNumber: order.orderNumber }),
        sender: 'bot', type: 'text', sentAt: new Date().toISOString(),
      };

      this.api.chatMessages.create(sysMsg).subscribe(created => {
        this.messages.update(m => m.some(x => x.id === created.id) ? m : [...m, created]);
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

      const time = new Date().toLocaleTimeString(this.locale, { hour: '2-digit', minute: '2-digit' });

      const sysContent = isBlocked
        ? this.translate.instant('chatbot.messages.sysBlocked',         { time })
        : this.translate.instant('chatbot.messages.sysReceiptRejected',  { time });

      const botContent = isBlocked
        ? this.translate.instant('chatbot.messages.botBlocked',         { orderNumber: order.orderNumber })
        : this.translate.instant('chatbot.messages.botReceiptRejected', { orderNumber: order.orderNumber, reason });

      const sysMsg: ChatMessage = {
        id: 0, conversationId: order.conversationId,
        content: sysContent, sender: 'system', type: 'text', sentAt: new Date().toISOString(),
      };
      const botMsg: ChatMessage = {
        id: 0, conversationId: order.conversationId,
        content: botContent, sender: 'bot', type: 'text', sentAt: new Date().toISOString(),
      };

      this.api.chatMessages.create(sysMsg).subscribe(created => {
        this.messages.update(m => m.some(x => x.id === created.id) ? m : [...m, created]);
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

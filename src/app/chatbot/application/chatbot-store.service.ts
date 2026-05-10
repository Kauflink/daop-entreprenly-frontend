import { Injectable, inject, signal, computed } from '@angular/core';
import { timer } from 'rxjs';
import { ChatbotApiService } from '../infrastructure/chatbot-api.service';
import { Conversation } from '../domain/model/conversation.entity';
import { ChatMessage } from '../domain/model/chat-message.entity';
import { WhatsappSession } from '../domain/model/whatsapp-session.entity';

@Injectable({ providedIn: 'root' })
export class ChatbotStoreService {
  private api = inject(ChatbotApiService);

  readonly session = signal<WhatsappSession | null>(null);
  readonly conversations = signal<Conversation[]>([]);
  readonly selectedConversationId = signal<number | null>(null);
  readonly messages = signal<ChatMessage[]>([]);

  readonly selectedConversation = computed(() =>
    this.conversations().find(c => c.id === this.selectedConversationId()) ?? null,
  );

  readonly isConnected = computed(() => this.session()?.status === 'connected');

  loadSession(): void {
    this.api.whatsappSessions.getAll().subscribe(sessions => {
      this.session.set(sessions[0] ?? null);
    });
  }

  loadConversations(): void {
    this.api.conversations.getAll().subscribe(conversations => {
      this.conversations.set(conversations);
    });
  }

  selectConversation(id: number): void {
    this.selectedConversationId.set(id);
    this.api.chatMessages.getAll().subscribe(messages => {
      this.messages.set(messages.filter(m => m.conversationId === id));
    });
  }

  sendMessage(content: string): void {
    const conversationId = this.selectedConversationId();
    if (!conversationId) return;

    const message: ChatMessage = {
      id: 0,
      conversationId,
      content,
      sender: 'client',
      type: 'text',
      sentAt: new Date().toISOString(),
    };

    this.api.chatMessages.create(message).subscribe(created => {
      this.messages.update(msgs => [...msgs, created]);
      this.simulateBotResponse(conversationId, content);
    });
  }

  private simulateBotResponse(conversationId: number, clientMessage: string): void {
    const systemMsg: ChatMessage = {
      id: 0,
      conversationId,
      content: 'Comerciante está escribiendo...',
      sender: 'system',
      type: 'text',
      sentAt: new Date().toISOString(),
    };

    this.api.chatMessages.create(systemMsg).subscribe(saved => {
      this.messages.update(msgs => [...msgs, saved]);

      timer(2000).subscribe(() => {
        this.messages.update(msgs => msgs.filter(m => m.id !== saved.id));

        const botReply: ChatMessage = {
          id: 0,
          conversationId,
          content: this.getBotReply(clientMessage),
          sender: 'bot',
          type: 'text',
          sentAt: new Date().toISOString(),
        };

        this.api.chatMessages.create(botReply).subscribe(reply => {
          this.messages.update(msgs => [...msgs, reply]);
        });
      });
    });
  }

  private getBotReply(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('precio') || lower.includes('cuesta') || lower.includes('valor')) {
      return 'El precio está actualizado en nuestro catálogo. ¿Deseas agregar este producto a tu pedido?';
    }
    if (lower.includes('stock') || lower.includes('disponible') || lower.includes('hay')) {
      return 'Tenemos stock disponible. ¿Cuántas unidades deseas?';
    }
    if (lower.includes('confirmo') || lower.includes('sí') || lower.includes('si')) {
      return 'Perfecto, pedido registrado. Te enviaré las instrucciones de pago.';
    }
    if (lower.includes('gracias')) {
      return 'Con gusto. Que tenga un buen día.';
    }
    return 'Entendido. ¿En qué más puedo ayudarte?';
  }
}

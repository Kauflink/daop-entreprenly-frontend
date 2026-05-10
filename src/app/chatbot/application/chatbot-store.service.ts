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
  readonly isSessionLoaded = signal(false);
  readonly conversations = signal<Conversation[]>([]);
  readonly selectedConversationId = signal<number | null>(null);
  readonly messages = signal<ChatMessage[]>([]);
  readonly isBotTyping = signal(false);

  readonly selectedConversation = computed(() =>
    this.conversations().find(c => c.id === this.selectedConversationId()) ?? null,
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

  selectConversation(id: number): void {
    this.selectedConversationId.set(id);
    this.messages.set([]);
    this.isBotTyping.set(true);

    timer(1500).subscribe(() => {
      this.api.chatMessages.getAll().subscribe(all => {
        this.isBotTyping.set(false);
        this.messages.set(all.filter(m => m.conversationId === id));
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
}

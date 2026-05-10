import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ChatbotStoreService } from '../../../application/chatbot-store.service';
import { ConversationList } from '../../components/conversation-list/conversation-list';
import { ConversationHeader } from '../../components/conversation-header/conversation-header';
import { MessageBubble } from '../../components/message-bubble/message-bubble';
import { ChatInput } from '../../components/chat-input/chat-input';

@Component({
  selector: 'app-conversations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ConversationList, ConversationHeader, MessageBubble, ChatInput],
  templateUrl: './conversations.html',
})
export class Conversations implements OnInit {
  protected readonly store = inject(ChatbotStoreService);
  private readonly router = inject(Router);
  private readonly messagesContainer = viewChild<ElementRef>('messagesContainer');

  constructor() {
    effect(() => {
      if (this.store.isSessionLoaded()) {
        const session = this.store.session();
        if (!session || session.status !== 'connected') {
          this.router.navigate(['/dashboard/chatbot']);
        }
      }
    });

    effect(() => {
      this.store.messages();
      const el = this.messagesContainer()?.nativeElement;
      if (el) {
        setTimeout(() => { el.scrollTop = el.scrollHeight; }, 0);
      }
    });
  }

  ngOnInit(): void {
    this.store.loadSession();
    this.store.loadConversations();
    this.store.loadOrders();
  }

  protected onApprove(): void {
    const order = this.store.pendingOrder();
    if (order) this.store.approveOrder(order.id);
  }

  protected onReject(): void {
    const order = this.store.pendingOrder();
    if (order) this.store.rejectOrder(order.id);
  }

  protected onConversationSelected(id: number): void {
    this.store.selectConversation(id);
  }

  protected onMessageSent(content: string): void {
    this.store.sendMessage(content);
  }
}

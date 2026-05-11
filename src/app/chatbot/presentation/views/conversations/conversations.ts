import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ChatbotStoreService } from '../../../application/chatbot-store.service';
import { ConversationList } from '../../components/conversation-list/conversation-list';
import { ConversationHeader } from '../../components/conversation-header/conversation-header';
import { MessageBubble } from '../../components/message-bubble/message-bubble';
import { ChatInput } from '../../components/chat-input/chat-input';

@Component({
  selector: 'app-conversations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ConversationList, ConversationHeader, MessageBubble, ChatInput, TranslatePipe],
  templateUrl: './conversations.html',
})
export class Conversations implements OnInit {
  protected readonly store = inject(ChatbotStoreService);
  private readonly router = inject(Router);
  private readonly messagesContainer = viewChild<ElementRef>('messagesContainer');

  /** Only show the pending payment bar AFTER the comprobante image appears in the chat */
  protected readonly receiptVisible = computed(() =>
    this.store.messages().some(m => m.sender === 'client' && m.type === 'image'),
  );

  protected readonly showRejectForm = signal(false);
  protected readonly selectedReason = signal('Imagen ilegible');
  protected readonly rejectReasons = ['Imagen ilegible', 'Monto incorrecto', 'Comprobante falso'] as const;

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

    // Reset reject form whenever conversation changes
    effect(() => {
      this.store.selectedConversationId();
      this.showRejectForm.set(false);
      this.selectedReason.set('Imagen ilegible');
    });
  }

  ngOnInit(): void {
    this.store.loadSession();
    this.store.loadConversations();
    this.store.loadOrders();
  }

  protected onApprove(): void {
    const order = this.store.pendingOrder();
    if (order) {
      this.store.approveOrder(order.id);
      this.showRejectForm.set(false);
    }
  }

  protected onReject(): void {
    this.showRejectForm.set(true);
  }

  protected onConfirmReject(): void {
    const order = this.store.pendingOrder();
    if (order) {
      this.store.rejectOrder(order.id, this.selectedReason());
      this.showRejectForm.set(false);
      this.selectedReason.set('Imagen ilegible');
    }
  }

  protected onCancelReject(): void {
    this.showRejectForm.set(false);
    this.selectedReason.set('Imagen ilegible');
  }

  protected onConversationSelected(id: number): void {
    this.store.selectConversation(id);
  }

  protected onMessageSent(content: string): void {
    this.store.sendMessage(content);
  }
}

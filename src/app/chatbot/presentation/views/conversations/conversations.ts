import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ChatbotStoreService } from '../../../../application/chatbot-store.service';
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

  ngOnInit(): void {
    this.store.loadConversations();
  }

  protected onConversationSelected(id: number): void {
    this.store.selectConversation(id);
  }

  protected onMessageSent(content: string): void {
    this.store.sendMessage(content);
  }
}

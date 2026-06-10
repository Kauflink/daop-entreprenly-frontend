import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Conversation } from '../../../domain/model/conversation.entity';

@Component({
  selector: 'app-conversation-list-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="w-full border-b border-gray-100 px-4 py-3 text-left transition-colors"
      [class]="selected() ? 'bg-orange-50' : 'hover:bg-gray-50'"
      (click)="selected_conversation.emit(conversation().id)"
    >
      <div class="flex min-w-0 items-start justify-between gap-2">
        <p class="min-w-0 truncate font-bold text-gray-900">{{ conversation().clientName }}</p>
        <span class="shrink-0 whitespace-nowrap text-xs text-gray-400">{{ conversation().lastMessageTime }}</span>
      </div>
      <p class="mt-0.5 truncate text-sm text-gray-500">{{ conversation().lastMessage }}</p>
    </button>
  `,
})
export class ConversationListItem {
  readonly conversation = input.required<Conversation>();
  readonly selected = input<boolean>(false);
  readonly selected_conversation = output<number>();
}

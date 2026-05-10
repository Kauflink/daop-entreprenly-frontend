import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Conversation } from '../../../domain/model/conversation.entity';
import { ConversationListItem } from '../conversation-list-item/conversation-list-item';

@Component({
  selector: 'app-conversation-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ConversationListItem],
  template: `
    <div class="flex h-full flex-col border-r border-gray-200">
      <div class="border-b border-gray-200 px-4 py-4">
        <h2 class="font-semibold text-gray-800">Conversaciones</h2>
      </div>
      @if (conversations().length === 0) {
        <div class="flex flex-1 items-center justify-center">
          <p class="text-sm text-gray-400">Sin conversaciones</p>
        </div>
      } @else {
        <div class="flex-1 overflow-y-auto">
          @for (conversation of conversations(); track conversation.id) {
            <app-conversation-list-item
              [conversation]="conversation"
              [selected]="selectedId() === conversation.id"
              (selected_conversation)="conversationSelected.emit($event)"
            />
          }
        </div>
      }
    </div>
  `,
})
export class ConversationList {
  readonly conversations = input<Conversation[]>([]);
  readonly selectedId = input<number | null>(null);
  readonly conversationSelected = output<number>();
}

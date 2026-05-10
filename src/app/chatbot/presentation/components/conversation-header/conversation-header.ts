import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Conversation } from '../../../domain/model/conversation.entity';

@Component({
  selector: 'app-conversation-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-3 border-b border-gray-200 px-6 py-3">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-full bg-orange-300 text-sm font-semibold text-white"
      >
        {{ initials() }}
      </div>
      <div>
        <p class="font-semibold text-gray-800">{{ conversation().clientName }}</p>
        <p class="text-xs text-green-500">En línea</p>
      </div>
    </div>
  `,
})
export class ConversationHeader {
  readonly conversation = input.required<Conversation>();

  readonly initials = computed(() => {
    const parts = this.conversation().clientName.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  });
}

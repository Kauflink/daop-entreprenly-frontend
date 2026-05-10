import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ChatMessage } from '../../../domain/model/chat-message.entity';

@Component({
  selector: 'app-message-bubble',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (message().sender === 'system') {
      <div class="flex justify-center py-1">
        <span class="rounded-full bg-gray-200 px-3 py-0.5 text-xs text-gray-500">
          {{ message().content }}
        </span>
      </div>
    } @else if (message().sender === 'client') {
      <div class="flex items-end justify-end gap-2">
        <div class="max-w-xs rounded-2xl rounded-br-sm bg-orange-400 px-4 py-2">
          @if (message().type === 'image') {
            <img [src]="message().content" alt="Comprobante" class="max-w-full rounded" />
          } @else {
            <p class="text-sm text-white">{{ message().content }}</p>
          }
        </div>
        <div
          class="flex h-8 w-8 items-center justify-center rounded-full bg-orange-300 text-xs font-semibold text-white"
        >
          {{ clientInitials() }}
        </div>
      </div>
    } @else {
      <div class="flex items-end gap-2">
        <div
          class="flex h-8 w-8 items-center justify-center rounded-full bg-green-400 text-xs font-semibold text-white"
        >
          BH
        </div>
        <div class="max-w-xs rounded-2xl rounded-bl-sm border border-gray-200 bg-white px-4 py-2">
          <p class="whitespace-pre-line text-sm text-gray-700">{{ message().content }}</p>
        </div>
      </div>
    }
  `,
})
export class MessageBubble {
  readonly message = input.required<ChatMessage>();
  readonly clientInitials = input<string>('AT');
}

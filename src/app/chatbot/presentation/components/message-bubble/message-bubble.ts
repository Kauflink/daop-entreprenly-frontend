import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ChatbotStoreService } from '../../../application/chatbot-store.service';
import { ChatMessage } from '../../../domain/model/chat-message.entity';

@Component({
  selector: 'app-message-bubble',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    @if (message().sender === 'system') {
      <div class="flex justify-center py-1">
        <span class="rounded-full bg-gray-200 px-3 py-0.5 text-xs text-gray-500">
          {{ systemText() }}
        </span>
      </div>
    } @else if (message().sender === 'client') {
      <div class="flex items-end gap-2">
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-400 text-xs font-bold text-white"
        >
          {{ clientInitials() }}
        </div>
        <div class="max-w-xs rounded-2xl rounded-bl-sm bg-orange-400 px-4 py-2.5 shadow-sm">
          @if (message().type === 'image') {
            @if (receiptImageSrc()) {
              <img [src]="receiptImageSrc()" [alt]="'chatbot.message.receiptAlt' | translate" class="w-40 rounded-lg" />
            } @else {
              <p class="text-sm text-white">📷 Comprobante de pago</p>
            }
          } @else {
            <p class="text-sm text-white">{{ message().content }}</p>
          }
        </div>
      </div>
    } @else {
      <div class="flex items-end justify-end gap-2">
        <div class="max-w-xs rounded-2xl rounded-br-sm border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
          <p class="whitespace-pre-line text-sm text-gray-700">{{ message().content }}</p>
        </div>
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-400 text-xs font-bold text-white"
        >
          BH
        </div>
      </div>
    }
  `,
})
export class MessageBubble {
  readonly message        = input.required<ChatMessage>();
  readonly clientInitials = input<string>('AT');

  private readonly translate = inject(TranslateService);
  private readonly store     = inject(ChatbotStoreService);

  /** Resolves the receipt image from the order, so we never store base64 in chat messages. */
  protected readonly receiptImageSrc = computed(() => {
    if (this.message().type !== 'image') return '';
    const convId = this.message().conversationId;
    return this.store.orders().find(o => o.conversationId === convId && o.receiptImage)?.receiptImage ?? '';
  });

  /** Traduce mensajes de sistema que usan formato 'chatbot.sys.CLAVE|param1|param2' */
  protected readonly systemText = computed(() => {
    const content = this.message().content;
    if (!content.startsWith('chatbot.sys.')) return content;

    const [key, ...params] = content.split('|');
    const paramMap: Record<string, string> = {};

    // Mapea los parámetros según la clave
    if (key === 'chatbot.sys.orderRegistered') {
      paramMap['orderNumber'] = params[0] ?? '';
      paramMap['time']        = params[1] ?? '';
    } else if (params[0]) {
      paramMap['time'] = params[0];
    }

    return this.translate.instant(key, paramMap);
  });
}

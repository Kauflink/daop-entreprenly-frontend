import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { WhatsappSession } from '../../../domain/model/whatsapp-session.entity';

@Component({
  selector: 'app-whatsapp-status-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe],
  template: `
    @if (justConnected()) {
      <div class="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4">
        <p class="font-semibold text-green-700">{{ 'chatbot.statusCard.connectedTitle' | translate }}</p>
        <p class="mt-1 text-sm text-green-600">{{ 'chatbot.statusCard.connectedDetail' | translate }}</p>
      </div>
    }
    @if (session()?.status === 'expired') {
      <div class="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4">
        <p class="font-semibold text-red-600">{{ 'chatbot.statusCard.expiredTitle' | translate }}</p>
        <p class="mt-1 text-sm text-red-500">{{ 'chatbot.statusCard.expiredDetail' | translate }}</p>
      </div>
    }
    <div class="max-w-2xl rounded-2xl border border-gray-200 bg-white p-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="flex flex-col gap-1">
          <p class="font-bold text-gray-900">{{ 'chatbot.statusCard.cardTitle' | translate }}</p>
          @if (session(); as s) {
            <p class="text-sm text-gray-500">
              {{ s.phone }}
              @if (s.status === 'connected' && s.connectedAt) {
                — {{ 'chatbot.statusCard.activeSince' | translate }} {{ formatDate(s.connectedAt) }}
              }
              @if (s.status === 'expired' && s.connectedAt) {
                — {{ 'chatbot.statusCard.lastConnection' | translate }} {{ formatDate(s.connectedAt) }}
              }
              @if (s.businessName) {
                · {{ s.businessName }}
              }
            </p>
            @if (s.status === 'connected') {
              <p class="mt-1 text-sm text-gray-500">{{ 'chatbot.statusCard.operative' | translate }}</p>
              <div class="mt-3 flex gap-2">
                <a
                  routerLink="/dashboard/chatbot/conversations"
                  class="inline-block rounded-full bg-orange-500 px-5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                >
                  {{ 'chatbot.statusCard.viewConversations' | translate }}
                </a>
                <button
                  type="button"
                  (click)="reconnect.emit()"
                  class="rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-50"
                >
                  {{ 'chatbot.statusCard.disconnect' | translate }}
                </button>
              </div>
            }
            @if (s.status === 'expired' || s.status === 'disconnected') {
              <button
                class="mt-3 w-fit rounded-full border border-orange-500 px-4 py-1.5 text-sm text-orange-500 hover:bg-orange-50"
                (click)="reconnect.emit()"
              >
                {{ 'chatbot.statusCard.reconnect' | translate }}
              </button>
            }
          }
        </div>
        @if (session(); as s) {
          <span
            class="shrink-0 rounded-full px-3 py-1 text-xs font-medium"
            [class]="s.status === 'connected' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'"
          >
            {{ (s.status === 'connected' ? 'chatbot.statusCard.connected' : 'chatbot.statusCard.disconnected') | translate }}
          </span>
        }
      </div>
    </div>
  `,
})
export class WhatsappStatusCard {
  readonly session = input<WhatsappSession | null>(null);
  readonly justConnected = input<boolean>(false);
  readonly reconnect = output<void>();

  formatDate(raw: string | undefined): string {
    if (!raw) return '';
    try {
      return new Date(raw).toLocaleString('es-PE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return raw;
    }
  }
}

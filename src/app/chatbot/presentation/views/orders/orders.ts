import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ChatbotStoreService } from '../../../application/chatbot-store.service';
import { ChatOrder } from '../../../domain/model/chat-order.entity';

@Component({
  selector: 'app-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe],
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-bold text-gray-900">{{ 'chatbot.orders.title' | translate }}</h1>
      <p class="mb-6 mt-1 text-sm text-gray-500">{{ 'chatbot.orders.subtitle' | translate }}</p>

      @if (!store.isConnected()) {
        <div class="flex flex-col items-center justify-center rounded-2xl bg-white p-20 shadow-sm">
          <svg class="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
          <p class="mt-3 text-sm text-gray-400">{{ 'chatbot.orders.connectPrompt' | translate }}</p>
          <a routerLink="/dashboard/chatbot" class="mt-4 text-sm text-orange-500 hover:underline">
            {{ 'chatbot.orders.goToConfig' | translate }}
          </a>
        </div>
      } @else if (allOrders().length === 0) {
        <div class="flex flex-col items-center justify-center rounded-2xl bg-white p-20 shadow-sm">
          <svg class="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="mt-3 text-sm text-gray-400">{{ 'chatbot.orders.empty' | translate }}</p>
          <a routerLink="/dashboard/chatbot/conversations" class="mt-4 text-sm text-orange-500 hover:underline">
            {{ 'chatbot.orders.goToConversations' | translate }}
          </a>
        </div>
      }

      <div class="flex flex-col gap-4">
        @for (order of allOrders(); track order.id) {
          <div class="rounded-2xl border bg-white shadow-sm"
            [class]="borderClass(order.status)">

            <div class="flex items-start justify-between gap-4 p-6 pb-4">
              <div>
                <h2 class="font-bold text-gray-900">
                  {{ order.orderNumber }} — {{ clientName(order) }}
                </h2>
                <p class="mt-0.5 text-sm text-gray-500">
                  {{ order.paymentMethod }} · S/{{ order.total.toFixed(2) }} · {{ formatDate(order.createdAt) }}
                </p>
              </div>
              <span class="shrink-0 rounded-full px-3 py-1 text-xs font-medium"
                [class]="badgeClass(order.status, order.hasReceipt)">
                {{ badgeLabel(order.status, order.hasReceipt) }}
              </span>
            </div>

            <div class="flex flex-col gap-6 px-6 pb-6 sm:flex-row">
              @if (order.hasReceipt) {
                <img
                  [src]="receiptUrl(order.total)"
                  [alt]="'chatbot.orders.receiptAlt' | translate"
                  class="h-44 w-36 self-center rounded-xl object-cover shadow-sm sm:self-start"
                />
              }

              <div class="flex flex-1 flex-col justify-between gap-4">
                <div class="flex flex-col gap-1.5">
                  @for (item of order.items; track $index) {
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-700">{{ item.quantity }}x {{ item.productName }}</span>
                      <span class="text-gray-900">S/{{ (item.quantity * item.unitPrice).toFixed(2) }}</span>
                    </div>
                  }
                  <p class="mt-1 text-xs text-gray-400">{{ 'chatbot.orders.delivery' | translate }} {{ order.deliveryAddress }}</p>
                  <div class="mt-1 flex justify-between border-t border-gray-100 pt-2 text-sm font-semibold">
                    <span class="text-orange-500">{{ 'chatbot.orders.total' | translate }}</span>
                    <span class="text-orange-500">S/{{ order.total.toFixed(2) }}</span>
                  </div>
                </div>

                <div class="rounded-xl bg-gray-50 px-4 py-3">
                  <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {{ 'chatbot.orders.traceability' | translate }}
                  </p>
                  <ol class="flex flex-col gap-1.5">
                    <li class="flex items-center gap-2 text-xs text-gray-600">
                      <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400"></span>
                      {{ 'chatbot.orders.trace.registered' | translate: { date: formatDate(order.createdAt) } }}
                    </li>
                    <li class="flex items-center gap-2 text-xs text-gray-600">
                      <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400"></span>
                      {{ 'chatbot.orders.trace.paymentSent' | translate }}
                    </li>
                    @if (order.hasReceipt || order.rejectionCount > 0) {
                      <li class="flex items-center gap-2 text-xs text-gray-600">
                        <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400"></span>
                        {{ 'chatbot.orders.trace.receiptReceived' | translate }}
                      </li>
                    }
                    @if (order.rejectionCount > 0) {
                      <li class="flex items-center gap-2 text-xs text-red-500">
                        <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400"></span>
                        {{ 'chatbot.orders.trace.receiptRejected' | translate: { count: order.rejectionCount } }}
                      </li>
                    }
                    @if (order.status === 'CONFIRMED') {
                      <li class="flex items-center gap-2 text-xs font-medium text-green-700">
                        <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500"></span>
                        {{ 'chatbot.orders.trace.paymentApproved' | translate }}
                      </li>
                    } @else if (order.status === 'BLOCKED') {
                      <li class="flex items-center gap-2 text-xs font-medium text-red-700">
                        <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-red-600"></span>
                        {{ 'chatbot.orders.trace.blocked' | translate }}
                      </li>
                    } @else if (order.status === 'CANCELLED') {
                      <li class="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400"></span>
                        {{ 'chatbot.orders.trace.cancelled' | translate }}
                      </li>
                    } @else if (order.status === 'WAITING_PAYMENT' && order.hasReceipt) {
                      <li class="flex items-center gap-2 text-xs text-orange-500">
                        <span class="h-1.5 w-1.5 animate-pulse shrink-0 rounded-full bg-orange-400"></span>
                        {{ 'chatbot.orders.trace.pendingValidation' | translate }}
                      </li>
                    } @else if (order.status === 'WAITING_PAYMENT' && !order.hasReceipt) {
                      <li class="flex items-center gap-2 text-xs text-gray-400">
                        <span class="h-1.5 w-1.5 animate-pulse shrink-0 rounded-full bg-gray-300"></span>
                        {{ 'chatbot.orders.trace.awaitingReceipt' | translate }}
                      </li>
                    }
                  </ol>
                </div>

                @if (order.status === 'WAITING_PAYMENT' && order.hasReceipt) {
                  <div class="flex flex-wrap gap-3">
                    <button
                      type="button"
                      (click)="approve(order.id)"
                      class="rounded-full border-2 border-green-500 px-6 py-1.5 text-sm font-medium text-green-600 transition-colors hover:bg-green-50"
                    >
                      {{ 'chatbot.orders.approvePayment' | translate }}
                    </button>
                    <button
                      type="button"
                      (click)="reject(order.id)"
                      class="rounded-full border-2 border-red-400 px-6 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                    >
                      {{ 'chatbot.orders.rejectPayment' | translate }}
                      @if (order.rejectionCount > 0) {
                        <span class="ml-1 text-xs opacity-70">{{ 'chatbot.orders.willBlock' | translate }}</span>
                      }
                    </button>
                  </div>
                }

                @if (order.status === 'BLOCKED') {
                  <div class="rounded-lg bg-red-50 px-4 py-2.5 text-xs text-red-600">
                    {{ 'chatbot.orders.blockedMessage' | translate }}
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class Orders implements OnInit {
  protected readonly store = inject(ChatbotStoreService);
  private readonly translate = inject(TranslateService);

  protected readonly allOrders = computed(() =>
    [...this.store.orders()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  );

  ngOnInit(): void {
    this.store.loadSession();
    this.store.loadOrders();
    this.store.loadConversations();
    this.store.loadInventoryProducts();
    this.store.connectRealtime();
  }

  protected receiptUrl(total: number): string {
    return `/assets/comprobante-${total.toFixed(2)}.svg`;
  }

  protected clientName(order: ChatOrder): string {
    return this.store.conversations().find(c => c.id === order.conversationId)?.clientName ?? 'Cliente';
  }

  protected formatDate(dateStr: string): string {
    const lang   = this.translate.currentLang ?? this.translate.defaultLang ?? 'es';
    const locale = lang === 'en' ? 'en-US' : 'es-PE';
    return new Date(dateStr).toLocaleString(locale, {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  protected borderClass(status: string): string {
    if (status === 'CONFIRMED') return 'border-green-200';
    if (status === 'BLOCKED') return 'border-red-300';
    if (status === 'CANCELLED') return 'border-gray-300';
    return 'border-orange-200';
  }

  protected badgeClass(status: string, hasReceipt: boolean): string {
    if (status === 'CONFIRMED') return 'bg-green-100 text-green-700';
    if (status === 'BLOCKED') return 'bg-red-100 text-red-700';
    if (status === 'CANCELLED') return 'bg-gray-100 text-gray-500';
    if (status === 'WAITING_PAYMENT' && hasReceipt) return 'bg-orange-100 text-orange-600';
    return 'bg-gray-100 text-gray-500';
  }

  protected badgeLabel(status: string, hasReceipt: boolean): string {
    if (status === 'CONFIRMED') return this.translate.instant('chatbot.orders.status.approved');
    if (status === 'BLOCKED') return this.translate.instant('chatbot.orders.status.blocked');
    if (status === 'CANCELLED') return this.translate.instant('chatbot.orders.status.cancelled');
    if (status === 'WAITING_PAYMENT' && hasReceipt) return this.translate.instant('chatbot.orders.status.receiptReceived');
    if (status === 'WAITING_PAYMENT' && !hasReceipt) return this.translate.instant('chatbot.orders.status.awaitingReceipt');
    return status;
  }

  protected approve(id: number): void {
    this.store.approveOrder(id);
  }

  protected reject(id: number): void {
    this.store.rejectOrder(id);
  }
}

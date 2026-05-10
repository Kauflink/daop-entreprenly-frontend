import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChatbotStoreService } from '../../../application/chatbot-store.service';
import { ChatOrder } from '../../../domain/model/chat-order.entity';

@Component({
  selector: 'app-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-bold text-gray-900">Pedidos</h1>
      <p class="mb-6 mt-1 text-sm text-gray-500">Revisión de comprobantes pendientes</p>

      <div class="flex flex-col gap-4">
        @for (order of pendingOrders(); track order.id) {
          <div class="rounded-2xl border border-gray-200 bg-white p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="font-bold text-gray-900">
                  {{ order.orderNumber }} — {{ clientName(order) }}
                </h2>
                <p class="mt-0.5 text-sm text-gray-500">
                  {{ order.paymentMethod }} — S/{{ order.total }} — {{ formatDate(order.createdAt) }}
                </p>
              </div>
              <span class="shrink-0 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-600">
                Pago pendiente de validación
              </span>
            </div>

            <div class="mt-5 flex gap-6">
              <img
                src="/assets/placeholder-comprobante.svg"
                alt="Comprobante de pago"
                class="h-44 w-36 rounded-xl object-cover shadow-sm"
              />
              <div class="flex flex-1 flex-col justify-between">
                <div class="flex flex-col gap-1.5">
                  @for (item of order.items; track $index) {
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-700">{{ item.quantity }} {{ item.productName }}</span>
                      <span class="text-gray-900">S/{{ (item.quantity * item.unitPrice).toFixed(2) }}</span>
                    </div>
                  }
                  <p class="mt-1 text-sm text-gray-400">Dirección: {{ order.deliveryAddress }}</p>
                  <div class="mt-1 flex justify-between border-t border-gray-100 pt-2 text-sm font-semibold">
                    <span class="text-orange-500">Total</span>
                    <span class="text-orange-500">S/{{ order.total }}</span>
                  </div>
                </div>
                <div class="flex gap-3">
                  <button
                    type="button"
                    (click)="approve(order.id)"
                    class="rounded-full border-2 border-green-500 px-6 py-1.5 text-sm font-medium text-green-600 transition-colors hover:bg-green-50"
                  >
                    Aprobar Pago
                  </button>
                  <button
                    type="button"
                    (click)="reject(order.id)"
                    class="rounded-full border-2 border-red-400 px-6 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                  >
                    Rechazar Pago
                  </button>
                </div>
              </div>
            </div>
          </div>
        } @empty {
          <div class="flex flex-col items-center justify-center rounded-2xl bg-white p-20 shadow-sm">
            <svg class="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="mt-3 text-sm text-gray-400">No hay pedidos pendientes de validación</p>
            <a routerLink="/dashboard/chatbot/conversations" class="mt-4 text-sm text-orange-500 hover:underline" aria-label="Ver conversaciones">
              Ver conversaciones →
            </a>
          </div>
        }
      </div>
    </div>
  `,
})
export class Orders implements OnInit {
  private readonly store = inject(ChatbotStoreService);

  protected readonly pendingOrders = computed(() =>
    this.store.orders().filter(o => o.status === 'WAITING_PAYMENT'),
  );

  ngOnInit(): void {
    this.store.loadOrders();
    this.store.loadConversations();
  }

  protected clientName(order: ChatOrder): string {
    return this.store.conversations().find(c => c.id === order.conversationId)?.clientName ?? 'Cliente';
  }

  protected formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  protected approve(id: number): void {
    this.store.approveOrder(id);
  }

  protected reject(id: number): void {
    this.store.rejectOrder(id);
  }
}

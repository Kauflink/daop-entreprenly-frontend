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
      <p class="mb-6 mt-1 text-sm text-gray-500">Historial y validación de comprobantes</p>

      @if (allOrders().length === 0) {
        <div class="flex flex-col items-center justify-center rounded-2xl bg-white p-20 shadow-sm">
          <svg class="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="mt-3 text-sm text-gray-400">No hay pedidos registrados aún</p>
          <a routerLink="/dashboard/chatbot/conversations" class="mt-4 text-sm text-orange-500 hover:underline">
            Ver conversaciones →
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

            <div class="flex gap-6 px-6 pb-6">
              @if (order.hasReceipt) {
                <img
                  [src]="receiptUrl(order.total)"
                  alt="Comprobante de pago"
                  class="h-44 w-36 rounded-xl object-cover shadow-sm"
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
                  <p class="mt-1 text-xs text-gray-400">Entrega: {{ order.deliveryAddress }}</p>
                  <div class="mt-1 flex justify-between border-t border-gray-100 pt-2 text-sm font-semibold">
                    <span class="text-orange-500">Total</span>
                    <span class="text-orange-500">S/{{ order.total.toFixed(2) }}</span>
                  </div>
                </div>

                <div class="rounded-xl bg-gray-50 px-4 py-3">
                  <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Trazabilidad</p>
                  <ol class="flex flex-col gap-1.5">
                    <li class="flex items-center gap-2 text-xs text-gray-600">
                      <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400"></span>
                      Pedido registrado — {{ formatDate(order.createdAt) }}
                    </li>
                    <li class="flex items-center gap-2 text-xs text-gray-600">
                      <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400"></span>
                      Instrucciones de pago enviadas al cliente
                    </li>
                    @if (order.hasReceipt || order.rejectionCount > 0) {
                      <li class="flex items-center gap-2 text-xs text-gray-600">
                        <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400"></span>
                        Comprobante recibido vía WhatsApp
                      </li>
                    }
                    @if (order.rejectionCount > 0) {
                      <li class="flex items-center gap-2 text-xs text-red-500">
                        <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400"></span>
                        Comprobante rechazado ({{ order.rejectionCount }}x) — imagen ilegible
                      </li>
                    }
                    @if (order.status === 'CONFIRMED') {
                      <li class="flex items-center gap-2 text-xs font-medium text-green-700">
                        <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500"></span>
                        Pago validado por el comerciante
                      </li>
                    } @else if (order.status === 'BLOCKED') {
                      <li class="flex items-center gap-2 text-xs font-medium text-red-700">
                        <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-red-600"></span>
                        Pedido bloqueado — múltiples rechazos
                      </li>
                    } @else if (order.status === 'CANCELLED') {
                      <li class="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400"></span>
                        Pedido cancelado por inactividad — stock repuesto
                      </li>
                    } @else if (order.status === 'WAITING_PAYMENT' && order.hasReceipt) {
                      <li class="flex items-center gap-2 text-xs text-orange-500">
                        <span class="h-1.5 w-1.5 animate-pulse shrink-0 rounded-full bg-orange-400"></span>
                        Pendiente de validación por el comerciante
                      </li>
                    } @else if (order.status === 'WAITING_PAYMENT' && !order.hasReceipt) {
                      <li class="flex items-center gap-2 text-xs text-gray-400">
                        <span class="h-1.5 w-1.5 animate-pulse shrink-0 rounded-full bg-gray-300"></span>
                        Esperando comprobante del cliente
                      </li>
                    }
                  </ol>
                </div>

                @if (order.status === 'WAITING_PAYMENT' && order.hasReceipt) {
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
                      Rechazar
                      @if (order.rejectionCount > 0) {
                        <span class="ml-1 text-xs opacity-70">(bloqueará al cliente)</span>
                      }
                    </button>
                  </div>
                }

                @if (order.status === 'BLOCKED') {
                  <div class="rounded-lg bg-red-50 px-4 py-2.5 text-xs text-red-600">
                    Pedido bloqueado. El cliente debe contactar a la bodega directamente.
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
  private readonly store = inject(ChatbotStoreService);

  protected readonly allOrders = computed(() =>
    [...this.store.orders()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  );

  ngOnInit(): void {
    this.store.loadOrders();
    this.store.loadConversations();
  }

  protected receiptUrl(total: number): string {
    return `/assets/comprobante-${total.toFixed(2)}.svg`;
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
    if (status === 'CONFIRMED') return 'Pago aprobado';
    if (status === 'BLOCKED') return 'Pedido bloqueado';
    if (status === 'CANCELLED') return 'Pedido cancelado';
    if (status === 'WAITING_PAYMENT' && hasReceipt) return 'Comprobante recibido';
    if (status === 'WAITING_PAYMENT' && !hasReceipt) return 'Esperando comprobante';
    return status;
  }

  protected approve(id: number): void {
    this.store.approveOrder(id);
  }

  protected reject(id: number): void {
    this.store.rejectOrder(id);
  }
}

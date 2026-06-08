import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ChatbotStoreService } from '../../../application/chatbot-store.service';
import { ChatOrder } from '../../../domain/model/chat-order.entity';
import { CurrencyFormatPipe } from '../../../../shared/presentation/pipes/currency-format.pipe';

@Component({
  selector: 'app-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, CurrencyFormatPipe],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
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
    return (
      this.store.conversations().find(c => c.id === order.conversationId)?.clientName ??
      this.translate.instant('chatbot.orders.clientFallback')
    );
  }

  protected formatDate(dateStr: string): string {
    const lang = this.translate.currentLang ?? this.translate.defaultLang ?? 'es';
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

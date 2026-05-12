import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SalesStore } from '../../../../sales/application/sales-store';
import { ChatbotStoreService } from '../../../../chatbot/application/chatbot-store.service';
import { InventoryStoreService } from '../../../../inventory/application/inventory-store.service';
import { StockAlert } from '../../../../inventory/domain/model/stock-alert.entity';

export interface InventoryDisplayItem {
  name: string;
  quantity: number;
  unit: string;
  stockLevel: number; // 0–100
  color: 'green' | 'yellow' | 'red';
}

interface QuickLink {
  labelKey: string;
  subtextKey: string;
  subtextDynamic?: string;
  icon: 'products' | 'lots' | 'chat' | 'orders' | 'reports';
  route: string;
  alertBadge?: boolean;
}

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  protected readonly salesStore     = inject(SalesStore);
  protected readonly chatbotStore   = inject(ChatbotStoreService);
  protected readonly inventoryStore = inject(InventoryStoreService);
  private   readonly translate      = inject(TranslateService);

  // ── Computed: ventas ────────────────────────────────────────────────────────
  protected readonly totalDay     = computed(() => this.salesStore.totalDay());
  protected readonly totalCash    = computed(() => this.salesStore.totalCash());
  protected readonly totalDigital = computed(() => this.salesStore.totalDigital());
  protected readonly saleCount    = computed(() => this.salesStore.saleCount());

  // ── Computed: chatbot ───────────────────────────────────────────────────────
  protected readonly isChatbotConnected  = computed(() => this.chatbotStore.isConnected());
  protected readonly chatbotPhone        = computed(() => this.chatbotStore.session()?.phone ?? '');
  protected readonly chatbotChatsCount   = computed(() => this.chatbotStore.conversations().length);
  protected readonly chatbotOrdersCount  = computed(() => this.chatbotStore.orders().length);

  // ── Computed: pedidos ───────────────────────────────────────────────────────
  protected readonly recentOrders = computed(() =>
    [...this.chatbotStore.orders()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
  );

  protected readonly pendingOrderCount = computed(() =>
    this.chatbotStore.orders().filter(o => o.status === 'WAITING_PAYMENT' && o.hasReceipt).length,
  );

  protected readonly confirmedOrderCount = computed(() =>
    this.chatbotStore.orders().filter(o => o.status === 'CONFIRMED').length,
  );

  // ── Computed: alertas ───────────────────────────────────────────────────────
  protected readonly stockAlerts = computed(() =>
    StockAlert.buildFromLots(
      this.inventoryStore.unitProducts(),
      this.inventoryStore.weightProducts(),
      this.inventoryStore.unitLots(),
      this.inventoryStore.weightLots(),
    ),
  );

  protected readonly hasAlerts     = computed(() => this.stockAlerts().length > 0);
  protected readonly alertsLoading = computed(() => this.inventoryStore.loading());

  // ── Computed: inventario para mostrar en panel ──────────────────────────────
  protected readonly inventoryDisplay = computed<InventoryDisplayItem[]>(() => {
    const unitProducts = this.inventoryStore.unitProducts();
    const unitLots     = this.inventoryStore.unitLots();
    const weightProducts = this.inventoryStore.weightProducts();
    const weightLots   = this.inventoryStore.weightLots();

    const items: InventoryDisplayItem[] = [];

    for (const p of unitProducts.slice(0, 4)) {
      const stock = unitLots
        .filter(l => l.productId === p.id)
        .reduce((sum, l) => sum + (l.quantity ?? 0), 0);
      const maxStock = 20;
      const level = Math.min(100, Math.round((stock / maxStock) * 100));
      items.push({
        name: p.name,
        quantity: stock,
        unit: 'und',
        stockLevel: level,
        color: level === 0 ? 'red' : level < 30 ? 'yellow' : 'green',
      });
    }

    for (const p of weightProducts.slice(0, Math.max(0, 4 - unitProducts.length))) {
      const stock = weightLots
        .filter(l => l.productId === p.id)
        .reduce((sum, l) => sum + (l.quantityKg ?? 0), 0);
      const maxStock = 20;
      const level = Math.min(100, Math.round((stock / maxStock) * 100));
      items.push({
        name: p.name,
        quantity: stock,
        unit: 'kg',
        stockLevel: level,
        color: level === 0 ? 'red' : level < 30 ? 'yellow' : 'green',
      });
    }

    return items;
  });

  // ── Computed: productos e inventario counts ─────────────────────────────────
  protected readonly productCount = computed(() =>
    this.inventoryStore.unitProducts().length + this.inventoryStore.weightProducts().length,
  );

  protected readonly lotCount = computed(() =>
    this.inventoryStore.unitLots().length + this.inventoryStore.weightLots().length,
  );

  // ── Quick links reactivos (badge en Lotes si hay alertas) ───────────────────
  protected readonly quickLinks = computed<QuickLink[]>(() => {
    const productCount = this.productCount();
    const lotCount     = this.lotCount();
    const chatConnected = this.isChatbotConnected();
    const chatsCount   = this.chatbotChatsCount();
    const ordersCount  = this.chatbotOrdersCount();
    const lang = this.translate.currentLang ?? 'es';
    const activeLabel  = lang === 'en' ? 'Active' : 'Activo';
    const disconnected = lang === 'en' ? 'Disconnected' : 'Desconectado';
    return [
      {
        labelKey: 'dashboard-home.links.products',
        subtextKey: '',
        subtextDynamic: `${productCount} ${lang === 'en' ? 'active' : 'activos'}`,
        icon: 'products',
        route: '/dashboard/inventory',
      },
      {
        labelKey: 'dashboard-home.links.lots',
        subtextKey: '',
        subtextDynamic: `${lotCount} ${lang === 'en' ? 'lots' : 'lotes'}`,
        icon: 'lots',
        route: '/dashboard/inventory/lots',
        alertBadge: this.hasAlerts(),
      },
      {
        labelKey: 'dashboard-home.links.chatbot',
        subtextKey: '',
        subtextDynamic: chatConnected
          ? `${activeLabel} · ${chatsCount} chats`
          : disconnected,
        icon: 'chat',
        route: '/dashboard/chatbot',
      },
      {
        labelKey: 'dashboard-home.links.orders',
        subtextKey: '',
        subtextDynamic: `${ordersCount} ${lang === 'en' ? 'today' : 'hoy'}`,
        icon: 'orders',
        route: '/dashboard/chatbot/orders',
      },
      {
        labelKey: 'dashboard-home.links.reports',
        subtextKey: 'dashboard-home.links.reportsSub',
        subtextDynamic: '',
        icon: 'reports',
        route: '/dashboard/sales',
      },
    ];
  });

  // ── Today label ─────────────────────────────────────────────────────────────
  protected get todayLabel(): string {
    const lang = this.translate.currentLang ?? this.translate.defaultLang ?? 'es';
    const locale = lang === 'en' ? 'en-US' : 'es-PE';
    return new Date().toLocaleDateString(locale, {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.chatbotStore.loadSession();
    this.chatbotStore.loadOrders();
    this.chatbotStore.loadConversations();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  protected clientName(conversationId: number): string {
    return this.chatbotStore.conversations().find(c => c.id === conversationId)?.clientName ?? 'Cliente';
  }

  protected orderTime(dateStr: string): string {
    const lang   = this.translate.currentLang ?? this.translate.defaultLang ?? 'es';
    const locale = lang === 'en' ? 'en-US' : 'es-PE';
    return new Date(dateStr).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  }

  protected orderStatusLabel(status: string, hasReceipt: boolean): string {
    const k = status === 'CONFIRMED'       ? 'confirmed'
            : status === 'BLOCKED'         ? 'blocked'
            : status === 'CANCELLED'       ? 'cancelled'
            : hasReceipt                   ? 'receiptReceived'
                                           : 'awaitingReceipt';
    return this.translate.instant(`dashboard-home.orders.status.${k}`);
  }

  protected orderStatusClass(status: string, hasReceipt: boolean): string {
    if (status === 'CONFIRMED')                              return 'bg-green-100 text-green-700';
    if (status === 'BLOCKED')                               return 'bg-red-100 text-red-700';
    if (status === 'CANCELLED')                             return 'bg-gray-100 text-gray-500';
    if (status === 'WAITING_PAYMENT' && hasReceipt)         return 'bg-orange-100 text-orange-600';
    return 'bg-gray-100 text-gray-500';
  }

  protected alertLabel(alert: StockAlert): string {
    const type = alert.alertType;
    if (type === 'low_stock') {
      const total = this.inventoryStore.unitLots()
        .filter(l => l.productId === alert.productId)
        .reduce((s, l) => s + (l.quantity ?? 0), 0);
      return this.translate.instant('dashboard-home.alerts.types.low_stock', { count: total });
    }
    return this.translate.instant(`dashboard-home.alerts.types.${type}`);
  }

  protected alertCardClass(alert: StockAlert): string {
    if (alert.alertType === 'expired' || alert.alertType === 'out_of_stock')
      return 'border-red-100 bg-red-50';
    if (alert.alertType === 'expiring_soon')
      return 'border-yellow-100 bg-yellow-50';
    return 'border-orange-100 bg-orange-50';
  }

  protected alertTextClass(alert: StockAlert): string {
    if (alert.alertType === 'expired' || alert.alertType === 'out_of_stock')
      return 'text-red-600';
    if (alert.alertType === 'expiring_soon')
      return 'text-yellow-600';
    return 'text-orange-600';
  }

  protected stockBarColor(item: InventoryDisplayItem): string {
    if (item.color === 'red')    return 'bg-red-400';
    if (item.color === 'yellow') return 'bg-yellow-400';
    return 'bg-green-400';
  }

  protected stockDotColor(item: InventoryDisplayItem): string {
    if (item.color === 'red')    return 'bg-red-400';
    if (item.color === 'yellow') return 'bg-yellow-400';
    return 'bg-green-400';
  }
}

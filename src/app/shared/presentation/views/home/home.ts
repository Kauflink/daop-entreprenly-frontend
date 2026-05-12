import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SalesStore } from '../../../../sales/application/sales-store';
import { ChatbotStoreService } from '../../../../chatbot/application/chatbot-store.service';
import { InventoryStoreService } from '../../../../inventory/application/inventory-store.service';
import { StockAlert } from '../../../../inventory/domain/model/stock-alert.entity';

// ── Static data ───────────────────────────────────────────────────────────────

interface QuickLink {
  labelKey: string;
  icon: string;
  route: string;
}

const QUICK_LINKS: QuickLink[] = [
  { labelKey: 'dashboard-home.links.sales',     icon: 'cart',      route: '/dashboard/sales' },
  { labelKey: 'dashboard-home.links.chatbot',   icon: 'chat',      route: '/dashboard/chatbot' },
  { labelKey: 'dashboard-home.links.orders',    icon: 'orders',    route: '/dashboard/chatbot/orders' },
  { labelKey: 'dashboard-home.links.inventory', icon: 'inventory', route: '/dashboard/inventory/lots' },
  { labelKey: 'dashboard-home.links.help',      icon: 'help',      route: '/dashboard/help' },
];

// ── Component ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  // ── Injected services ───────────────────────────────────────────────────────
  protected readonly salesStore     = inject(SalesStore);
  protected readonly chatbotStore   = inject(ChatbotStoreService);
  protected readonly inventoryStore = inject(InventoryStoreService);
  private   readonly translate      = inject(TranslateService);

  // ── Static data ─────────────────────────────────────────────────────────────
  protected readonly quickLinks = QUICK_LINKS;

  // ── Computed: ingresos ──────────────────────────────────────────────────────
  protected readonly totalDay     = computed(() => this.salesStore.totalDay());
  protected readonly totalCash    = computed(() => this.salesStore.totalCash());
  protected readonly totalDigital = computed(() => this.salesStore.totalDigital());

  // ── Computed: chatbot ───────────────────────────────────────────────────────
  protected readonly isChatbotConnected = computed(() => this.chatbotStore.isConnected());

  // ── Computed: pedidos (todos del store, ordenados desc) ─────────────────────
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

  // ── Computed: alertas derivadas de los lotes reales ─────────────────────────
  // Usa StockAlert.buildFromLots() con los datos del InventoryStoreService.
  // Cuando cambia cualquier lote o producto, este computed se recalcula solo.
  protected readonly stockAlerts = computed(() =>
    StockAlert.buildFromLots(
      this.inventoryStore.unitProducts(),
      this.inventoryStore.weightProducts(),
      this.inventoryStore.unitLots(),
      this.inventoryStore.weightLots(),
    ),
  );

  protected readonly hasAlerts    = computed(() => this.stockAlerts().length > 0);
  protected readonly alertsLoading = computed(() => this.inventoryStore.loading());

  // ── Today label (idioma reactivo al TranslateService) ────────────────────────
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
    // InventoryStoreService carga todo en su constructor (providedIn: 'root')
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  protected formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
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
    if (status === 'CONFIRMED') return 'bg-green-100 text-green-700';
    if (status === 'BLOCKED')   return 'bg-red-100 text-red-700';
    if (status === 'CANCELLED') return 'bg-gray-100 text-gray-500';
    if (status === 'WAITING_PAYMENT' && hasReceipt) return 'bg-orange-100 text-orange-600';
    return 'bg-gray-100 text-gray-500';
  }

  /** Etiqueta traducida de una alerta de stock */
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

  /** Clases de la tarjeta de alerta según tipo */
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
}

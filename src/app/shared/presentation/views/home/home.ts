import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { SalesStore } from '../../../../sales/application/sales-store';
import { ChatbotStoreService } from '../../../../chatbot/application/chatbot-store.service';
import { environment } from '../../../../../environments/environment';

// ── Domain types ──────────────────────────────────────────────────────────────

interface StockAlert {
  id: number;
  productName: string;
  alertType: 'low_stock' | 'expiring_soon' | 'out_of_stock';
  currentStock?: number;
  minStock?: number;
  expiresAt?: string;
}

interface QuickLink {
  label: string;
  icon: string;
  route: string;
  color: string;
}

// ── Static data ───────────────────────────────────────────────────────────────

const QUICK_LINKS: QuickLink[] = [
  { label: 'Ventas', icon: 'cart', route: '/dashboard/sales', color: 'orange' },
  { label: 'Chatbot', icon: 'chat', route: '/dashboard/chatbot', color: 'green' },
  { label: 'Pedidos', icon: 'orders', route: '/dashboard/chatbot/orders', color: 'blue' },
  { label: 'Inventario', icon: 'inventory', route: '/dashboard/inventory', color: 'purple' },
  { label: 'Ayuda', icon: 'help', route: '/dashboard/help', color: 'gray' },
];

// ── Component ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  // ── Injected services ───────────────────────────────────────────────────────
  protected readonly salesStore = inject(SalesStore);
  protected readonly chatbotStore = inject(ChatbotStoreService);
  private readonly http = inject(HttpClient);

  // ── View state ──────────────────────────────────────────────────────────────
  protected readonly stockAlerts = signal<StockAlert[]>([]);
  protected readonly alertsLoading = signal(true);

  // ── Static data ─────────────────────────────────────────────────────────────
  protected readonly quickLinks = QUICK_LINKS;

  // ── Computed ────────────────────────────────────────────────────────────────

  /** Total ingresos del día (efectivo + digital) */
  protected readonly totalDay = computed(() => this.salesStore.totalDay());
  protected readonly totalCash = computed(() => this.salesStore.totalCash());
  protected readonly totalDigital = computed(() => this.salesStore.totalDigital());

  /** Chatbot estado */
  protected readonly isChatbotConnected = computed(() => this.chatbotStore.isConnected());

  /** Pedidos: todos, pendientes y recientes */
  protected readonly recentOrders = computed(() =>
    [...this.chatbotStore.orders()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
  );

  protected readonly pendingOrderCount = computed(
    () => this.chatbotStore.orders().filter(o => o.status === 'WAITING_PAYMENT' && o.hasReceipt).length,
  );

  protected readonly confirmedOrderCount = computed(
    () => this.chatbotStore.orders().filter(o => o.status === 'CONFIRMED').length,
  );

  /** Stock alerts */
  protected readonly hasAlerts = computed(() => this.stockAlerts().length > 0);

  /** Today's date */
  protected readonly todayLabel = (() => {
    const d = new Date();
    return d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  })();

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.chatbotStore.loadSession();
    this.chatbotStore.loadOrders();
    this.loadStockAlerts();
  }

  // ── Methods ──────────────────────────────────────────────────────────────────

  private loadStockAlerts(): void {
    const url = `${environment.entreprenlyProviderApiBaseUrl}${environment.entreprenlyProviderInventoryStockAlertsEndpointPath}`;
    this.http.get<StockAlert[]>(url).subscribe({
      next: (alerts) => {
        this.stockAlerts.set(alerts ?? []);
        this.alertsLoading.set(false);
      },
      error: () => {
        this.stockAlerts.set([]);
        this.alertsLoading.set(false);
      },
    });
  }

  protected formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  protected orderStatusLabel(status: string, hasReceipt: boolean): string {
    if (status === 'CONFIRMED') return 'Aprobado';
    if (status === 'BLOCKED') return 'Bloqueado';
    if (status === 'CANCELLED') return 'Cancelado';
    if (status === 'WAITING_PAYMENT' && hasReceipt) return 'Comprobante recibido';
    if (status === 'WAITING_PAYMENT' && !hasReceipt) return 'Esperando comprobante';
    return status;
  }

  protected orderStatusClass(status: string, hasReceipt: boolean): string {
    if (status === 'CONFIRMED') return 'bg-green-100 text-green-700';
    if (status === 'BLOCKED') return 'bg-red-100 text-red-700';
    if (status === 'CANCELLED') return 'bg-gray-100 text-gray-500';
    if (status === 'WAITING_PAYMENT' && hasReceipt) return 'bg-orange-100 text-orange-600';
    return 'bg-gray-100 text-gray-500';
  }

  protected alertIcon(type: string): string {
    if (type === 'out_of_stock') return 'out';
    if (type === 'expiring_soon') return 'expiring';
    return 'low';
  }

  protected alertLabel(alert: StockAlert): string {
    if (alert.alertType === 'out_of_stock') return 'Sin stock';
    if (alert.alertType === 'expiring_soon') return 'Próximo a vencer';
    return `Stock bajo (${alert.currentStock ?? 0})`;
  }
}

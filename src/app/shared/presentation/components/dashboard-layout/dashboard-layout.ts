import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

interface NavigationItem {
  labelKey: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterLink, RouterLinkActive, MatIconModule, TranslatePipe],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardLayout {
  protected readonly navigationItems: NavigationItem[] = [
    {
      labelKey: 'dashboard.nav.home',
      icon: 'dashboard',
      route: '/dashboard/home'
    },
    {
      labelKey: 'dashboard.nav.products',
      icon: 'inventory_2',
      route: '/dashboard/products'
    },
    {
      labelKey: 'dashboard.nav.batches',
      icon: 'category',
      route: '/dashboard/batches'
    },
    {
      labelKey: 'dashboard.nav.sales',
      icon: 'receipt_long',
      route: '/dashboard/sales'
    },
    {
      labelKey: 'dashboard.nav.subscription',
      icon: 'credit_card',
      route: '/dashboard/subscription',
    },
    {
      labelKey: 'dashboard.nav.orders',
      icon: 'shopping_cart',
      route: '/dashboard/orders'
    },
    {
      labelKey: 'dashboard.nav.chatbot',
      icon: 'smart_toy',
      route: '/dashboard/chatbot'
    },
    {
      labelKey: 'dashboard.nav.help',
      icon: 'help_outline',
      route: '/dashboard/help'
    },
  ];
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStore } from '../../../../auth/application/auth-store';
import { NgOptimizedImage } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

interface NavigationItem {
  labelKey: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-dashboard-layout',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    NgOptimizedImage,
    MatIconModule,
    TranslatePipe,
  ],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardLayout {
  private readonly authStore = inject(AuthStore);

  protected logout(): void {
    this.authStore.logout();
  }

  protected readonly navigationItems: NavigationItem[] = [
    {
      labelKey: 'dashboard.nav.home',
      icon: 'dashboard',
      route: '/dashboard/home',
    },
    {
      labelKey: 'dashboard.nav.products',
      icon: 'inventory_2',
      route: '/dashboard/inventory/products',
    },
    {
      labelKey: 'dashboard.nav.lots',
      icon: 'category',
      route: '/dashboard/inventory/lots',
    },
    {
      labelKey: 'dashboard.nav.sales',
      icon: 'receipt_long',
      route: '/dashboard/sales',
    },
    {
      labelKey: 'dashboard.nav.subscription',
      icon: 'credit_card',
      route: '/dashboard/subscription',
    },
    {
      labelKey: 'dashboard.nav.orders',
      icon: 'shopping_cart',
      route: '/dashboard/orders',
    },
    {
      labelKey: 'dashboard.nav.chatbot',
      icon: 'smart_toy',
      route: '/dashboard/chatbot',
    },
    {
      labelKey: 'dashboard.nav.help',
      icon: 'help_outline',
      route: '/dashboard/help',
    },
  ];
}

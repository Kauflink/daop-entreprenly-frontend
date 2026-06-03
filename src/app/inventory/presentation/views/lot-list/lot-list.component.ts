
import {Component, inject, computed, signal} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';

import { InventoryStoreService } from '../../../application/inventory-store.service';
import { StockAlert } from '../../../domain/model/stock-alert.entity';

import { UnitProduct } from '../../../domain/model/unit-product.entity';
import { WeightProduct } from '../../../domain/model/weight-product.entity';

interface ProductCard {
  product: {
    id: number;
    name: string;
    brand?: string;
  };

  lotType: 'unit' | 'weight';

  lots: any[];

  totalStock: number;
}

@Component({
  selector: 'app-lot-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    MatIcon,
    RouterOutlet
  ],
  templateUrl: './lot-list.component.html',
  styleUrl: './lot-list.component.css'
})
export class LotListComponent {

  readonly store = inject(InventoryStoreService);
  readonly router = inject(Router);

  // ───────────────── SIGNALS ─────────────────

  searchTerm = signal('');

  showProductSelector = signal(false);

  alertsMenuOpen = signal(false);

  readonly rawAlerts = computed(() =>
    StockAlert.buildFromLots(
      this.store.unitProducts(),
      this.store.weightProducts(),
      this.store.unitLots(),
      this.store.weightLots()
    )
  );

  totalAlertCount = computed(() => this.rawAlerts().length);

  toggleAlertsMenu(): void {
    this.alertsMenuOpen.update(open => !open);
  }

  alertTitleKey(alert: StockAlert): string {
    switch (alert.alertType) {
      case StockAlert.AlertType.LOW_STOCK:
        return 'lots.alerts.title.lowStock';
      case StockAlert.AlertType.OUT_OF_STOCK:
        return 'lots.alerts.title.outOfStock';
      case StockAlert.AlertType.EXPIRING_SOON:
        return 'lots.alerts.title.expiringSoon';
      case StockAlert.AlertType.EXPIRED:
        return 'lots.alerts.title.expired';
    }
  }

  alertTitleParams(alert: StockAlert): Record<string, number> {
    const count = this.rawAlerts().filter(item =>
      item.alertType === alert.alertType &&
      item.productId === alert.productId &&
      item.productType === alert.productType
    ).length;

    return { count };
  }

  navigateToAlert(alert: StockAlert): void {
    if (!alert.productType) return;

    this.alertsMenuOpen.set(false);

    const path =
      alert.productType === 'unit'
        ? 'unit-lots'
        : 'weight-lots';

    const queryParams: {
      productId: number;
      lotId?: number;
    } = {
      productId: alert.productId
    };

    if (alert.lotId !== null) {
      queryParams.lotId = alert.lotId;
    }

    this.router.navigate(
      ['/dashboard/inventory', path],
      { queryParams }
    );
  }

  // ───────────────── STATS ─────────────────

  totalLotsCount = computed(() =>
    this.store.unitLots().length +
    this.store.weightLots().length
  );

  expiredAlertsCount = computed(() =>
    this.rawAlerts().filter(alert => alert.isExpired).length
  );

  outOfStockAlertsCount = computed(() =>
    this.rawAlerts().filter(alert => alert.isOutOfStock).length
  );

  // ───────────────── PRODUCTS SELECTOR ─────────────────

  allProducts = computed(() => [

    // UNIT PRODUCTS
    ...this.store.unitProducts().map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      type: 'unit' as const
    })),

    // WEIGHT PRODUCTS
    ...this.store.weightProducts().map(p => ({
      id: p.id,
      name: p.name,
      brand: '',
      type: 'weight' as const
    }))

  ]);

  // ───────────────── CARDS ─────────────────

  private allCards = computed((): ProductCard[] => {

    // UNIT CARDS
    const unitCards = this.store.unitProducts().map(
      (p: UnitProduct) => ({

        product: {
          id: p.id,
          name: p.name,
          brand: p.brand
        },

        lotType: 'unit' as const,

        lots: this.store.unitLots()
          .filter(l => l.productId === p.id),

        totalStock: this.store.unitLots()
          .filter(l => l.productId === p.id)
          .reduce((sum, lot) => sum + lot.quantity, 0)

      })
    );

    // WEIGHT CARDS
    const weightCards = this.store.weightProducts().map(
      (p: WeightProduct) => ({

        product: {
          id: p.id,
          name: p.name,
          brand: ''
        },

        lotType: 'weight' as const,

        lots: this.store.weightLots()
          .filter(l => l.productId === p.id),

        totalStock: this.store.weightLots()
          .filter(l => l.productId === p.id)
          .reduce((sum, lot) => sum + lot.quantityKg, 0)

      })
    );

    return [
      ...unitCards,
      ...weightCards
    ];

  });

  cards = computed((): ProductCard[] => {

    const term = this.searchTerm()
      .trim()
      .toLowerCase();

    if (!term) {
      return this.allCards();
    }

    return this.allCards().filter(card =>

      card.product.name
        .toLowerCase()
        .includes(term)

      ||

      card.product.brand
        ?.toLowerCase()
        .includes(term)

    );

  });

  // ───────────────── CREATE LOT ─────────────────

  navigateToCreate(): void {
    this.showProductSelector.set(true);
  }

  onProductSelected(
    productId: number,
    type: 'unit' | 'weight'
  ): void {

    this.showProductSelector.set(false);

    if (type === 'unit') {

      this.router.navigate(
        ['/dashboard/inventory/lots/unit-lots/new'],
        {
          queryParams: { productId }
        }
      );

    } else {

      this.router.navigate(
        ['/dashboard/inventory/lots/weight-lots/new'],
        {
          queryParams: { productId }
        }
      );

    }

  }

  closeSelector(): void {
    this.showProductSelector.set(false);
  }

  // ───────────────── DETAILS ─────────────────

  navigateToDetails(
    productId: number,
    lotType: 'unit' | 'weight'
  ): void {

    const path =
      lotType === 'unit'
        ? 'unit-lots'
        : 'weight-lots';

    this.router.navigate(
      ['/dashboard/inventory', path],
      {
        queryParams: { productId }
      }
    );

  }

  // ───────────────── ADD LOT ─────────────────

  navigateToAdd(
    productId: number,
    lotType: 'unit' | 'weight'
  ): void {

    if (lotType === 'unit') {

      this.router.navigate(
        ['/dashboard/inventory/lots/unit-lots/new'],
        {
          queryParams: { productId }
        }
      );

    } else {

      this.router.navigate(
        ['/dashboard/inventory/lots/weight-lots/new'],
        {
          queryParams: { productId }
        }
      );

    }

  }

  handleProductSelect(value: string): void {

    if (!value) return;

    const [id, type] = value.split('-');

    this.onProductSelected(
      Number(id),
      type as 'unit' | 'weight'
    );

  }

}

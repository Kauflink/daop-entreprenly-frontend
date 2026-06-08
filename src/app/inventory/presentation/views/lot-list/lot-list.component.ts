
import {Component, inject, computed, signal, ElementRef, ViewChild} from '@angular/core';
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

  activeAlertIndex = signal(0);

  private readonly rawAlerts = computed(() =>
    StockAlert.buildFromLots(
      this.store.unitProducts(),
      this.store.weightProducts(),
      this.store.unitLots(),
      this.store.weightLots()
    )
  );

  alertSummaries = computed(() => StockAlert.summarize(this.rawAlerts()));

  activeAlertSummary = computed(() => {
    const alerts = this.alertSummaries();
    if (alerts.length === 0) return null;

    const index = Math.min(this.activeAlertIndex(), alerts.length - 1);
    return alerts[index];
  });

  // ───────────────── STATS ─────────────────

  // Only count lots tied to an existing product, so the total always matches
  // the lots shown in the product cards (orphan lots never inflate the count).
  totalLotsCount = computed(() => {
    const unitIds   = new Set(this.store.unitProducts().map(p => p.id));
    const weightIds = new Set(this.store.weightProducts().map(p => p.id));
    return (
      this.store.unitLots().filter(l => unitIds.has(l.productId)).length +
      this.store.weightLots().filter(l => weightIds.has(l.productId)).length
    );
  });

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

  @ViewChild('cardsContainer')
  cardsContainer!: ElementRef<HTMLDivElement>;

  scrollLeft(): void {
    const card = this.cardsContainer.nativeElement.querySelector('.lot-card') as HTMLElement;
    const amount = card ? card.offsetWidth + 24 : 0;
    this.cardsContainer.nativeElement.scrollBy({ left: -amount*3, behavior: 'smooth' });
  }

  scrollRight(): void {
    const card = this.cardsContainer.nativeElement.querySelector('.lot-card') as HTMLElement;
    const amount = card ? card.offsetWidth + 24 : 0;
    this.cardsContainer.nativeElement.scrollBy({ left: amount *3, behavior: 'smooth' });
  }

  previousAlert(): void {
    const total = this.alertSummaries().length;
    if (total <= 1) return;
    this.activeAlertIndex.update(index => (index - 1 + total) % total);
  }

  nextAlert(): void {
    const total = this.alertSummaries().length;
    if (total <= 1) return;
    this.activeAlertIndex.update(index => (index + 1) % total);
  }

}

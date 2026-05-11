import { Component, inject, computed } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { InventoryStoreService } from '../../../application/inventory-store.service';
import { buildInventoryLotAlerts, summarizeLotAlerts } from '../../../domain/model/lot-alert';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-unit-lot-list',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TranslatePipe, MatIcon],
  templateUrl: './unit-lot-list.component.html',
  styleUrl: './unit-lot-list.component.css'
})
export class UnitLotListComponent {
  readonly store  = inject(InventoryStoreService);
  readonly router = inject(Router);
  readonly route  = inject(ActivatedRoute);

  private queryParams = toSignal(this.route.queryParams);

  filteredLots = computed(() => {
    const productId = Number(this.queryParams()?.['productId']);
    const allLots   = this.store.unitLots();
    if (!productId) return allLots;
    return allLots.filter(lot => lot.productId === productId);
  });

  selectedProduct = computed(() => {
    const productId = Number(this.queryParams()?.['productId']);
    return this.store.unitProducts().find(p => p.id === productId);
  });

  alertSummaries = computed(() => {
    const productId = this.currentProductId;
    if (!productId) return [];

    const alerts = buildInventoryLotAlerts(
      this.store.unitProducts(),
      this.store.weightProducts(),
      this.store.unitLots(),
      this.store.weightLots()
    ).filter(alert =>
      alert.productType === 'unit' &&
      alert.productId === productId
    );

    return summarizeLotAlerts(alerts);
  });

  get currentProductId(): number | null {
    return this.selectedProduct()?.id ?? null;
  }

  isExpired(expiryDate: Date): boolean {
    return new Date(expiryDate) < new Date();
  }

  editUnitLot(id: number): void {
    this.router.navigate(['/dashboard/inventory/unit-lots/edit', id], {
      queryParamsHandling: 'preserve'
    });
  }

  deleteUnitLot(id: number): void {
    this.store.deleteUnitLot(id);
  }

  navigateToCreate(): void {
    this.router.navigate(['/dashboard/inventory/unit-lots/new'], {
      queryParamsHandling: 'preserve'
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/inventory/lots']);
  }
}

import { Component, inject, computed } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { InventoryStoreService } from '../../../application/inventory-store.service';
import { buildInventoryLotAlerts, summarizeLotAlerts } from '../../../domain/model/lot-alert';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-weight-lot-list',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TranslatePipe, MatIcon],
  templateUrl: './weight-lot-list.component.html',
  styleUrl: './weight-lot-list.component.css'
})
export class WeightLotListComponent {
  readonly store  = inject(InventoryStoreService);
  readonly router = inject(Router);
  readonly route  = inject(ActivatedRoute);

  private queryParams = toSignal(this.route.queryParams);

  filteredLots = computed(() => {
    const productId = Number(this.queryParams()?.['productId']);
    const allLots   = this.store.weightLots();
    if (!productId) return allLots;
    return allLots.filter(lot => lot.productId === productId);
  });

  selectedProduct = computed(() => {
    const productId = Number(this.queryParams()?.['productId']);
    return this.store.weightProducts().find(p => p.id === productId);
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
      alert.productType === 'weight' &&
      alert.productId === productId
    );

    return summarizeLotAlerts(alerts);
  });

  get currentProductId(): number | null {
    return this.selectedProduct()?.id ?? null;
  }

  editWeightLot(id: number): void {
    this.router.navigate(['/dashboard/inventory/weight-lots/edit', id], {
      queryParamsHandling: 'preserve'
    });
  }

  deleteWeightLot(id: number): void {
    this.store.deleteWeightLot(id);
  }

  navigateToCreate(): void {
    this.router.navigate(['/dashboard/inventory/weight-lots/new'], {
      queryParamsHandling: 'preserve'
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/inventory/lots']);
  }
}

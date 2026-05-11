import { Component, inject, Input, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryStoreService } from '../../../application/inventory-store.service';
import { StockAlert } from '../../../domain/model/stock-alert.entity';
import { StockAlertItemComponent } from '../../components/stock-alert-item/stock-alert-item.component';

@Component({
  selector: 'app-stock-alert-list',
  standalone: true,
  imports: [CommonModule, StockAlertItemComponent],
  templateUrl: './stock-alert-list.component.html',
  styleUrl: './stock-alert-list.component.css'
})
export class StockAlertListComponent implements DoCheck {
  private store = inject(InventoryStoreService);

  @Input() productId: number | null = null;

  filteredAlerts: StockAlert[] = [];

  ngDoCheck(): void {
    const all = this.store.stockAlerts();
    if (this.productId === null) {
      this.filteredAlerts = all;
    } else {
      this.filteredAlerts = all.filter(a =>
        Number(a.productId) === Number(this.productId)
      );
    }
  }

  trackById(_index: number, alert: StockAlert): number {
    return alert.id;
  }
}

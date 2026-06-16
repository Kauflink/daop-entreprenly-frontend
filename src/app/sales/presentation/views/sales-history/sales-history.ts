import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CurrencyService } from '../../../../shared/infrastructure/currency-service';
import { SalesStore } from '../../../application/sales-store';
import { Sale } from '../../../domain/model/sale.entity';
import { SaleItem } from '../../../domain/model/sale-item.entity';
import { PaymentMethod } from '../../../domain/model/payment-method.enum';

/**
 * Sales history panel. Shows the sales registered on the selected business day
 * (newest first, scrollable) and opens a detail modal with the line items.
 */
@Component({
  selector: 'app-sales-history',
  imports: [DatePipe],
  templateUrl: './sales-history.html',
  styleUrl: './sales-history.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesHistory {
  protected readonly store = inject(SalesStore);
  protected readonly currency = inject(CurrencyService);
  protected readonly selectedSale = signal<Sale | null>(null);

  protected onDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value) {
      this.store.selectDate(value);
    }
  }

  protected methodLabel(sale: Sale): string {
    return sale.paymentMethod === PaymentMethod.CASH ? 'Efectivo' : 'Tarjeta / Yape / Plin';
  }

  protected measure(item: SaleItem): string {
    return item.weightKg !== null ? `${item.weightKg} kg` : `${item.quantity} u.`;
  }

  protected openDetail(sale: Sale): void {
    this.selectedSale.set(sale);
  }

  protected closeDetail(): void {
    this.selectedSale.set(null);
  }
}

<<<<<<< Updated upstream
=======
import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { CurrencyStore } from '../../../../shared/application/currency.store';
import { ProductSummary } from '../../../domain/model/product-summary.entity';

export interface TicketItem {
  productId: number;
  productName: string;
  type: 'unit' | 'weight';
  quantity: number | null;
  weightKg: number | null;
  unitPrice: number;
  subtotal: number;
}

@Component({
  selector: 'app-sales-cart',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './sales-cart.html',
  styleUrl: './sales-cart.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesCart {
  protected readonly currencyStore = inject(CurrencyStore);

  readonly ticketItems = input.required<TicketItem[]>();
  readonly showEmptyError = input<boolean>(false);
  readonly products = input.required<ProductSummary[]>();
  readonly loading = input<boolean>(false);

  readonly itemDeleted = output<number>();
  readonly productSelected = output<ProductSummary>();

  protected readonly searchTerm = signal<string>('');
  protected readonly isDropdownOpen = signal<boolean>(false);

  protected readonly filteredProducts = computed<ProductSummary[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return [];
    return this.products().filter((p) => p.name.toLowerCase().includes(term));
  });

  protected readonly showNotFound = computed<boolean>(() => {
    const term = this.searchTerm().trim();
    return term.length > 0 && this.filteredProducts().length === 0;
  });

  protected onSearchInput(value: string): void {
    this.searchTerm.set(value);
    this.isDropdownOpen.set(value.trim().length > 0);
  }

  protected onSelectProduct(product: ProductSummary): void {
    this.searchTerm.set('');
    this.isDropdownOpen.set(false);
    this.productSelected.emit(product);
  }

  protected onSearchBlur(): void {
    setTimeout(() => this.isDropdownOpen.set(false), 200);
  }

  protected onSearchFocus(): void {
    if (this.searchTerm().trim().length > 0) {
      this.isDropdownOpen.set(true);
    }
  }
}
>>>>>>> Stashed changes

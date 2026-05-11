import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { SalesStore } from '../../../application/sales-store';
import { ProductSummary } from '../../../domain/model/product-summary.entity';
import { QuantityModal } from '../../components/quantity-modal/quantity-modal';
import { WeightModal } from '../../components/weight-modal/weight-modal';

export interface TicketItem {
  productId: number;
  productName: string;
  type: 'unit' | 'weight';
  quantity: number | null;
  weightKg: number | null;
  unitPrice: number;
  subtotal: number;
}

type PaymentMethod = 'CASH' | 'DIGITAL' | null;

@Component({
  selector: 'app-sales-page',
  imports: [FormsModule, TranslatePipe, QuantityModal, WeightModal],
  templateUrl: './sales-page.html',
  styleUrl: './sales-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesPage {
  protected readonly store = inject(SalesStore);

  // === Buscador ===
  protected readonly searchTerm = signal<string>('');
  protected readonly isDropdownOpen = signal<boolean>(false);

  protected readonly filteredProducts = computed<ProductSummary[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return [];
    return this.store.products().filter((p) => p.name.toLowerCase().includes(term));
  });

  protected readonly showNotFound = computed<boolean>(() => {
    const term = this.searchTerm().trim();
    return term.length > 0 && this.filteredProducts().length === 0;
  });

  // === Modales ===
  protected readonly selectedProduct = signal<ProductSummary | null>(null);

  protected readonly isQuantityModalOpen = computed<boolean>(() => {
    const p = this.selectedProduct();
    return p !== null && !p.isWeighted;
  });

  protected readonly isWeightModalOpen = computed<boolean>(() => {
    const p = this.selectedProduct();
    return p !== null && p.isWeighted;
  });

  // === Ticket ===
  protected readonly ticketItems = signal<TicketItem[]>([]);

  protected readonly subtotal = computed<number>(() =>
    this.ticketItems().reduce((sum, item) => sum + item.subtotal, 0),
  );

  protected readonly itemCount = computed<number>(() => this.ticketItems().length);

  // === Método de pago ===
  protected readonly paymentMethod = signal<PaymentMethod>(null);
  protected readonly showPaymentError = signal<boolean>(false);
  protected readonly showEmptyTicketError = signal<boolean>(false);
  protected readonly showSuccessModal = signal<boolean>(false);

  // === Resumen de Caja (delegado al store para persistencia) ===
  protected readonly totalCash = computed<number>(() => this.store.totalCash());
  protected readonly totalDigital = computed<number>(() => this.store.totalDigital());
  protected readonly totalDay = computed<number>(() => this.store.totalDay());

  // ===== Handlers Buscador =====
  protected onSearchInput(value: string): void {
    this.searchTerm.set(value);
    this.isDropdownOpen.set(value.trim().length > 0);
  }

  protected onSelectProduct(product: ProductSummary): void {
    this.searchTerm.set('');
    this.isDropdownOpen.set(false);
    this.selectedProduct.set(product);
  }

  protected onSearchBlur(): void {
    setTimeout(() => this.isDropdownOpen.set(false), 200);
  }

  protected onSearchFocus(): void {
    if (this.searchTerm().trim().length > 0) {
      this.isDropdownOpen.set(true);
    }
  }

  // ===== Modal Cantidad =====
  protected onQuantityConfirm(event: { product: ProductSummary; quantity: number }): void {
    const { product, quantity } = event;
    const subtotal = product.unitPrice * quantity;
    this.ticketItems.update((items) => [
      ...items,
      {
        productId: product.id,
        productName: product.name,
        type: 'unit',
        quantity,
        weightKg: null,
        unitPrice: product.unitPrice,
        subtotal,
      },
    ]);
    this.selectedProduct.set(null);
    this.showEmptyTicketError.set(false);
  }

  protected onQuantityCancel(): void {
    this.selectedProduct.set(null);
  }

  // ===== Modal Peso =====
  protected onWeightConfirm(event: { product: ProductSummary; weight: number }): void {
    const { product, weight } = event;
    const subtotal = product.unitPrice * weight;
    this.ticketItems.update((items) => [
      ...items,
      {
        productId: product.id,
        productName: product.name,
        type: 'weight',
        quantity: null,
        weightKg: weight,
        unitPrice: product.unitPrice,
        subtotal,
      },
    ]);
    this.selectedProduct.set(null);
    this.showEmptyTicketError.set(false);
  }

  protected onWeightCancel(): void {
    this.selectedProduct.set(null);
  }

  // ===== Eliminar item =====
  protected onDeleteItem(index: number): void {
    this.ticketItems.update((items) => items.filter((_, i) => i !== index));
  }

  // ===== Selección de método de pago =====
  protected onSelectPayment(method: PaymentMethod): void {
    if (this.ticketItems().length === 0) return;
    this.paymentMethod.set(method);
    this.showPaymentError.set(false);
  }

  // ===== Finalizar Venta =====
  protected onFinalizeSale(): void {
    if (this.ticketItems().length === 0) {
      this.showEmptyTicketError.set(true);
      return;
    }
    if (this.paymentMethod() === null) {
      this.showPaymentError.set(true);
      return;
    }

    const total = this.subtotal();
    this.store.addSaleToRegister(total, this.paymentMethod() === 'DIGITAL');

    this.showSuccessModal.set(true);

    // ⭐ Auto-cerrar el modal después de 2 segundos
    setTimeout(() => {
      if (this.showSuccessModal()) {
        this.onCloseSuccessModal();
      }
    }, 2000);
  }

  // ===== Cerrar modal de éxito =====
  protected onCloseSuccessModal(): void {
    this.showSuccessModal.set(false);
    this.resetTicket();
  }

  // ===== Cancelar Venta =====
  protected onCancelSale(): void {
    this.resetTicket();
  }

  private resetTicket(): void {
    this.ticketItems.set([]);
    this.paymentMethod.set(null);
    this.showPaymentError.set(false);
    this.showEmptyTicketError.set(false);
  }
}

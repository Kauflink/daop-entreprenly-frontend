import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { SalesStore } from '../../../application/sales-store';
import { CurrencyService } from '../../../../shared/infrastructure/currency-service';
import { PaymentMethod } from '../../../domain/model/payment-method.enum';
import { ProductSummary } from '../../../domain/model/product-summary.entity';
import { SaleItem } from '../../../domain/model/sale-item.entity';
import { QuantityModal } from '../../components/quantity-modal/quantity-modal';
import { WeightModal } from '../../components/weight-modal/weight-modal';
import { CashSummary } from '../cash-summary/cash-summary';
import { PaymentSelection, PaymentMethodComponent } from '../payment-method/payment-method';
import { SalesCart, TicketItem } from '../sales-cart/sales-cart';
import { SalesHistory } from '../sales-history/sales-history';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-sales-page',
  imports: [
    QuantityModal,
    WeightModal,
    CashSummary,
    PaymentMethodComponent,
    TranslatePipe,
    SalesCart,
    SalesHistory,
  ],
  templateUrl: './sales-page.html',
  styleUrl: './sales-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesPage implements OnInit {
  protected readonly store = inject(SalesStore);
  protected readonly currencyAssembler = inject(CurrencyService);

  ngOnInit(): void {
    this.store.reloadProducts();
  }

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
  protected readonly paymentMethod = signal<PaymentSelection>(null);
  protected readonly showPaymentError = signal<boolean>(false);
  protected readonly showEmptyTicketError = signal<boolean>(false);
  protected readonly showSuccessModal = signal<boolean>(false);

  // ===== Handlers Sales Cart =====
  protected onProductSelected(product: ProductSummary): void {
    this.selectedProduct.set(product);
  }

  protected onItemDeleted(index: number): void {
    this.ticketItems.update((items) => items.filter((_, i) => i !== index));
  }

  // ===== Modal Cantidad =====
  protected onQuantityConfirm(event: { product: ProductSummary; quantity: number }): void {
    const { product, quantity } = event;
    this.ticketItems.update((items) => [
      ...items,
      {
        productId: product.id,
        productName: product.name,
        type: 'unit',
        quantity,
        weightKg: null,
        unitPrice: product.unitPrice,
        subtotal: product.unitPrice * quantity,
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
    this.ticketItems.update((items) => [
      ...items,
      {
        productId: product.id,
        productName: product.name,
        type: 'weight',
        quantity: null,
        weightKg: weight,
        unitPrice: product.unitPrice,
        subtotal: product.unitPrice * weight,
      },
    ]);
    this.selectedProduct.set(null);
    this.showEmptyTicketError.set(false);
  }

  protected onWeightCancel(): void {
    this.selectedProduct.set(null);
  }

  // ===== Handlers Payment Method =====
  protected onMethodSelected(method: 'CASH' | 'DIGITAL'): void {
    if (this.ticketItems().length === 0) return;
    this.paymentMethod.set(method);
    this.showPaymentError.set(false);
  }

  protected onFinalizeSale(): void {
    if (this.ticketItems().length === 0) {
      this.showEmptyTicketError.set(true);
      return;
    }
    const selection = this.paymentMethod();
    if (selection === null) {
      this.showPaymentError.set(true);
      return;
    }

    const isDigital = selection === 'DIGITAL';
    const domainMethod = isDigital ? PaymentMethod.CARD : PaymentMethod.CASH;
    const saleItems = this.ticketItems().map(
      (t) =>
        new SaleItem({
          productId: t.productId,
          productName: t.productName,
          quantity: t.quantity,
          weightKg: t.weightKg,
          unitPrice: t.unitPrice,
          subtotal: t.subtotal,
        }),
    );

    this.store.createSale(saleItems, domainMethod, this.subtotal());

    this.showSuccessModal.set(true);
    setTimeout(() => {
      if (this.showSuccessModal()) this.onCloseSuccessModal();
    }, 2000);
  }

  protected onCancelSale(): void {
    this.resetTicket();
  }

  protected onCloseSuccessModal(): void {
    this.showSuccessModal.set(false);
    this.resetTicket();
  }

  private resetTicket(): void {
    this.ticketItems.set([]);
    this.paymentMethod.set(null);
    this.showPaymentError.set(false);
    this.showEmptyTicketError.set(false);
  }
}

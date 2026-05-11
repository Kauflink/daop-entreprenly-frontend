import { ChangeDetectionStrategy, Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductSummary } from '../../../domain/model/product-summary.entity';

@Component({
  selector: 'app-quantity-modal',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quantity-modal.html',
  styleUrl: './quantity-modal.css',
})
export class QuantityModal {
  @Input({ required: true }) product!: ProductSummary;
  @Output() confirm = new EventEmitter<{ product: ProductSummary; quantity: number }>();
  @Output() cancel = new EventEmitter<void>();

  protected readonly displayValue = signal<string>('');

  // Cantidad numérica parseada
  protected readonly quantity = computed<number>(() => {
    const value = parseInt(this.displayValue() || '0', 10);
    return isNaN(value) ? 0 : value;
  });

  // Mensaje de error si el stock es insuficiente
  protected readonly hasInsufficientStock = computed<boolean>(() => {
    return this.quantity() > this.product.availableStock;
  });

  // El botón confirmar está habilitado solo si hay cantidad y stock suficiente
  protected readonly canConfirm = computed<boolean>(() => {
    return this.quantity() > 0 && !this.hasInsufficientStock();
  });

  // Teclado: 1-9, 0
  protected readonly keypadKeys: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  protected onKeyPress(key: string): void {
    const current = this.displayValue();
    // Limita a 4 dígitos para evitar números absurdos
    if (current.length >= 4) return;
    this.displayValue.set(current + key);
  }

  protected onZeroPress(): void {
    const current = this.displayValue();
    if (current.length >= 4) return;
    // Si está vacío, el "0" no debería empezar la cadena (o sí, según el caso)
    this.displayValue.set(current + '0');
  }

  protected onBackspace(): void {
    const current = this.displayValue();
    this.displayValue.set(current.slice(0, -1));
  }

  protected onConfirm(): void {
    if (!this.canConfirm()) return;
    this.confirm.emit({ product: this.product, quantity: this.quantity() });
  }

  protected onCancel(): void {
    this.cancel.emit();
  }

  // Cierra al hacer clic en el backdrop
  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}

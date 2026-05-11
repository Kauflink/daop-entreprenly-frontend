import { ChangeDetectionStrategy, Component, computed, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductSummary } from '../../../domain/model/product-summary.entity';
import { SalesApi } from '../../../infrastructure/sales-api';

@Component({
  selector: 'app-weight-modal',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './weight-modal.html',
  styleUrl: './weight-modal.css',
})
export class WeightModal implements OnInit {
  @Input({ required: true }) product!: ProductSummary;
  @Output() confirm = new EventEmitter<{ product: ProductSummary; weight: number }>();
  @Output() cancel = new EventEmitter<void>();

  protected readonly displayValue = signal<string>('');
  protected readonly isScaleConnected = signal<boolean>(false);
  protected readonly isWaitingForScale = signal<boolean>(false);

  protected readonly weight = computed<number>(() => {
    const value = parseFloat(this.displayValue() || '0');
    return isNaN(value) ? 0 : value;
  });

  protected readonly hasInsufficientStock = computed<boolean>(() => {
    return this.weight() > this.product.availableStock;
  });

  protected readonly canConfirm = computed<boolean>(() => {
    return this.weight() > 0 && !this.hasInsufficientStock();
  });

  protected readonly keypadKeys: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  constructor(private salesApi: SalesApi) {}

  ngOnInit(): void {
    this.checkScaleConnection();
  }

  private checkScaleConnection(): void {
    this.salesApi.getScaleStatus().subscribe({
      next: (scale) => {
        if (scale.connected) {
          this.isScaleConnected.set(true);
          this.simulateScaleReading();
        } else {
          this.isScaleConnected.set(false);
        }
      },
      error: () => this.isScaleConnected.set(false),
    });
  }

  private simulateScaleReading(): void {
    this.isWaitingForScale.set(true);
    setTimeout(() => {
      const randomWeight = parseFloat((Math.random() * 2.5 + 0.5).toFixed(2));
      this.displayValue.set(randomWeight.toString());
      this.isWaitingForScale.set(false);

      // ⭐ Auto-confirmar después de 800ms para que el usuario VEA el peso registrado
      setTimeout(() => {
        if (randomWeight <= this.product.availableStock) {
          this.confirm.emit({ product: this.product, weight: randomWeight });
        }
      }, 800);
    }, 1500);
  }

  protected onKeyPress(key: string): void {
    if (this.isScaleConnected()) return;
    const current = this.displayValue();
    if (current.length >= 6) return;
    this.displayValue.set(current + key);
  }

  protected onZeroPress(): void {
    if (this.isScaleConnected()) return;
    const current = this.displayValue();
    if (current.length >= 6) return;
    this.displayValue.set(current + '0');
  }

  protected onDotPress(): void {
    if (this.isScaleConnected()) return;
    const current = this.displayValue();
    if (current.includes('.')) return;
    if (current.length === 0) {
      this.displayValue.set('0.');
    } else {
      this.displayValue.set(current + '.');
    }
  }

  protected onBackspace(): void {
    if (this.isScaleConnected()) return;
    const current = this.displayValue();
    this.displayValue.set(current.slice(0, -1));
  }

  protected onConfirm(): void {
    if (!this.canConfirm()) return;
    this.confirm.emit({ product: this.product, weight: this.weight() });
  }

  protected onCancel(): void {
    this.cancel.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}

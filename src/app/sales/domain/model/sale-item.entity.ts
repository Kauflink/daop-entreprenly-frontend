/**
 * Representa un ítem dentro del ticket de venta.
 * Puede ser por unidad (quantity) o por peso (weightKg), nunca ambos.
 */
export class SaleItem {
  private _productId: number;
  private _productName: string;
  private _quantity: number | null;
  private _weightKg: number | null;
  private _unitPrice: number;
  private _subtotal: number;

  constructor(item: {
    productId: number;
    productName: string;
    quantity?: number | null;
    weightKg?: number | null;
    unitPrice: number;
    subtotal?: number;
  }) {
    this._productId = item.productId;
    this._productName = item.productName;
    this._quantity = item.quantity ?? null;
    this._weightKg = item.weightKg ?? null;
    this._unitPrice = item.unitPrice;
    this._subtotal = item.subtotal ?? this.computeSubtotal();
  }

  /**
   * Calcula el subtotal según si es por unidad o por peso.
   */
  computeSubtotal(): number {
    if (this._weightKg !== null) {
      return Number((this._unitPrice * this._weightKg).toFixed(2));
    }
    if (this._quantity !== null) {
      return Number((this._unitPrice * this._quantity).toFixed(2));
    }
    return 0;
  }

  get productId(): number {
    return this._productId;
  }
  set productId(value: number) {
    this._productId = value;
  }

  get productName(): string {
    return this._productName;
  }
  set productName(value: string) {
    this._productName = value;
  }

  get quantity(): number | null {
    return this._quantity;
  }
  set quantity(value: number | null) {
    this._quantity = value;
  }

  get weightKg(): number | null {
    return this._weightKg;
  }
  set weightKg(value: number | null) {
    this._weightKg = value;
  }

  get unitPrice(): number {
    return this._unitPrice;
  }
  set unitPrice(value: number) {
    this._unitPrice = value;
  }

  get subtotal(): number {
    return this._subtotal;
  }
  set subtotal(value: number) {
    this._subtotal = value;
  }
}

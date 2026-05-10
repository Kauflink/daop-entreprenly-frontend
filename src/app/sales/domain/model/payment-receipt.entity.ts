import { PaymentMethod } from './payment-method.enum';

/**
 * Representa el comprobante del pago confirmado manualmente por el cajero.
 * El sistema NO verifica con APIs externas; solo registra lo que el cajero confirma.
 */
export class PaymentReceipt {
  private _method: PaymentMethod;
  private _transactionCode: string;
  private _amount: number;
  private _confirmedAt: Date;

  constructor(receipt: {
    method: PaymentMethod;
    transactionCode: string;
    amount: number;
    confirmedAt?: Date;
  }) {
    this._method = receipt.method;
    this._transactionCode = receipt.transactionCode;
    this._amount = receipt.amount;
    this._confirmedAt = receipt.confirmedAt ?? new Date();
  }

  get method(): PaymentMethod { return this._method; }
  set method(value: PaymentMethod) { this._method = value; }

  get transactionCode(): string { return this._transactionCode; }
  set transactionCode(value: string) { this._transactionCode = value; }

  get amount(): number { return this._amount; }
  set amount(value: number) { this._amount = value; }

  get confirmedAt(): Date { return this._confirmedAt; }
  set confirmedAt(value: Date) { this._confirmedAt = value; }
}

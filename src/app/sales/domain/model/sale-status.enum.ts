/**
 * Estados posibles de una venta a lo largo de su ciclo de vida.
 *
 * IN_PROGRESS         → cajero está agregando productos al ticket
 * PAYMENT_CONFIRMED   → cajero confirmó manualmente el pago
 * COMPLETED           → comprobante emitido y caja actualizada
 * CANCELLED           → cajero canceló la venta antes de completarla
 */
export enum SaleStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

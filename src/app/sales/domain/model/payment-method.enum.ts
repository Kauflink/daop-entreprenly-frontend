/**
 * Métodos de pago aceptados en una venta presencial.
 * Tarjeta, Yape y Plin se agrupan bajo el total "digital" de la caja.
 */
export enum PaymentMethod {
  CASH = 'CASH',
  YAPE = 'YAPE',
  PLIN = 'PLIN',
  CARD = 'CARD'
}

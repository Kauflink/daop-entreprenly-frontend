/**
 * Indica el origen de un movimiento que actualiza el total digital de la caja.
 *
 * PRESENCIAL → venta confirmada por el cajero en el módulo de Ventas
 * WHATSAPP   → pedido validado por el comerciante en la sección de Pedidos (Chatbot BC)
 */
export enum CajaUpdateSource {
  PRESENCIAL = 'PRESENCIAL',
  WHATSAPP = 'WHATSAPP'
}

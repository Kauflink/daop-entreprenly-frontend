import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Sale } from '../domain/model/sale.entity';
import { SaleItem } from '../domain/model/sale-item.entity';
import { PaymentReceipt } from '../domain/model/payment-receipt.entity';
import { SaleResource, SalesResponse } from './sales-response';

export class SaleAssembler implements BaseAssembler<Sale, SaleResource, SalesResponse> {
  toEntitiesFromResponse(_response: SalesResponse): Sale[] {
    // json-server returns a plain array — BaseApiEndpoint handles it before reaching here
    return [];
  }

  toEntityFromResource(resource: SaleResource): Sale {
    return new Sale({
      id: resource.id,
      sellerId: resource.sellerId,
      items: resource.items.map(
        (i) =>
          new SaleItem({
            productId: i.productId,
            productName: i.productName,
            quantity: i.quantity,
            weightKg: i.weightKg,
            unitPrice: i.unitPrice,
            subtotal: i.subtotal,
          }),
      ),
      total: resource.total,
      paymentMethod: resource.paymentMethod,
      paymentReceipt: resource.paymentReceipt
        ? new PaymentReceipt({
            method: resource.paymentReceipt.method,
            transactionCode: resource.paymentReceipt.transactionCode,
            amount: resource.paymentReceipt.amount,
            confirmedAt: new Date(resource.paymentReceipt.confirmedAt),
          })
        : null,
      status: resource.status,
      createdAt: new Date(resource.createdAt),
      completedAt: resource.completedAt ? new Date(resource.completedAt) : null,
    });
  }

  toResourceFromEntity(entity: Sale): SaleResource {
    return {
      id: entity.id,
      sellerId: entity.sellerId,
      items: entity.items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
        weightKg: i.weightKg,
        unitPrice: i.unitPrice,
        subtotal: i.subtotal,
      })),
      total: entity.total,
      paymentMethod: entity.paymentMethod,
      paymentReceipt: entity.paymentReceipt
        ? {
            method: entity.paymentReceipt.method,
            transactionCode: entity.paymentReceipt.transactionCode,
            amount: entity.paymentReceipt.amount,
            confirmedAt: entity.paymentReceipt.confirmedAt.toISOString(),
          }
        : null,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
      completedAt: entity.completedAt ? entity.completedAt.toISOString() : null,
    } as SaleResource;
  }
}

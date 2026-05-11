import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { ProductSummary } from '../domain/model/product-summary.entity';
import {
  ProductResource,
  ProductsResponse,
  UnitLotResource,
  UnitProductResource,
  WeightLotResource,
  WeightProductResource,
} from './products-response';

// Los IDs de productos por peso se offsetean para evitar colisión con productos por unidad
const WEIGHT_ID_OFFSET = 1000;

export class ProductAssembler implements BaseAssembler<
  ProductSummary,
  ProductResource,
  ProductsResponse
> {
  // ===== Inventory BC =====

  toEntityFromUnitResource(
    resource: UnitProductResource,
    lots: UnitLotResource[],
  ): ProductSummary {
    const availableStock = lots
      .filter((l) => l.productId === resource.id)
      .reduce((sum, l) => sum + l.quantity, 0);

    return new ProductSummary({
      id: resource.id,
      name: resource.name,
      unitPrice: resource.price,
      isWeighted: false,
      availableStock,
    });
  }

  toEntityFromWeightResource(
    resource: WeightProductResource,
    lots: WeightLotResource[],
  ): ProductSummary {
    const availableStock = lots
      .filter((l) => l.productId === resource.id)
      .reduce((sum, l) => sum + l.quantityKg, 0);

    return new ProductSummary({
      id: resource.id + WEIGHT_ID_OFFSET,
      name: resource.name,
      unitPrice: resource.pricePerKg,
      isWeighted: true,
      availableStock,
    });
  }

  // ===== BaseAssembler compliance =====

  toEntitiesFromResponse(_response: ProductsResponse): ProductSummary[] {
    return [];
  }

  toEntityFromResource(resource: ProductResource): ProductSummary {
    return new ProductSummary({
      id: resource.id,
      name: resource.name,
      unitPrice: resource.unitPrice,
      isWeighted: resource.isWeighted,
      availableStock: resource.availableStock,
    });
  }

  toResourceFromEntity(entity: ProductSummary): ProductResource {
    return {
      id: entity.id,
      name: entity.name,
      unitPrice: entity.unitPrice,
      isWeighted: entity.isWeighted,
      availableStock: entity.availableStock,
    } as ProductResource;
  }
}

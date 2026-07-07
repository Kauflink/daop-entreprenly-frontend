import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { ProductSummary } from '../domain/model/product-summary.entity';
import {
  ProductResource,
  ProductsResponse,
  SalesProductResource,
} from './products-response';

export class ProductAssembler implements BaseAssembler<
  ProductSummary,
  ProductResource,
  ProductsResponse
> {
  // ===== Sales catalog =====

  /**
   * Mapea un producto vendible del catálogo (nombre, precio, tipo y stock ya calculado por
   * Inventario) a un ProductSummary del dominio. El catálogo no expone id de producto, así que
   * se asigna un id local por posición para identificar el ítem dentro de la vista de venta.
   */
  toEntityFromSalesProduct(resource: SalesProductResource, index: number): ProductSummary {
    return new ProductSummary({
      id: index + 1,
      name: resource.name,
      unitPrice: resource.price,
      isWeighted: resource.byWeight,
      availableStock: resource.stock,
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

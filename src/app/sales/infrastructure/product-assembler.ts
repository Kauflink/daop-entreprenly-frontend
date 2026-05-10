import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { ProductSummary } from '../domain/model/product-summary.entity';
import { ProductResource, ProductsResponse } from './products-response';

export class ProductAssembler implements BaseAssembler<
  ProductSummary,
  ProductResource,
  ProductsResponse
> {
  toEntitiesFromResponse(response: ProductsResponse): ProductSummary[] {
    return response.products.map((resource) => this.toEntityFromResource(resource));
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

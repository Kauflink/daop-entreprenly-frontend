import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Product} from '../domain/model/product.entity';
import {ProductsResponse, ProductResource} from './products-response';
export class ProductAssembler implements BaseAssembler<Product, ProductResource, ProductsResponse> {
  /**
   * Converts a ProductsResponse to an array of Product entities.
   * @param response - The API response containing categories.
   * @returns An array of Product entities.
   */
  toEntitiesFromResponse(response: ProductsResponse): Product[] {
    return response.products.map(resource => this.toEntityFromResource(resource as ProductResource));
  }

  /**
   * Converts a ProductResource to a Product entity.
   * @param resource - The resource to convert.
   * @returns The converted Product entity.
   */
  toEntityFromResource(resource: ProductResource): Product{
    return new Product({
      _id: resource.id,
      _name: resource.name,
      _codeQR:resource.codeQR,
      _description:resource.description,
      _productType:resource.productType
    });
  }

  /**
   * Converts a Product entity to a ProductResource.
   * @param entity - The entity to convert.
   * @returns The converted ProductResource.
   */
  toResourceFromEntity(entity: Product): ProductResource {
    return {
      id: entity.id,
      name: entity.name,
      codeQR:entity.codeQR,
      description:entity.description,
      productType:entity.productType
    } as ProductResource;
  }
}

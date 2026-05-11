
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { WeightProduct } from '../domain/model/weight-product.entity';
import {WeightProductResource} from './weight-product-response';
import {WeightProductsResponse} from './weight-product-response';

export class WeightProductAssembler implements BaseAssembler<WeightProduct, WeightProductResource, WeightProductsResponse> {

  toEntitiesFromResponse(response: WeightProductsResponse): WeightProduct[] {
    return response.weightProducts.map(resource => this.toEntityFromResource(resource as WeightProductResource));
  }

  toEntityFromResource(resource: WeightProductResource): WeightProduct {
    return new WeightProduct({
      _id: resource.id,
      _name: resource.name,
      _description: resource.description,
      _codeQR: resource.codeQR,
      _pricePerKg: resource.pricePerKg,
    });
  }

  toResourceFromEntity(entity: WeightProduct):  WeightProductResource {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      codeQR: entity.codeQR,
      productType: entity.productType,
      pricePerKg: entity.pricePerKg
    } as  WeightProductResource;
  }
}

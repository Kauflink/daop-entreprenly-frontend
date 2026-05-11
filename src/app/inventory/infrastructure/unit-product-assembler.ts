// unit-product-assembler.ts
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { UnitProduct } from '../domain/model/unit-product.entity';
import {UnitProductResource} from './unit-product-response';
import {UnitProductsResponse} from './unit-product-response';

export class UnitProductAssembler implements BaseAssembler<UnitProduct, UnitProductResource, UnitProductsResponse> {

  toEntitiesFromResponse(response: UnitProductsResponse): UnitProduct[] {
    return response.unitProducts.map(resource => this.toEntityFromResource(resource as UnitProductResource));
  }

  toEntityFromResource(resource: UnitProductResource): UnitProduct {
    return new UnitProduct({
      _id: resource.id,
      _name: resource.name,
      _description: resource.description,
      _codeQR: resource.codeQR,
      _price: resource.price,
      _weightGrams: resource.weightGrams,
      _brand: resource.brand,
    });
  }

  toResourceFromEntity(entity: UnitProduct): UnitProductResource {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      codeQR: entity.codeQR,
      productType: entity.productType,
      price: entity.price,
      weightGrams: entity.weightGrams,
      brand: entity.brand,
    } as UnitProductResource;
  }
}

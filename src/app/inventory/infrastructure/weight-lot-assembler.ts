
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { WeightLot } from '../domain/model/weight-lot.entity';
import {WeightLotResource} from './weight-lot-response';
import {WeightLotsResponse} from './weight-lot-response';

export class WeightLotAssembler implements BaseAssembler<WeightLot, WeightLotResource, WeightLotsResponse> {

  toEntitiesFromResponse(response: WeightLotsResponse): WeightLot[] {
    return response.weightLots.map(resource => this.toEntityFromResource(resource as WeightLotResource));
  }

  toEntityFromResource(resource: WeightLotResource): WeightLot{
    return new WeightLot({
      _id: resource.id,
      _productId: resource.productId,
      _codeQR: resource.codeQR,
      _entryDate: resource.entryDate,
      _quantityKg: resource.quantityKg
    });
  }

  toResourceFromEntity(entity: WeightLot): WeightLotResource {
    return {
      id: entity.id,
      productId: entity.productId,
      codeQR: entity.codeQR,
      entryDate: entity.entryDate,
      lotType: entity.lotType,
      quantityKg: entity.quantityKg,
    } as WeightLotResource;
  }
}

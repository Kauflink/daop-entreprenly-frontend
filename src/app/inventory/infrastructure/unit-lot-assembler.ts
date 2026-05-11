// unit-lot-assembler.ts
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { UnitLot } from '../domain/model/unit-lot.entity';
import {UnitLotResource} from './unit-lot-response';
import {UnitLotsResponse} from './unit-lot-response';

export class UnitLotAssembler implements BaseAssembler<UnitLot, UnitLotResource, UnitLotsResponse> {

  toEntitiesFromResponse(response: UnitLotsResponse): UnitLot[] {
    return response.unitLots.map(resource => this.toEntityFromResource(resource as UnitLotResource));
  }

  toEntityFromResource(resource: UnitLotResource): UnitLot{
    return new UnitLot({
      _id: resource.id,
      _productId: resource.productId,
      _codeQR: resource.codeQR,
      _entryDate: resource.entryDate,
      _quantity: resource.quantity,
      _expiryDate: resource.expiryDate,
    });
  }

  toResourceFromEntity(entity: UnitLot): UnitLotResource {
    return {
      id: entity.id,
      productId: entity.productId,
      codeQR: entity.codeQR,
      entryDate: entity.entryDate,
      lotType: entity.lotType,
      quantity: entity.quantity,
      expiryDate: entity.expiryDate,
    } as UnitLotResource;
  }
}

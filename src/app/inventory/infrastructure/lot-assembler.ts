import {LotResource, LotsResponse, ProductType} from './lots-response';
import {Lot} from '../domain/model/lot.entity';
import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
export class LotAssembler implements BaseAssembler<Lot, LotResource,LotsResponse>{
  /**
   * Converts a LotsResponse to an array of Lot entities.
   * @param response - The API response containing lots.
   * @returns An array of Lot entities.
   */
  toEntitiesFromResponse(response: LotsResponse): Lot[] {
    console.log(response);
    return response.lots.map(resource => this.toEntityFromResource(resource as LotResource));
  }

  /**
   * Converts a LotResource to a Lot entity.
   * @param resource - The resource to convert.
   * @returns The converted Lot entity.
   */
  toEntityFromResource(resource: LotResource): Lot {
    return new Lot({
      _id: resource.id,
      _productId: resource.productId,
      _codeQR: resource.codeQR,
      _entryDate: resource.entryDate,
      _lotType : resource.lotType
    });
  }

  /**
   * Converts a Lot entity to a LotResource.
   * @param entity - The entity to convert.
   * @returns The converted LotResource.
   */
  toResourceFromEntity(entity: Lot): LotResource {
    return {
      id: entity.id,
      productId: entity.productId,
      codeQR: entity.codeQR,
      entryDate: entity.entryDate,
      lotType : entity.lotType
    } as LotResource;
  }
}

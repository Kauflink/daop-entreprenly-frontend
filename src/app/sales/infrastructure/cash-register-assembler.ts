import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { CashRegister } from '../domain/model/cash-register.entity';
import { CashRegisterResource, CashRegistersResponse } from './cash-register-response';

export class CashRegisterAssembler implements BaseAssembler<
  CashRegister,
  CashRegisterResource,
  CashRegistersResponse
> {
  toEntitiesFromResponse(_response: CashRegistersResponse): CashRegister[] {
    // JSON-Server devuelve array plano — BaseApiEndpoint lo maneja antes de llegar aquí
    return [];
  }

  toEntityFromResource(resource: CashRegisterResource): CashRegister {
    return new CashRegister({
      id: resource.id,
      date: resource.date,
      totalCash: resource.totalCash,
      totalDigital: resource.totalDigital,
      saleCount: resource.saleCount ?? 0,
    });
  }

  toResourceFromEntity(entity: CashRegister): CashRegisterResource {
    return {
      id: entity.id,
      date: entity.date,
      totalCash: entity.totalCash,
      totalDigital: entity.totalDigital,
      saleCount: entity.saleCount,
    } as CashRegisterResource;
  }
}

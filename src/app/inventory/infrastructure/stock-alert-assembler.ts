import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { StockAlert } from '../domain/model/stock-alert.entity';
import { StockAlertsResponse, StockAlertResource } from './stock-alert-response';

export class StockAlertAssembler implements BaseAssembler<StockAlert, StockAlertResource, StockAlertsResponse> {

  toEntitiesFromResponse(response: StockAlertsResponse): StockAlert[] {
    return response.stockAlerts.map(resource => this.toEntityFromResource(resource));
  }

  toEntityFromResource(resource: StockAlertResource): StockAlert {
    return new StockAlert({
      _id:        resource.id,
      _lotId:     resource.lotId,
      _productId: resource.productId,
      _alertType: resource.alertType,
      _severity:  resource.severity,
      _message:   resource.message,
      _createdAt: new Date(resource.createdAt)
    });
  }

  toResourceFromEntity(entity: StockAlert): StockAlertResource {
    return {
      id:        entity.id,
      lotId:     entity.lotId,
      productId: entity.productId,
      alertType: entity.alertType,
      severity:  entity.severity,
      message:   entity.message,
      createdAt: entity.createdAt.toISOString()
    } as StockAlertResource;
  }
}

import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { StockAlert } from '../domain/model/stock-alert.entity';
import { StockAlertsResponse, StockAlertResource } from './stock-alert-response';

export class StockAlertAssembler implements BaseAssembler<StockAlert, StockAlertResource, StockAlertsResponse> {

  toEntitiesFromResponse(response: StockAlertsResponse): StockAlert[] {
    return response.stockAlerts.map(r => this.toEntityFromResource(r));
  }

  toEntityFromResource(resource: StockAlertResource): StockAlert {
    return new StockAlert({
      _id:           resource.id,
      _lotId:        resource.lotId,
      _productId:    resource.productId,
      _productType:  resource.productType ?? null,
      _productName:  resource.productName ?? '',
      _alertType:    resource.alertType,
      _severity:     resource.severity,
      _message:      resource.message,
      _createdAt:    new Date(resource.createdAt),
      _detailKey:    resource.detailKey ?? '',
      _detailParams: resource.detailParams ?? {}
    });
  }

  toResourceFromEntity(entity: StockAlert): StockAlertResource {
    return {
      id:          entity.id,
      lotId:       entity.lotId,
      productId:   entity.productId,
      productType: entity.productType ?? undefined,
      productName: entity.productName || undefined,
      alertType:   entity.alertType,
      severity:    entity.severity,
      message:     entity.message,
      createdAt:   entity.createdAt.toISOString()
    } as StockAlertResource;
  }
}

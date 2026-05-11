import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface StockAlertsResponse extends BaseResponse {
  stockAlerts: StockAlertResource[];
}

export type AlertType     = 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired';
export type AlertSeverity = 'warning' | 'critical';

export interface StockAlertResource extends BaseResource {
  id:           number;
  lotId:        number | null;
  productId:    number;
  productType?: 'unit' | 'weight';
  productName?: string;
  alertType:    AlertType;
  severity:     AlertSeverity;
  message:      string;
  createdAt:    string;
  detailKey?:   string;
  detailParams?: Record<string, string | number>;
}

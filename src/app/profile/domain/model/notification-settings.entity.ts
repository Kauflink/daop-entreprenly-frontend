import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export interface NotificationSettings extends BaseEntity {
  stockAlerts: boolean;
}

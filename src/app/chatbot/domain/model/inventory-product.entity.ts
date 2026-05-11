import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export interface InventoryProduct extends BaseEntity {
  name: string;
  unitPrice: number;
  isWeighted: boolean;
  availableStock: number;
}

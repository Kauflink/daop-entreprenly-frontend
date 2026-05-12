import { BaseEntity } from '../../../shared/infrastructure/base-entity';
import { Currency } from '../../../shared/application/currency.store';

export type Theme = 'light' | 'dark';

export interface UserPreferences extends BaseEntity {
  language: string;
  timezone: string;
  theme: Theme;
  currency: Currency;
}

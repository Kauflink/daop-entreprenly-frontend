import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export type Theme = 'light' | 'dark';

export interface UserPreferences extends BaseEntity {
  language: string;
  timezone: string;
  theme: Theme;
}

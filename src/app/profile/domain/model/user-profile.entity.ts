import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export interface UserProfile extends BaseEntity {
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: string;
  plan: string;
}

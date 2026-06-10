import { BaseEntity } from '../../../shared/infrastructure/base-entity';

/**
 * Authenticated user returned by the IAM backend on sign-in.
 */
export interface AuthenticatedUser extends BaseEntity {
  email: string;
  token: string;
}

import { BaseResource } from '../../shared/infrastructure/base-response';

/**
 * Resource returned by the sign-in endpoint: the authenticated user and its JWT.
 */
export interface AuthenticatedUserResource extends BaseResource {
  email: string;
  token: string;
}

/**
 * Resource returned by the sign-up endpoint (no token; sign-in is required afterwards).
 */
export interface SignUpResultResource extends BaseResource {
  email: string;
  roles: string[];
}

import { Injectable } from '@angular/core';
import { AuthenticatedUser } from '../domain/model/authenticated-user.entity';
import { AuthenticatedUserResource } from './auth-response';

/**
 * Converts authentication resources from the API into domain entities.
 */
@Injectable({ providedIn: 'root' })
export class AuthAssembler {
  toEntityFromResource(resource: AuthenticatedUserResource): AuthenticatedUser {
    return {
      id: resource.id,
      email: resource.email,
      token: resource.token,
    };
  }
}

import { Injectable } from '@angular/core';
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { UserProfile } from '../domain/model/user-profile.entity';
import { UserProfileResource, UserProfileResponse } from './profile-response';

@Injectable({ providedIn: 'root' })
export class ProfileAssembler
  implements BaseAssembler<UserProfile, UserProfileResource, UserProfileResponse>
{
  toEntityFromResource(resource: UserProfileResource): UserProfile {
    return {
      id: resource.id,
      firstName: resource.first_name,
      lastName: resource.last_name,
      avatarUrl: resource.avatar_url,
      role: resource.role,
      plan: resource.plan,
    };
  }

  toResourceFromEntity(entity: UserProfile): UserProfileResource {
    return {
      id: entity.id,
      first_name: entity.firstName,
      last_name: entity.lastName,
      avatar_url: entity.avatarUrl,
      role: entity.role,
      plan: entity.plan,
    };
  }

  toEntitiesFromResponse(response: UserProfileResponse): UserProfile[] {
    return [this.toEntityFromResource(response.data)];
  }
}

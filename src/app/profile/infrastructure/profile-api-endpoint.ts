import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { UserProfile } from '../domain/model/user-profile.entity';
import { UserProfileResource, UserProfileResponse } from './profile-response';
import { ProfileAssembler } from './profile-assembler';

@Injectable({ providedIn: 'root' })
export class ProfileApiEndpoint extends BaseApiEndpoint<
  UserProfile,
  UserProfileResource,
  UserProfileResponse,
  ProfileAssembler
> {
  constructor() {
    super(inject(HttpClient), '/api/profile', inject(ProfileAssembler));
  }
}

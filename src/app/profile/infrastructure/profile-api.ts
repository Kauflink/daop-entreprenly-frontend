import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserProfile } from '../domain/model/user-profile.entity';
import { ProfileApiEndpoint } from './profile-api-endpoint';

@Injectable({ providedIn: 'root' })
export class ProfileApi {
  private readonly endpoint = inject(ProfileApiEndpoint);

  getProfile(id: number): Observable<UserProfile> {
    return this.endpoint.getById(id);
  }

  updateProfile(profile: UserProfile): Observable<UserProfile> {
    return this.endpoint.update(profile, profile.id);
  }
}

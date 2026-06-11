import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProfileResource } from './profile-response';

/**
 * HTTP access to the profile endpoints of the backend. Keeps all transport
 * concerns in the infrastructure layer so the application store only
 * orchestrates state.
 */
@Injectable({ providedIn: 'root' })
export class ProfileApiService {
  private readonly http = inject(HttpClient);
  private readonly profilesUrl =
    environment.entreprenlyProviderApiBaseUrl + environment.entreprenlyProviderProfilesEndpointPath;

  getByUserId(userId: number): Observable<ProfileResource> {
    return this.http.get<ProfileResource>(`${this.profilesUrl}?userId=${userId}`);
  }

  updateProfile(profileId: number, body: unknown): Observable<ProfileResource> {
    return this.http.put<ProfileResource>(`${this.profilesUrl}/${profileId}`, body);
  }

  updatePreferences(profileId: number, body: unknown): Observable<ProfileResource> {
    return this.http.put<ProfileResource>(`${this.profilesUrl}/${profileId}/preferences`, body);
  }

  updateNotifications(profileId: number, body: unknown): Observable<ProfileResource> {
    return this.http.put<ProfileResource>(
      `${this.profilesUrl}/${profileId}/notification-settings`,
      body,
    );
  }
}

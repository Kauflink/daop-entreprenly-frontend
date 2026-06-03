import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticatedUser } from '../domain/model/authenticated-user.entity';

/**
 * Response returned by the sign-up endpoint (no token; the user must sign in afterwards).
 */
export interface SignUpResponse {
  id: number;
  email: string;
  roles: string[];
}

/**
 * HTTP client for the IAM authentication endpoints.
 */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl =
    environment.entreprenlyProviderApiBaseUrl + environment.entreprenlyProviderAuthEndpointPath;

  signIn(email: string, password: string): Observable<AuthenticatedUser> {
    return this.http.post<AuthenticatedUser>(`${this.baseUrl}/sign-in`, { email, password });
  }

  signUp(email: string, password: string): Observable<SignUpResponse> {
    return this.http.post<SignUpResponse>(`${this.baseUrl}/sign-up`, { email, password });
  }
}

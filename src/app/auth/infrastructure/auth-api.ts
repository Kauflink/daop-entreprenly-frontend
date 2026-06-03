import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticatedUser } from '../domain/model/authenticated-user.entity';
import { AuthenticatedUserResource, SignUpResultResource } from './auth-response';
import { AuthAssembler } from './auth-assembler';

/** Registration payload sent to the sign-up endpoint. */
export interface SignUpRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  timezone?: string;
}

/**
 * HTTP client for the IAM authentication endpoints.
 */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly assembler = inject(AuthAssembler);
  private readonly baseUrl =
    environment.entreprenlyProviderApiBaseUrl + environment.entreprenlyProviderAuthEndpointPath;

  signIn(email: string, password: string): Observable<AuthenticatedUser> {
    return this.http
      .post<AuthenticatedUserResource>(`${this.baseUrl}/sign-in`, { email, password })
      .pipe(map((resource) => this.assembler.toEntityFromResource(resource)));
  }

  signUp(request: SignUpRequest): Observable<SignUpResultResource> {
    return this.http.post<SignUpResultResource>(`${this.baseUrl}/sign-up`, request);
  }
}

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthStore } from '../application/auth-store';

/**
 * Attaches the JWT Bearer token to requests targeting the Entreprenly API,
 * except the authentication endpoints (sign-in / sign-up).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const token = authStore.token;
  const apiBaseUrl = environment.entreprenlyProviderApiBaseUrl;

  const isApiRequest = req.url.startsWith(apiBaseUrl);
  const isAuthEndpoint = req.url.includes(environment.entreprenlyProviderAuthEndpointPath + '/');

  if (token && isApiRequest && !isAuthEndpoint) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};

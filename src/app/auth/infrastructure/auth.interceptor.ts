import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const STORAGE_KEY = 'entreprenly-auth';

/** Reads the JWT from the persisted session without depending on AuthStore (avoids a DI cycle). */
function readToken(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed.token ?? null;
  } catch {
    return null;
  }
}

/**
 * Attaches the JWT Bearer token to requests targeting the Entreprenly API,
 * except the authentication endpoints (sign-in / sign-up).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = readToken();
  const apiBaseUrl = environment.entreprenlyProviderApiBaseUrl;

  const isApiRequest = req.url.startsWith(apiBaseUrl);
  const isAuthEndpoint = req.url.includes(environment.entreprenlyProviderAuthEndpointPath + '/');

  if (token && isApiRequest && !isAuthEndpoint) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};

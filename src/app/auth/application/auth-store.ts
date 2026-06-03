import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';
import { AuthApi } from '../infrastructure/auth-api';
import { AuthenticatedUser } from '../domain/model/authenticated-user.entity';

const STORAGE_KEY = 'entreprenly-auth';

/**
 * Holds the authenticated session (user + JWT) and exposes sign-in / register / logout.
 * The token is persisted in localStorage so the session survives reloads.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);

  readonly user = signal<AuthenticatedUser | null>(this.readStored());
  readonly isAuthenticated = computed(() => this.user() !== null);

  get token(): string | null {
    return this.user()?.token ?? null;
  }

  get userId(): number | null {
    return this.user()?.id ?? null;
  }

  signIn(email: string, password: string): Observable<AuthenticatedUser> {
    return this.api.signIn(email, password).pipe(tap((u) => this.setUser(u)));
  }

  register(email: string, password: string): Observable<AuthenticatedUser> {
    return this.api
      .signUp(email, password)
      .pipe(switchMap(() => this.api.signIn(email, password)), tap((u) => this.setUser(u)));
  }

  logout(): void {
    this.user.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    this.router.navigate(['/login']);
  }

  private setUser(user: AuthenticatedUser): void {
    this.user.set(user);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {}
  }

  private readStored(): AuthenticatedUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthenticatedUser) : null;
    } catch {
      return null;
    }
  }
}

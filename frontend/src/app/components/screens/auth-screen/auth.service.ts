import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthResponse, IUser, LoginRequest, RegisterRequest, UserProfileResponse } from './auth.types';
import { catchError, Observable, of, tap } from 'rxjs';
import { CookieService } from '../../../core/services/cookie.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly cookieService = inject(CookieService);
  private readonly tokenKey = 'token';
  private readonly tokenSignal = signal<string | null>(this.cookieService.get(this.tokenKey));
  private readonly currentUser = signal<IUser | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal() && !!this.currentUser());

  constructor() {
    this.checkProfile();
  }

  public checkProfile(): void {
    const token = this.getToken();
    if (!token) {
      this.tokenSignal.set(null);
      this.currentUser.set(null);
      return;
    }

    this.getProfile().subscribe();
  }

  public getProfile(): Observable<UserProfileResponse | null> {
    return this.http.get<UserProfileResponse>('/api/auth/profile').pipe(
      tap((profile) => {
        this.currentUser.set({
          id: profile.userId,
          email: profile.email,
        });
      }),
      catchError(() => {
        this.logout();
        return of(null);
      }),
    );
  }

  public login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/login', payload)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  public register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/register', payload)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  public logout(): void {
    this.cookieService.delete(this.tokenKey);
    this.tokenSignal.set(null);
    this.currentUser.set(null);
  }

  public getToken(): string | null {
    return this.cookieService.get(this.tokenKey);
  }

  public isAuthenticatedUser(): boolean {
    return !!this.getToken() && !!this.currentUser();
  }

  private handleAuthResponse(response: AuthResponse): void {
    this.cookieService.set(this.tokenKey, response.token);
    this.tokenSignal.set(response.token);
    this.currentUser.set({
      id: response.userId,
      email: response.email,
    });
  }
}

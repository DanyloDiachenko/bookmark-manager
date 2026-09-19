import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { AuthResponse, IUser, LoginRequest, RegisterRequest } from './auth.types';
import { Observable, tap } from 'rxjs';
import { CookieService } from '../../../core/services/cookie.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly cookieService = inject(CookieService);
  private readonly tokenKey = 'token';
  private readonly currentUser = signal<IUser | null>(null);

  readonly user = this.currentUser.asReadonly();

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
    this.currentUser.set(null);
  }

  public getToken(): string | null {
    return this.cookieService.get(this.tokenKey);
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private handleAuthResponse(response: AuthResponse): void {
    this.cookieService.set(this.tokenKey, response.token);
    this.currentUser.set({
      id: response.userId,
      email: response.email,
    });
  }
}

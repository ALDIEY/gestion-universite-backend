import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, UserInfo, Role } from '../../shared/models/models';

const TOKEN_KEY   = 'uchk_access_token';
const REFRESH_KEY = 'uchk_refresh_token';
const USER_KEY    = 'uchk_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly api = `${environment.apiUrl}/auth`;

  // Signal réactif — les composants s'y abonnent sans subscribe()
  currentUser = signal<UserInfo | null>(this.loadUser());

  constructor(private http: HttpClient, private router: Router) {}

  // ── Login / Register ───────────────────────────────────────────────────────

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/login`, req).pipe(
      tap(res => this.saveSession(res))
    );
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/register`, {
      ...req,
      password: req.password ?? req.motDePasse
    }).pipe(
      tap(res => this.saveSession(res))
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('Aucun refresh token disponible'));
    }

    return this.http.post<AuthResponse>(`${this.api}/refresh`, { refreshToken }).pipe(
      tap(res => {
        const token = this.extractToken(res);
        if (token) localStorage.setItem(TOKEN_KEY, token);
      })
    );
  }

  // ── Token accessors ────────────────────────────────────────────────────────

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(...roles: Role[]): boolean {
    const userRoles = this.getUserRoles();
    return roles.some(role => userRoles.includes(role));
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  getUserRoles(): Role[] {
    const user = this.currentUser();
    if (!user) return [];

    const roles = user.roles?.length ? user.roles : user.role ? [user.role] : [];
    return roles
      .map(role => this.normalizeRole(role))
      .filter((role): role is Role => !!role);
  }

  getPrimaryRole(): Role | null {
    return this.getUserRoles()[0] ?? null;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private saveSession(res: AuthResponse): void {
    const token = this.extractToken(res);
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (res.refreshToken) localStorage.setItem(REFRESH_KEY, res.refreshToken);

    const user = this.normalizeUser(res.user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private loadUser(): UserInfo | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? this.normalizeUser(JSON.parse(raw)) : null;
  }

  private extractToken(res: AuthResponse): string | null {
    return res.accessToken ?? res.token ?? null;
  }

  private normalizeUser(user: UserInfo): UserInfo {
    const roles = user.roles?.length ? user.roles : user.role ? [user.role] : [];
    const normalizedRoles = roles
      .map(role => this.normalizeRole(role))
      .filter((role): role is Role => !!role);

    return {
      ...user,
      roles: normalizedRoles,
      role: normalizedRoles[0]
    };
  }

  private normalizeRole(role: unknown): Role | null {
    if (typeof role !== 'string') return null;

    const normalized = role.trim().replace(/^ROLE_/, '').toUpperCase();
    return normalized as Role;
  }
}

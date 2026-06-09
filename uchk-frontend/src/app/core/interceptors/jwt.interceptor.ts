import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();

  // Pas de token = requête publique (login, register)
  if (!token) return next(req);

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // 401 → on tente le refresh une seule fois
      if (err.status === 401 && !req.url.includes('/auth/')) {
        return auth.refreshToken().pipe(
          switchMap(res => {
            const refreshedToken = res.accessToken ?? res.token;
            if (!refreshedToken) return throwError(() => err);

            const retried = req.clone({
              setHeaders: { Authorization: `Bearer ${refreshedToken}` }
            });
            return next(retried);
          }),
          catchError(() => {
            auth.logout();
            return throwError(() => err);
          })
        );
      }
      // 403 → redirection
      if (err.status === 403) {
        router.navigate(['/403']);
      }
      return throwError(() => err);
    })
  );
};

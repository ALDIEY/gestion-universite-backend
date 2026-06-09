import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../../shared/models/models';

// ── Guard : utilisateur connecté ──────────────────────────────────────────────
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  router.navigate(['/auth/login']);
  return false;
};

// ── Guard : rôle requis ───────────────────────────────────────────────────────
export const roleGuard = (...roles: Role[]): CanActivateFn => {
  return () => {
    const auth   = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      router.navigate(['/auth/login']);
      return false;
    }

    if (auth.hasRole(...roles)) return true;

    router.navigate(['/403']);
    return false;
  };
};

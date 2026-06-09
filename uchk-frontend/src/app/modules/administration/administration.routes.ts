// ─── administration.routes.ts ─────────────────────────────────────────────────
import { Routes } from '@angular/router';
export const ADMINISTRATION_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./administration.component').then(m => m.AdministrationComponent) }
];

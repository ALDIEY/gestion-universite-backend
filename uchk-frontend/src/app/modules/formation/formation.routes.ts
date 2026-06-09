// ─── formation.routes.ts ──────────────────────────────────────────────────────
import { Routes } from '@angular/router';

export const FORMATION_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./liste/formation-liste.component').then(m => m.FormationListeComponent) },
  { path: 'nouvelle', loadComponent: () => import('./form/formation-form.component').then(m => m.FormationFormComponent) },
  { path: ':id', loadComponent: () => import('./detail/formation-detail.component').then(m => m.FormationDetailComponent) },
];

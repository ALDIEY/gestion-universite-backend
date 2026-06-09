import { Routes } from '@angular/router';

export const FORMATEUR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./liste/formateur-liste.component').then(m => m.FormateurListeComponent)
  },
  {
    path: 'nouveau',
    redirectTo: '/administration'
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detail/formateur-detail.component').then(m => m.FormateurDetailComponent)
  }
];

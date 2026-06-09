import { Routes } from '@angular/router';

export const ETUDIANT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./liste/etudiant-liste.component').then(m => m.EtudiantListeComponent)
  },
  {
    path: 'nouveau',
    redirectTo: '/administration'
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detail/etudiant-detail.component').then(m => m.EtudiantDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./form/etudiant-form.component').then(m => m.EtudiantFormComponent)
  }
];

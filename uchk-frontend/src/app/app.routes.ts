import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Redirect racine
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Auth (public)
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Dashboard (tout utilisateur connecté)
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./modules/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },

  // Etudiants
  {
    path: 'etudiants',
    canActivate: [authGuard, roleGuard('ADMIN','ADMINISTRATIF','ENSEIGNANT','ENSEIGNANT_ASSOCIE','RESPONSABLE_FORMATION','TUTEUR','APPUI_INSERTION')],
    loadChildren: () =>
      import('./modules/etudiant/etudiant.routes').then(m => m.ETUDIANT_ROUTES)
  },

  // Formations
  {
    path: 'formations',
    canActivate: [authGuard, roleGuard('ADMIN','ADMINISTRATIF','ENSEIGNANT','ENSEIGNANT_ASSOCIE','RESPONSABLE_FORMATION','TUTEUR','ETUDIANT')],
    loadChildren: () =>
      import('./modules/formation/formation.routes').then(m => m.FORMATION_ROUTES)
  },
  // Formateurs
  {
  path: 'formateurs',
  canActivate: [authGuard, roleGuard('ADMIN','ADMINISTRATIF','RESPONSABLE_FORMATION')],
  loadChildren: () =>
    import('./modules/formateur/formateur.routes').then(m => m.FORMATEUR_ROUTES)
},

  // Communication
  {
    path: 'communication',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./modules/communication/communication.routes').then(m => m.COMMUNICATION_ROUTES)
  },

  {
    path: 'emploi-du-temps',
    canActivate: [authGuard, roleGuard('ADMIN','ADMINISTRATIF','ENSEIGNANT','ENSEIGNANT_ASSOCIE','RESPONSABLE_FORMATION','TUTEUR','ETUDIANT')],
    loadComponent: () =>
      import('./modules/emploi-du-temps/emploi-du-temps.component').then(m => m.EmploiDuTempsComponent)
  },

  {
    path: 'appui-insertion',
    canActivate: [authGuard, roleGuard('ADMIN','ADMINISTRATIF','APPUI_INSERTION')],
    loadComponent: () =>
      import('./modules/appui-insertion/appui-insertion.component').then(m => m.AppuiInsertionComponent)
  },

  // Administration
  {
    path: 'administration',
    canActivate: [authGuard, roleGuard('ADMIN','ADMINISTRATIF')],
    loadChildren: () =>
      import('./modules/administration/administration.routes').then(m => m.ADMINISTRATION_ROUTES)
  },

  // Mon profil (étudiant connecté)
  {
    path: 'mon-profil',
    canActivate: [authGuard, roleGuard('ETUDIANT')],
    loadComponent: () =>
      import('./modules/etudiant/profil/mon-profil.component').then(m => m.MonProfilComponent)
  },

  // Erreurs
  { path: '403', loadComponent: () => import('./shared/components/forbidden.component').then(m => m.ForbiddenComponent) },
  { path: '**',  loadComponent: () => import('./shared/components/not-found.component').then(m => m.NotFoundComponent) }
];

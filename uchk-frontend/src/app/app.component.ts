import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from './core/services/auth.service';
import { CommunicationService } from './core/services/api.services';
import { Role } from './shared/models/models';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: Role[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterModule,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatBadgeModule,
    MatMenuModule, MatDividerModule, MatTooltipModule
  ],
  template: `
    <ng-container *ngIf="auth.isLoggedIn(); else loginView">
      <mat-sidenav-container class="sidenav-container">

        <!-- Sidenav -->
        <mat-sidenav #sidenav mode="side" opened class="sidenav" fixedInViewport>
          <!-- Logo -->
          <div class="sidenav-header">
            <img src="assets/logo-uchk.png" alt="UCHK" class="logo"
                 onerror="this.style.display='none'">
            <div class="sidenav-title">
              <span class="univ-name">UCHK</span>
              <span class="univ-sub">Gestion Universitaire</span>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Navigation -->
          <mat-nav-list class="nav-list">
            <ng-container *ngFor="let item of navItems">
              <a mat-list-item
                 *ngIf="canSee(item)"
                 [routerLink]="item.route"
                 routerLinkActive="active-link"
                 [matTooltip]="item.label"
                 matTooltipPosition="right">
                <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                <span matListItemTitle>{{ item.label }}</span>
              </a>
            </ng-container>
          </mat-nav-list>

          <mat-divider></mat-divider>

          <!-- Profil utilisateur bas de sidenav -->
          <div class="sidenav-footer">
            <div class="user-info">
              <mat-icon>account_circle</mat-icon>
              <div class="user-details">
                <span class="user-name">{{ auth.currentUser()?.prenom }} {{ auth.currentUser()?.nom }}</span>
                <span class="user-role">{{ auth.getPrimaryRole() }}</span>
              </div>
            </div>
            <button mat-icon-button (click)="auth.logout()" matTooltip="Se déconnecter" color="warn">
              <mat-icon>logout</mat-icon>
            </button>
          </div>
        </mat-sidenav>

        <!-- Main content -->
        <mat-sidenav-content class="main-content">
          <!-- Toolbar -->
          <mat-toolbar class="toolbar">
            <button mat-icon-button (click)="sidenav.toggle()">
              <mat-icon>menu</mat-icon>
            </button>
            <div class="toolbar-title">
              <strong>Universite Cheikh Hamidou Kane</strong>
              <span>{{ currentSection() }}</span>
            </div>
            <span class="toolbar-spacer"></span>

            <!-- Badge notifications -->
            <button mat-icon-button
                    [routerLink]="['/communication']"
                    [matBadge]="notifCount() || null"
                    matBadgeColor="warn"
                    matBadgeSize="small"
                    matTooltip="Notifications">
              <mat-icon>notifications</mat-icon>
            </button>

            <!-- Menu utilisateur -->
            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item [routerLink]="['/mon-profil']" *ngIf="auth.hasRole('ETUDIANT')">
                <mat-icon>person</mat-icon> Mon profil
              </button>
              <mat-divider *ngIf="auth.hasRole('ETUDIANT')"></mat-divider>
              <button mat-menu-item (click)="auth.logout()" style="color: #e53935">
                <mat-icon color="warn">logout</mat-icon> Se déconnecter
              </button>
            </mat-menu>
          </mat-toolbar>

          <!-- Page courante -->
          <div class="page-content">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>

      </mat-sidenav-container>
    </ng-container>

    <!-- Vue non connectée -->
    <ng-template #loginView>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }
    .sidenav { width: 268px; background: linear-gradient(180deg,#0f2a5f,#123a7a 56%,#0b1f47); color: white; display: flex; flex-direction: column; border-right: 0; }
    .sidenav-header { padding: 20px 18px; display: flex; align-items: center; gap: 12px; }
    .logo { width: 48px; height: 48px; border-radius: 10px; background: white; object-fit: contain; }
    .sidenav-title { display: flex; flex-direction: column; }
    .univ-name { font-size: 20px; font-weight: 800; color: white; line-height:1; }
    .univ-sub  { font-size: 12px; color: rgba(255,255,255,.78); margin-top:4px; }
    .nav-list { padding: 10px 10px; display:flex; flex-direction:column; gap:4px; }
    .mat-mdc-nav-list a { color: rgba(255,255,255,.9) !important; border-radius: 10px; height: 46px; }
    .mat-mdc-nav-list a:hover,
    .mat-mdc-nav-list a.active-link { background: rgba(255,255,255,.13) !important; color: white !important; }
    .mat-mdc-nav-list a.active-link { box-shadow: inset 3px 0 0 #7dd3fc; }
    .mat-icon { color: rgba(255,255,255,.76) !important; }
    .active-link .mat-icon { color: white !important; }
    .sidenav-footer { margin-top: auto; padding: 14px 16px; display: flex; align-items: center; gap: 8px; border-top: 1px solid rgba(255,255,255,.16); background: rgba(3,12,34,.24); }
    .user-info { display: flex; align-items: center; gap: 8px; flex: 1; overflow: hidden; }
    .user-details { display: flex; flex-direction: column; overflow: hidden; }
    .user-name  { font-size: 13px; font-weight: 600; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-role  { font-size: 11px; color: rgba(255,255,255,.72); }
    .toolbar { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,.96); color:#172033; border-bottom:1px solid #e2e8f0; backdrop-filter: blur(10px); }
    .toolbar .mat-icon { color:#475569 !important; }
    .toolbar-title { display:flex; flex-direction:column; margin-left:10px; line-height:1.1; }
    .toolbar-title strong { font-size:14px; color:#172033; }
    .toolbar-title span { font-size:12px; color:#64748b; margin-top:3px; }
    .toolbar-spacer { flex: 1; }
    .main-content { display: flex; flex-direction: column; }
    .page-content { flex: 1; padding: 28px; background: var(--uchk-bg); min-height: calc(100vh - 64px); }
    mat-divider { border-color: rgba(255,255,255,.18) !important; }
    @media(max-width: 900px) {
      .sidenav { width: 244px; }
      .page-content { padding: 18px; }
      .toolbar-title strong { display:none; }
    }
  `]
})
export class AppComponent implements OnInit {
  auth = inject(AuthService);
  private commService = inject(CommunicationService);
  private router = inject(Router);

  notifCount = signal<number>(0);

  navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: 'dashboard',   route: '/dashboard' },
    { label: 'Étudiants',       icon: 'school',       route: '/etudiants',
      roles: ['ADMIN','ADMINISTRATIF','ENSEIGNANT','ENSEIGNANT_ASSOCIE','RESPONSABLE_FORMATION','TUTEUR','APPUI_INSERTION'] },
    { label: 'Formations',      icon: 'menu_book',    route: '/formations',
      roles: ['ADMIN','ADMINISTRATIF','ENSEIGNANT','ENSEIGNANT_ASSOCIE','RESPONSABLE_FORMATION','TUTEUR','ETUDIANT'] },
    { label: 'Emploi du temps', icon: 'event',        route: '/emploi-du-temps',
      roles: ['ADMIN','ADMINISTRATIF','ENSEIGNANT','ENSEIGNANT_ASSOCIE','RESPONSABLE_FORMATION','TUTEUR','ETUDIANT'] },
    { label: 'Communication',   icon: 'forum',        route: '/communication' },
    { label: 'Appui insertion',  icon: 'work',         route: '/appui-insertion',
      roles: ['ADMIN','ADMINISTRATIF','APPUI_INSERTION'] },
    { label: 'Formateurs', icon: 'school', route: '/formateurs',
    roles: ['ADMIN','ADMINISTRATIF','RESPONSABLE_FORMATION'] },
    { label: 'Mon profil', icon: 'person', route: '/mon-profil',
      roles: ['ETUDIANT'] },
    { label: 'Administration',  icon: 'admin_panel_settings', route: '/administration',
      roles: ['ADMIN','ADMINISTRATIF'] },
  ];

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.loadNotifCount();
    }
  }

  canSee(item: NavItem): boolean {
    if (!item.roles) return true;
    return this.auth.hasRole(...item.roles);
  }

  currentSection(): string {
    const path = this.router.url.split('?')[0];
    return this.navItems.find(item => path.startsWith(item.route))?.label ?? 'Tableau de bord';
  }

  private loadNotifCount(): void {
    this.commService.countNonLus().subscribe({
      next: res => this.notifCount.set(res.nonLus),
      error: () => {}
    });
  }
}

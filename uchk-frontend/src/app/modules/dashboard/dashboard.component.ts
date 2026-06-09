import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../core/services/auth.service';
import { AdministrationService, CommunicationService, EtudiantService, FormationService } from '../../core/services/api.services';
import { Role } from '../../shared/models/models';
import { catchError, forkJoin, of } from 'rxjs';

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatIconModule, MatButtonModule, MatDividerModule, MatListModule, MatChipsModule
  ],
  template: `
    <div class="dashboard">
      <div class="welcome-banner">
        <div>
          <h2>{{ profileTitle() }}</h2>
          <p>{{ today | date:'EEEE d MMMM yyyy':'':'fr' }} - {{ profileDescription() }}</p>
        </div>
        <div class="welcome-badge">
          <mat-icon>school</mat-icon>
          <span>UCHK</span>
        </div>
      </div>

      <div class="stats-grid">
        <mat-card class="stat-card" *ngFor="let s of stats()" [routerLink]="s.route">
          <mat-card-content>
            <div class="stat-content">
              <div>
                <p class="stat-label">{{ s.label }}</p>
                <h3 class="stat-value">{{ s.value }}</h3>
              </div>
              <div class="stat-icon" [style.background]="s.color">
                <mat-icon>{{ s.icon }}</mat-icon>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="content-grid">
        <mat-card class="content-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>event</mat-icon>
            <mat-card-title>Reunions et activites</mat-card-title>
          </mat-card-header>
          <mat-divider></mat-divider>
          <mat-card-content>
            <div *ngIf="reunions().length === 0" class="empty-state">
              <mat-icon>event_available</mat-icon>
              <p>Aucune reunion planifiee</p>
            </div>
            <mat-list>
              <mat-list-item *ngFor="let r of reunions()">
                <mat-icon matListItemIcon color="primary">groups</mat-icon>
                <div matListItemTitle>{{ r.objet }}</div>
                <div matListItemLine>{{ r.dateHeure | date:'dd/MM/yyyy HH:mm' }} <span *ngIf="r.lieu">- {{ r.lieu }}</span></div>
              </mat-list-item>
            </mat-list>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" [routerLink]="['/communication']">Voir communication</button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="content-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>notifications</mat-icon>
            <mat-card-title>Notifications recentes</mat-card-title>
            <mat-card-subtitle *ngIf="notifCount() > 0">{{ notifCount() }} non lue(s)</mat-card-subtitle>
          </mat-card-header>
          <mat-divider></mat-divider>
          <mat-card-content>
            <div *ngIf="notifications().length === 0" class="empty-state">
              <mat-icon>notifications_none</mat-icon>
              <p>Aucune notification</p>
            </div>
            <mat-list>
              <mat-list-item *ngFor="let n of notifications()">
                <mat-icon matListItemIcon [color]="n.lu ? '' : 'accent'">
                  {{ n.lu ? 'notifications_none' : 'notifications_active' }}
                </mat-icon>
                <div matListItemTitle [style.fontWeight]="n.lu ? 'normal' : '700'">{{ n.titre }}</div>
                <div matListItemLine>{{ n.createdAt | date:'dd/MM HH:mm' }}</div>
              </mat-list-item>
            </mat-list>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" [routerLink]="['/communication']">Toutes les notifications</button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard{max-width:1240px;margin:0 auto;display:flex;flex-direction:column;gap:22px}
    .welcome-banner{display:flex;justify-content:space-between;align-items:center;background:#ffffff;color:#172033;border:1px solid #e2e8f0;border-left:5px solid #0f766e;border-radius:10px;padding:24px 28px;box-shadow:0 2px 10px rgba(15,23,42,.04)}
    .welcome-banner h2{margin:0 0 6px;font-size:26px;color:#1f3a8a}
    .welcome-banner p{margin:0;color:#64748b}
    .welcome-badge{display:flex;align-items:center;gap:10px;background:#edf3ff;color:#1f3a8a;border-radius:999px;padding:10px 14px;font-weight:700}
    .welcome-badge mat-icon{font-size:24px;width:24px;height:24px}
    .stat-card{cursor:pointer;transition:transform .18s,box-shadow .18s,border-color .18s}
    .stat-card:hover{transform:translateY(-2px);border-color:#bfdbfe!important}
    .stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px}
    .stat-content{display:flex;justify-content:space-between;align-items:center;min-height:82px}
    .stat-label{color:#64748b;font-size:13px;margin:0 0 6px}
    .stat-value{font-size:34px;font-weight:800;margin:0;color:#172033}
    .stat-icon{width:52px;height:52px;border-radius:10px;display:flex;align-items:center;justify-content:center}
    .stat-icon mat-icon{color:white;font-size:26px;width:26px;height:26px}
    .content-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
    .content-card mat-card-content{max-height:320px;overflow-y:auto}
    .content-card mat-card-title{font-size:17px;color:#172033}
    .empty-state{text-align:center;padding:36px;color:#94a3b8}
    .empty-state mat-icon{font-size:46px;width:46px;height:46px}
    .empty-state p{margin:8px 0 0}
    @media(max-width:768px){.content-grid{grid-template-columns:1fr}.welcome-badge{display:none}.welcome-banner{padding:18px}.welcome-banner h2{font-size:22px}}
  `]
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private etSvc = inject(EtudiantService);
  private fmSvc = inject(FormationService);
  private commSvc = inject(CommunicationService);
  private adminSvc = inject(AdministrationService);

  today = new Date();
  stats = signal<StatCard[]>([]);
  reunions = signal<any[]>([]);
  notifications = signal<any[]>([]);
  notifCount = signal(0);

  ngOnInit(): void {
    this.loadStats();
    this.loadReunions();
    this.loadNotifications();
  }

  profileTitle(): string {
    const prenom = this.auth.currentUser()?.prenom ?? '';
    const role = this.auth.getPrimaryRole();
    const suffix = prenom ? ` - ${prenom}` : '';
    const labels: Partial<Record<Role, string>> = {
      ADMIN: `Espace administrateur${suffix}`,
      ADMINISTRATIF: `Espace administration${suffix}`,
      RESPONSABLE_FORMATION: `Espace responsable formation${suffix}`,
      ENSEIGNANT: `Espace enseignant${suffix}`,
      ENSEIGNANT_ASSOCIE: `Espace enseignant associe${suffix}`,
      TUTEUR: `Espace tuteur${suffix}`,
      APPUI_INSERTION: `Espace appui a l'insertion${suffix}`,
      ETUDIANT: `Espace etudiant${suffix}`
    };
    return labels[role ?? 'ADMIN'] ?? `Bonjour${suffix}`;
  }

  profileDescription(): string {
    const role = this.auth.getPrimaryRole();
    const descriptions: Partial<Record<Role, string>> = {
      ADMIN: 'pilotage global des modules, utilisateurs et donnees',
      ADMINISTRATIF: 'documents, budget, dossiers et activites administratives',
      RESPONSABLE_FORMATION: 'formations, modules, emplois du temps et suivi pedagogique',
      ENSEIGNANT: 'cours, modules, reunions et planning pedagogique',
      ENSEIGNANT_ASSOCIE: 'interventions, modules et planning pedagogique',
      TUTEUR: 'suivi tutorat, etudiants et reunions',
      APPUI_INSERTION: 'stages, partenaires et insertion professionnelle',
      ETUDIANT: 'formation, profil, notifications et emploi du temps'
    };
    return descriptions[role ?? 'ADMIN'] ?? 'tableau de bord';
  }

  private loadStats(): void {
    if (this.auth.hasRole('APPUI_INSERTION')) {
      forkJoin({
        stages: this.adminSvc.findStages(0, 1).pipe(catchError(() => of(null))),
        partenaires: this.adminSvc.searchPartenaires('', 0, 1).pipe(catchError(() => of(null)))
      }).subscribe(({ stages, partenaires }) => {
        this.stats.set([
          { label: 'Stages suivis', value: stages?.totalElements ?? 0, icon: 'work', color: '#1565c0', route: '/appui-insertion' },
          { label: 'Partenaires', value: partenaires?.totalElements ?? 0, icon: 'handshake', color: '#2e7d32', route: '/appui-insertion' },
          { label: 'Notifications', value: this.notifCount(), icon: 'notifications', color: '#e65100', route: '/communication' }
        ]);
      });
    } else if (this.auth.hasRole('ADMIN', 'ADMINISTRATIF')) {
      forkJoin({
        etudiants: this.etSvc.search('', 0, 1).pipe(catchError(() => of(null))),
        formations: this.fmSvc.findAll(0, 1).pipe(catchError(() => of(null))),
        documents: this.adminSvc.searchDocuments('', 0, 1).pipe(catchError(() => of(null)))
      }).subscribe(({ etudiants, formations, documents }) => {
        this.stats.set([
          { label: 'Etudiants', value: etudiants?.totalElements ?? 0, icon: 'school', color: '#1565c0', route: '/etudiants' },
          { label: 'Formations', value: formations?.totalElements ?? 0, icon: 'menu_book', color: '#2e7d32', route: '/formations' },
          { label: 'Documents', value: documents?.totalElements ?? 0, icon: 'folder', color: '#6a1b9a', route: '/administration' },
          { label: 'Notifications', value: this.notifCount(), icon: 'notifications', color: '#e65100', route: '/communication' }
        ]);
      });
    } else if (this.auth.hasRole('RESPONSABLE_FORMATION', 'ENSEIGNANT', 'ENSEIGNANT_ASSOCIE', 'TUTEUR')) {
      forkJoin({
        etudiants: this.etSvc.search('', 0, 1).pipe(catchError(() => of(null))),
        formations: this.fmSvc.findAll(0, 1).pipe(catchError(() => of(null)))
      }).subscribe(({ etudiants, formations }) => {
        this.stats.set([
          { label: 'Etudiants', value: etudiants?.totalElements ?? 0, icon: 'school', color: '#1565c0', route: '/etudiants' },
          { label: 'Formations', value: formations?.totalElements ?? 0, icon: 'menu_book', color: '#2e7d32', route: '/formations' },
          { label: 'Planning', value: 'Voir', icon: 'event', color: '#6a1b9a', route: '/emploi-du-temps' },
          { label: 'Notifications', value: this.notifCount(), icon: 'notifications', color: '#e65100', route: '/communication' }
        ]);
      });
    } else {
      this.fmSvc.findAll(0, 1).pipe(catchError(() => of(null))).subscribe(formations => {
        this.stats.set([
          { label: 'Formations', value: formations?.totalElements ?? 0, icon: 'menu_book', color: '#2e7d32', route: '/formations' },
          { label: 'Mon planning', value: 'Voir', icon: 'event', color: '#1565c0', route: '/emploi-du-temps' },
          { label: 'Notifications', value: this.notifCount(), icon: 'notifications', color: '#e65100', route: '/communication' }
        ]);
      });
    }
  }

  private loadReunions(): void {
    this.commSvc.mesReunions(0, 5).subscribe({ next: res => this.reunions.set(res.content), error: () => {} });
  }

  private loadNotifications(): void {
    this.commSvc.mesNotifications(0, 5).subscribe({ next: res => this.notifications.set(res.content), error: () => {} });
    this.commSvc.countNonLus().subscribe({ next: res => this.notifCount.set(res.nonLus), error: () => {} });
  }
}

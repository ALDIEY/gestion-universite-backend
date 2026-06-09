import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { AdministrationService, EtudiantService } from '../../../core/services/api.services';
import { DocumentAdminResponse, EtudiantDetail, StageResponse } from '../../../shared/models/models';

@Component({
  selector: 'app-mon-profil',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatChipsModule, MatTabsModule, MatListModule,
    MatProgressSpinnerModule, MatDividerModule
  ],
  template: `
    <div *ngIf="loading()" class="center-spinner"><mat-spinner></mat-spinner></div>

    <ng-container *ngIf="profil() as e">
      <div class="page-header">
        <h2>Mon profil</h2>
        <button mat-stroked-button color="accent"
                [routerLink]="['/etudiants', e.id, 'edit']">
          <mat-icon>edit</mat-icon> Modifier
        </button>
      </div>

      <mat-card class="profile-card">
        <mat-card-content>
          <div class="profile-layout">
            <div class="avatar"><mat-icon>account_circle</mat-icon></div>
            <div class="profile-info">
              <h3>{{ e.prenom }} {{ e.nom }}</h3>
              <p><mat-icon>email</mat-icon> {{ e.email }}</p>
              <p *ngIf="e.telephone"><mat-icon>phone</mat-icon> {{ e.telephone }}</p>
              <p *ngIf="e.adresse"><mat-icon>location_on</mat-icon> {{ e.adresse }}</p>
              <mat-chip-set>
                <mat-chip color="primary" selected>INE : {{ e.ine || 'Non renseigné' }}</mat-chip>
                <mat-chip color="accent" selected *ngIf="e.dateNaissance">
                  Né(e) le {{ e.dateNaissance | date:'dd/MM/yyyy' }}
                </mat-chip>
              </mat-chip-set>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-tab-group class="tabs-card">
        <mat-tab>
          <ng-template mat-tab-label><mat-icon>school</mat-icon>&nbsp; Mes inscriptions</ng-template>
          <div class="tab-content">
            <mat-list>
              <mat-list-item *ngFor="let i of e.inscriptions">
                <mat-icon matListItemIcon color="primary">school</mat-icon>
                <div matListItemTitle>{{ i.formationIntitule }}</div>
                <div matListItemLine>
                  {{ i.anneeDebut }} – {{ i.anneeSortie || 'en cours' }}
                  &nbsp;|&nbsp; <strong>{{ i.statut }}</strong>
                </div>
              </mat-list-item>
              <div *ngIf="e.inscriptions.length === 0" class="empty">
                Aucune inscription
              </div>
            </mat-list>
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label><mat-icon>workspace_premium</mat-icon>&nbsp; Mes diplômes</ng-template>
          <div class="tab-content">
            <mat-list>
              <mat-list-item *ngFor="let d of e.diplomes">
                <mat-icon matListItemIcon color="accent">workspace_premium</mat-icon>
                <div matListItemTitle>{{ d.intitule }}</div>
                <div matListItemLine>{{ d.etablissement }} — {{ d.anneeObtention }}</div>
              </mat-list-item>
              <div *ngIf="e.diplomes.length === 0" class="empty">
                Aucun diplôme enregistré
              </div>
            </mat-list>
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label><mat-icon>work</mat-icon>&nbsp; Mes stages</ng-template>
          <div class="tab-content">
            <mat-list>
              <mat-list-item *ngFor="let s of stages()">
                <mat-icon matListItemIcon color="primary">work</mat-icon>
                <div matListItemTitle>{{ s.sujet }}</div>
                <div matListItemLine>
                  {{ s.dateDebut | date:'dd/MM/yyyy' }} - {{ s.dateFin | date:'dd/MM/yyyy' }}
                  &nbsp;|&nbsp; <strong>{{ s.statut }}</strong>
                </div>
              </mat-list-item>
              <div *ngIf="stages().length === 0" class="empty">
                Aucun stage enregistre
              </div>
            </mat-list>
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label><mat-icon>folder</mat-icon>&nbsp; Documents</ng-template>
          <div class="tab-content">
            <mat-list>
              <mat-list-item *ngFor="let d of documents()">
                <mat-icon matListItemIcon color="primary">description</mat-icon>
                <div matListItemTitle>{{ d.objet }}</div>
                <div matListItemLine>{{ d.typeDoc }} - {{ d.statut }}</div>
                <a mat-button *ngIf="d.fichierPath" [href]="d.fichierPath" target="_blank">Ouvrir</a>
              </mat-list-item>
              <div *ngIf="documents().length === 0" class="empty">
                Aucun document disponible
              </div>
            </mat-list>
          </div>
        </mat-tab>
      </mat-tab-group>
    </ng-container>

    <div *ngIf="!loading() && !profil()" class="empty-state">
      <mat-icon>person_off</mat-icon>
      <p>Profil étudiant non trouvé. Contactez l'administration.</p>
    </div>
  `,
  styles: [`
    .center-spinner { display:flex; justify-content:center; padding:80px; }
    .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
    .page-header h2 { margin:0; font-size:22px; color:#1a237e; }
    .profile-card { border-radius:12px; margin-bottom:16px; }
    .profile-layout { display:flex; gap:24px; align-items:flex-start; flex-wrap:wrap; }
    .avatar mat-icon { font-size:80px; width:80px; height:80px; color:#bbb; }
    .profile-info h3 { margin:0 0 8px; font-size:20px; }
    .profile-info p { display:flex; align-items:center; gap:6px; color:#555; margin:4px 0; font-size:14px; }
    .tabs-card { border-radius:12px; background:white; box-shadow:0 2px 8px rgba(0,0,0,.08); }
    .tab-content { padding:8px; }
    .empty { text-align:center; padding:32px; color:#bbb; }
    .empty-state { text-align:center; padding:80px; color:#bbb; }
    .empty-state mat-icon { font-size:64px; width:64px; height:64px; }
  `]
})
export class MonProfilComponent implements OnInit {
  private auth = inject(AuthService);
  private svc  = inject(EtudiantService);
  private adminSvc = inject(AdministrationService);

  profil  = signal<EtudiantDetail | null>(null);
  stages = signal<StageResponse[]>([]);
  documents = signal<DocumentAdminResponse[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    const email = this.auth.currentUser()?.email;
    if (!email) { this.loading.set(false); return; }
    this.svc.search(email, 0, 1000).subscribe({
      next: res => {
        const summary = res.content.find(e => e.email === email);
        if (!summary) { this.loading.set(false); return; }
        this.svc.findById(summary.id).subscribe({
          next: e => {
            this.profil.set(e);
            this.loading.set(false);
            this.loadStages(e.id);
          },
          error: () => this.loading.set(false)
        });
      },
      error: () => this.loading.set(false)
    });
    this.loadDocuments();
  }

  private loadStages(etudiantId: string): void {
    this.adminSvc.findStagesByEtudiant(etudiantId, 0, 100).subscribe({
      next: res => this.stages.set(res.content),
      error: () => this.stages.set([])
    });
  }

  private loadDocuments(): void {
    this.adminSvc.searchDocuments('', 0, 100).subscribe({
      next: res => this.documents.set(res.content.filter(d => d.statut !== 'ARCHIVE')),
      error: () => this.documents.set([])
    });
  }
}

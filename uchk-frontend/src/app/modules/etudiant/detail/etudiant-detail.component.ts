import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EtudiantService, FormationService } from '../../../core/services/api.services';
import { AuthService } from '../../../core/services/auth.service';
import { EtudiantDetail, FormationSummary, InscriptionResponse } from '../../../shared/models/models';

@Component({
  selector: 'app-etudiant-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatTabsModule, MatIconModule, MatButtonModule,
    MatChipsModule, MatDividerModule, MatListModule,
    MatProgressSpinnerModule, MatTableModule,
    MatFormFieldModule, MatSelectModule, MatInputModule, MatSnackBarModule
  ],
  template: `
    <div *ngIf="loading()" class="center-spinner">
      <mat-spinner></mat-spinner>
    </div>

    <ng-container *ngIf="etudiant() as e">
      <div class="page-header">
        <button mat-icon-button [routerLink]="['/etudiants']">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h2>{{ e.prenom }} {{ e.nom }}</h2>
        <button mat-stroked-button color="accent"
                *ngIf="auth.hasRole('ADMIN','ADMINISTRATIF')"
                [routerLink]="['/etudiants', e.id, 'edit']">
          <mat-icon>edit</mat-icon> Modifier
        </button>
      </div>

      <!-- Carte profil -->
      <mat-card class="profile-card">
        <mat-card-content>
          <div class="profile-layout">
            <div class="avatar">
              <mat-icon>account_circle</mat-icon>
            </div>
            <div class="profile-info">
              <h3>{{ e.prenom }} {{ e.nom }}</h3>
              <p class="email"><mat-icon>email</mat-icon> {{ e.email }}</p>
              <div class="chips-row">
                <mat-chip-set>
                  <mat-chip color="primary" selected>
                    <mat-icon>badge</mat-icon> INE : {{ e.ine || 'Non renseigné' }}
                  </mat-chip>
                  <mat-chip [color]="e.genre === 'M' ? 'primary' : 'accent'" selected>
                    {{ e.genre === 'M' ? 'Homme' : 'Femme' }}
                  </mat-chip>
                </mat-chip-set>
              </div>
            </div>
            <div class="profile-meta">
              <div class="meta-item" *ngIf="e.dateNaissance">
                <mat-icon>cake</mat-icon>
                <span>{{ e.dateNaissance | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="meta-item" *ngIf="e.telephone">
                <mat-icon>phone</mat-icon>
                <span>{{ e.telephone }}</span>
              </div>
              <div class="meta-item" *ngIf="e.adresse">
                <mat-icon>location_on</mat-icon>
                <span>{{ e.adresse }}</span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="current-card" *ngIf="currentInscription(e) as current">
        <mat-card-content>
          <div class="current-content">
            <mat-icon color="primary">school</mat-icon>
            <div>
              <p class="current-label">Formation actuelle</p>
              <h3>{{ current.formationIntitule }}</h3>
              <p>{{ current.anneeAcademique || 'Année non renseignée' }} - {{ current.statut }}</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Onglets -->
      <mat-tab-group animationDuration="200ms" class="tabs-card">

        <!-- Inscriptions -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>school</mat-icon>&nbsp; Inscriptions ({{ e.inscriptions.length }})
          </ng-template>
          <div class="tab-content">
            <mat-card class="action-card" *ngIf="auth.hasRole('ADMIN','ADMINISTRATIF')">
              <mat-card-content>
                <form [formGroup]="inscriptionForm" class="inscription-form">
                  <mat-form-field appearance="outline">
                    <mat-label>Nouvelle formation</mat-label>
                    <mat-select formControlName="formationId">
                      <mat-option *ngFor="let formation of formations()" [value]="formation.id">
                        {{ formation.intitule }} - {{ formation.niveau }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Année académique</mat-label>
                    <input matInput formControlName="anneeAcademique" placeholder="2025-2026">
                  </mat-form-field>
                  <button mat-raised-button color="primary"
                          (click)="inscrire(e)"
                          [disabled]="inscriptionForm.invalid || hasFormationEnCours(e)">
                    <mat-icon>add</mat-icon> Inscrire
                  </button>
                </form>
                <p class="rule-warning" *ngIf="hasFormationEnCours(e)">
                  L'étudiant a déjà une formation en cours. Terminez cette inscription avant d'en commencer une autre.
                </p>
              </mat-card-content>
            </mat-card>

            <div *ngIf="e.inscriptions.length === 0" class="empty-tab">
              <mat-icon>school</mat-icon><p>Aucune inscription</p>
            </div>
            <table mat-table [dataSource]="e.inscriptions" *ngIf="e.inscriptions.length > 0">
              <ng-container matColumnDef="formation">
                <th mat-header-cell *matHeaderCellDef>Formation</th>
                <td mat-cell *matCellDef="let i">{{ i.formationIntitule }}</td>
              </ng-container>
              <ng-container matColumnDef="annee">
                <th mat-header-cell *matHeaderCellDef>Année</th>
                <td mat-cell *matCellDef="let i">
                  {{ i.anneeDebut }}{{ i.anneeSortie ? ' – ' + i.anneeSortie : ' – en cours' }}
                </td>
              </ng-container>
              <ng-container matColumnDef="statut">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let i">
                  <mat-chip-set>
                    <mat-chip
                      [color]="i.statut === 'EN_COURS' ? 'primary' : i.statut === 'DIPLOME' ? 'accent' : 'warn'"
                      selected>
                      {{ i.statut }}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['formation','annee','statut']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['formation','annee','statut']"></tr>
            </table>
          </div>
        </mat-tab>

        <!-- Diplômes -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>workspace_premium</mat-icon>&nbsp; Diplômes ({{ e.diplomes.length }})
          </ng-template>
          <div class="tab-content">
            <div *ngIf="e.diplomes.length === 0" class="empty-tab">
              <mat-icon>workspace_premium</mat-icon><p>Aucun diplôme enregistré</p>
            </div>
            <mat-list>
              <mat-list-item *ngFor="let d of e.diplomes">
                <mat-icon matListItemIcon color="accent">workspace_premium</mat-icon>
                <div matListItemTitle>{{ d.intitule }}</div>
                <div matListItemLine>
                  {{ d.etablissement }} — {{ d.anneeObtention }}
                </div>
              </mat-list-item>
            </mat-list>
          </div>
        </mat-tab>

      </mat-tab-group>
    </ng-container>
  `,
  styles: [`
    .center-spinner { display:flex; justify-content:center; padding:80px; }
    .page-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
    }
    .page-header h2 { flex:1; margin:0; font-size:22px; color:#1a237e; }
    .profile-card { border-radius:12px; margin-bottom:16px; }
    .current-card { border-radius:12px; margin-bottom:16px; border-left:4px solid #3949ab; }
    .current-content { display:flex; gap:12px; align-items:center; }
    .current-label { margin:0; color:#666; font-size:12px; }
    .current-content h3 { margin:2px 0; color:#1a237e; }
    .current-content p { margin:0; }
    .profile-layout { display:flex; gap:24px; align-items:flex-start; flex-wrap:wrap; }
    .avatar mat-icon { font-size:80px; width:80px; height:80px; color:#bbb; }
    .profile-info { flex:1; }
    .profile-info h3 { margin:0 0 4px; font-size:20px; }
    .email { display:flex; align-items:center; gap:4px; color:#666; margin:4px 0 12px; }
    .chips-row { margin-top:8px; }
    .profile-meta { display:flex; flex-direction:column; gap:8px; }
    .meta-item { display:flex; align-items:center; gap:8px; color:#555; font-size:14px; }
    .tabs-card { border-radius:12px; background:white; box-shadow:0 2px 8px rgba(0,0,0,0.08); }
    .tab-content { padding:16px; display:flex; flex-direction:column; gap:16px; }
    .action-card { background:#f8f9ff; border:1px solid #e8eaf6; border-radius:12px; }
    .inscription-form { display:flex; gap:12px; align-items:flex-start; flex-wrap:wrap; }
    .inscription-form mat-form-field { flex:1; min-width:220px; }
    .rule-warning { color:#c62828; margin:0; font-size:13px; }
    .empty-tab { text-align:center; padding:48px; color:#bbb; }
    .empty-tab mat-icon { font-size:48px; width:48px; height:48px; }
    table { width:100%; }
  `]
})
export class EtudiantDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc   = inject(EtudiantService);
  private formationSvc = inject(FormationService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  auth          = inject(AuthService);

  etudiant = signal<EtudiantDetail | null>(null);
  formations = signal<FormationSummary[]>([]);
  loading  = signal(true);
  inscriptionForm = this.fb.group({
    formationId: ['', Validators.required],
    anneeAcademique: ['']
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadFormations();
    this.loadEtudiant(id);
  }

  loadEtudiant(id: string): void {
    this.svc.findById(id).subscribe({
      next: e  => { this.etudiant.set(e); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadFormations(): void {
    this.formationSvc.findAll(0, 1000).subscribe({
      next: res => this.formations.set(res.content),
      error: () => this.formations.set([])
    });
  }

  currentInscription(e: EtudiantDetail): InscriptionResponse | null {
    return e.inscriptions.find(i => ['EN_COURS', 'ACTIF'].includes(String(i.statut))) ?? null;
  }

  hasFormationEnCours(e: EtudiantDetail): boolean {
    return !!this.currentInscription(e);
  }

  inscrire(e: EtudiantDetail): void {
    if (this.inscriptionForm.invalid || this.hasFormationEnCours(e)) return;

    this.svc.inscrire(e.id, {
      formationId: this.inscriptionForm.value.formationId!,
      anneeAcademique: this.inscriptionForm.value.anneeAcademique ?? '',
      statut: 'EN_COURS'
    }).subscribe({
      next: () => {
        this.snack.open('Inscription ajoutée', 'OK', { duration: 3000 });
        this.inscriptionForm.reset();
        this.loadEtudiant(e.id);
      },
      error: err => this.snack.open(err.error?.message || 'Inscription impossible', 'Fermer', { duration: 4000 })
    });
  }
}

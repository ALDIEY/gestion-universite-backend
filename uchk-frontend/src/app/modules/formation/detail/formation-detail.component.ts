import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormationService, EtudiantService } from '../../../core/services/api.services';
import { FormateurService } from '../../../core/services/formateur.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormationDetail, FormationStats, ModuleResponse, EtudiantSummary, FormateurSummary } from '../../../shared/models/models';

@Component({
  selector: 'app-formation-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatTabsModule, MatIconModule, MatButtonModule,
    MatChipsModule, MatListModule, MatTableModule,
    MatProgressSpinnerModule, MatDividerModule, MatProgressBarModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule, MatTooltipModule
  ],
  template: `
    <div *ngIf="loading()" class="center-spinner"><mat-spinner></mat-spinner></div>

    <ng-container *ngIf="formation() as f">
      <div class="page-header">
        <button mat-icon-button [routerLink]="['/formations']">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-text">
          <h2>{{ f.intitule }}</h2>
          <p>Niveau : {{ f.niveau }} — {{ f.typeFormation }}</p>
        </div>
      </div>

      <!-- Cartes résumé -->
      <div class="summary-grid">
        <mat-card class="sum-card">
          <mat-card-content>
            <div class="sum-content">
              <div class="sum-icon" style="background:#1565c0"><mat-icon>schedule</mat-icon></div>
              <div><p class="sum-label">Volume horaire total</p><h3>{{ f.totalVolumeHoraire }}h</h3></div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="sum-card">
          <mat-card-content>
            <div class="sum-content">
              <div class="sum-icon" style="background:#2e7d32"><mat-icon>star</mat-icon></div>
              <div><p class="sum-label">Total crédits</p><h3>{{ f.totalCredits }}</h3></div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="sum-card">
          <mat-card-content>
            <div class="sum-content">
              <div class="sum-icon" style="background:#e65100"><mat-icon>school</mat-icon></div>
              <div><p class="sum-label">Étudiants inscrits</p><h3>{{ stats()?.nbInscrits ?? '—' }}</h3></div>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card class="sum-card">
          <mat-card-content>
            <div class="sum-content">
              <div class="sum-icon" style="background:#6a1b9a"><mat-icon>layers</mat-icon></div>
              <div><p class="sum-label">Modules</p><h3>{{ f.modules.length }}</h3></div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Onglets -->
      <mat-tab-group class="tabs-card">

        <!-- ─── MODULES ─── -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>layers</mat-icon>&nbsp; Modules ({{ f.modules.length }})
          </ng-template>
          <div class="tab-content">

            <!-- Formulaire ajout module -->
            <mat-card class="action-card"
                      *ngIf="auth.hasRole('ADMIN','RESPONSABLE_FORMATION')">
              <mat-card-header>
                <mat-icon mat-card-avatar color="primary">add_circle</mat-icon>
                <mat-card-title>Ajouter un module</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="moduleForm" class="inline-form">
                  <mat-form-field appearance="outline" class="flex2">
                    <mat-label>Intitulé du module</mat-label>
                    <input matInput formControlName="intitule"
                           placeholder="ex: Programmation Web, BDD...">
                    <mat-error>Intitulé requis</mat-error>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="flex1">
                    <mat-label>Volume horaire (h)</mat-label>
                    <input matInput type="number" formControlName="volumeHoraire">
                    <mat-icon matSuffix>schedule</mat-icon>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="flex1">
                    <mat-label>Crédits</mat-label>
                    <input matInput type="number" formControlName="credits">
                    <mat-icon matSuffix>star</mat-icon>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="flex1">
                    <mat-label>Coefficient</mat-label>
                    <input matInput type="number" formControlName="coefficient">
                    <mat-icon matSuffix>percent</mat-icon>
                  </mat-form-field>
                  <button mat-raised-button color="primary"
                          (click)="addModule(f.id)"
                          [disabled]="moduleForm.invalid || savingModule()">
                    <mat-spinner *ngIf="savingModule()" diameter="18"></mat-spinner>
                    <mat-icon *ngIf="!savingModule()">add</mat-icon>
                    Ajouter
                  </button>
                </form>
              </mat-card-content>
            </mat-card>

            <!-- Vide -->
            <div *ngIf="f.modules.length === 0" class="empty-tab">
              <mat-icon>layers</mat-icon>
              <p>Aucun module pour cette formation</p>
              <p class="empty-sub" *ngIf="auth.hasRole('ADMIN','RESPONSABLE_FORMATION')">
                Utilisez le formulaire ci-dessus pour ajouter le premier module.
              </p>
            </div>

            <!-- Grille de cards modules -->
            <div class="modules-grid" *ngIf="f.modules.length > 0">
              <mat-card class="module-card" *ngFor="let m of f.modules; let i = index">
                <mat-card-content>
                  <div class="module-header">
                    <div class="module-number">{{ i + 1 }}</div>
                    <div class="module-title">
                      <h4>{{ m.intitule }}</h4>
                      <div class="module-badges">
                        <span><mat-icon>schedule</mat-icon>{{ m.volumeHoraire }}h</span>
                        <span><mat-icon>star</mat-icon>{{ m.credits }} crédits</span>
                        <span><mat-icon>percent</mat-icon>Coef. {{ m.coefficient }}</span>
                      </div>
                    </div>
                  </div>

                  <mat-divider style="margin: 10px 0"></mat-divider>

                  <div class="module-stats">
                    <div class="module-stat">
                      <mat-icon>schedule</mat-icon>
                      <div>
                        <span class="stat-val">{{ m.volumeHoraire }}h</span>
                        <span class="stat-lbl">Volume horaire</span>
                      </div>
                    </div>
                    <div class="module-stat">
                      <mat-icon>star</mat-icon>
                      <div>
                        <span class="stat-val">{{ m.credits }}</span>
                        <span class="stat-lbl">Crédits</span>
                      </div>
                    </div>
                    <div class="module-stat">
                      <mat-icon>percent</mat-icon>
                      <div>
                        <span class="stat-val">{{ m.coefficient }}</span>
                        <span class="stat-lbl">Coefficient</span>
                      </div>
                    </div>
                    <div class="module-stat">
                      <mat-icon>menu_book</mat-icon>
                      <div>
                        <span class="stat-val">{{ m.nbCours }}</span>
                        <span class="stat-lbl">Séances</span>
                      </div>
                    </div>
                  </div>

                  <div class="cours-section">
                    <div class="cours-header">
                      <div>
                        <h5>Chapitres, TD et TP</h5>
                        <p>{{ m.cours?.length || 0 }} élément(s) rattaché(s)</p>
                      </div>
                    </div>
                    <div *ngIf="!m.cours?.length" class="mini-empty">Aucun cours rattaché</div>
                    <mat-list *ngIf="m.cours?.length">
                      <mat-list-item *ngFor="let c of m.cours">
                        <mat-icon matListItemIcon>article</mat-icon>
                        <div matListItemTitle>{{ c.titre }}</div>
                        <div matListItemLine>
                          {{ c.typeCours || 'Cours' }}
                          <span *ngIf="c.formateurNomComplet"> - {{ c.formateurNomComplet }}</span>
                          <span *ngIf="c.documentName"> - {{ c.documentName }}</span>
                          <a *ngIf="c.documentUrl" [href]="c.documentUrl" target="_blank" rel="noopener">Ouvrir</a>
                        </div>
                        <button mat-icon-button matListItemMeta color="warn"
                                *ngIf="auth.hasRole('ADMIN','RESPONSABLE_FORMATION')"
                                (click)="deleteCours(f.id, c.id)">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </mat-list-item>
                    </mat-list>

                    <form [formGroup]="coursForm" class="cours-form"
                          *ngIf="auth.hasRole('ADMIN','RESPONSABLE_FORMATION')">
                      <div class="cours-form-title">
                        <mat-icon>add_circle</mat-icon>
                        <span>Ajouter un chapitre, TD ou TP</span>
                      </div>
                      <mat-form-field appearance="outline">
                        <mat-label>Titre du cours</mat-label>
                        <input matInput formControlName="titre">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Type</mat-label>
                        <mat-select formControlName="typeCours">
                          <mat-option value="CHAPITRE">Chapitre</mat-option>
                          <mat-option value="TD">TD</mat-option>
                          <mat-option value="TP">TP</mat-option>
                        </mat-select>
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Formateur</mat-label>
                        <mat-select formControlName="formateurId">
                          <mat-option [value]="null">Non assigné</mat-option>
                          <mat-option *ngFor="let formateur of formateurs()" [value]="formateur.id">
                            {{ formateur.nomComplet }}
                          </mat-option>
                        </mat-select>
                      </mat-form-field>
                      <div class="file-field">
                        <button mat-stroked-button type="button" (click)="documentInput.click()">
                          <mat-icon>upload_file</mat-icon> Document
                        </button>
                        <input #documentInput type="file" hidden
                               accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                               (change)="onCoursDocumentSelected($event)">
                        <span>{{ selectedCoursDocument()?.name || 'Aucun fichier' }}</span>
                      </div>
                      <button mat-stroked-button color="primary"
                              type="button"
                              [disabled]="coursForm.invalid"
                              (click)="addCours(f.id, m.id)">
                        <mat-icon>add</mat-icon> Ajouter cours
                      </button>
                    </form>
                  </div>

                  <!-- Barre de progression volume horaire -->
                  <div class="module-progress" *ngIf="f.totalVolumeHoraire > 0">
                    <div class="progress-label">
                      <span>Part du volume horaire</span>
                      <span>{{ ((m.volumeHoraire / f.totalVolumeHoraire) * 100) | number:'1.0-0' }}%</span>
                    </div>
                    <mat-progress-bar mode="determinate" color="primary"
                      [value]="(m.volumeHoraire / f.totalVolumeHoraire) * 100">
                    </mat-progress-bar>
                  </div>
                </mat-card-content>

                <mat-card-actions *ngIf="auth.hasRole('ADMIN','RESPONSABLE_FORMATION')">
                  <button mat-button color="warn"
                          (click)="deleteModule(f.id, m.id)"
                          matTooltip="Supprimer ce module">
                    <mat-icon>delete</mat-icon> Supprimer
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>

          </div>
        </mat-tab>

        <!-- ─── ÉTUDIANTS ─── -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>people</mat-icon>&nbsp; Étudiants ({{ etudiants().length }})
          </ng-template>
          <div class="tab-content">
            <div *ngIf="etudiants().length === 0" class="empty-tab">
              <mat-icon>people</mat-icon><p>Aucun étudiant inscrit</p>
            </div>
            <table mat-table [dataSource]="etudiants()" *ngIf="etudiants().length > 0">
              <ng-container matColumnDef="nom">
                <th mat-header-cell *matHeaderCellDef>Nom</th>
                <td mat-cell *matCellDef="let e"><strong>{{ e.nomComplet }}</strong></td>
              </ng-container>
              <ng-container matColumnDef="ine">
                <th mat-header-cell *matHeaderCellDef>INE</th>
                <td mat-cell *matCellDef="let e"><code>{{ e.ine || '—' }}</code></td>
              </ng-container>
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let e">{{ e.email }}</td>
              </ng-container>
              <ng-container matColumnDef="genre">
                <th mat-header-cell *matHeaderCellDef>Genre</th>
                <td mat-cell *matCellDef="let e">
                  <mat-chip-set>
                    <mat-chip [color]="e.genre === 'M' ? 'primary' : 'accent'" selected>
                      {{ e.genre === 'M' ? 'Homme' : 'Femme' }}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let e">
                  <button mat-icon-button color="primary"
                          [routerLink]="['/etudiants', e.id]"
                          matTooltip="Voir le profil">
                    <mat-icon>visibility</mat-icon>
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['nom','ine','email','genre','actions']"></tr>
              <tr mat-row *matRowDef="let r; columns: ['nom','ine','email','genre','actions']"></tr>
            </table>
          </div>
        </mat-tab>

        <!-- ─── STATISTIQUES ─── -->
        <mat-tab *ngIf="stats() && auth.hasRole('ADMIN','ADMINISTRATIF','RESPONSABLE_FORMATION')">
          <ng-template mat-tab-label>
            <mat-icon>bar_chart</mat-icon>&nbsp; Statistiques
          </ng-template>
          <div class="tab-content stats-tab" *ngIf="stats() as s">
            <div class="stats-cards">
              <mat-card class="stat-card">
                <mat-card-content>
                  <p class="sc-label">Inscrits actifs</p>
                  <h2 class="sc-val">{{ s.nbInscrits }}</h2>
                </mat-card-content>
              </mat-card>
              <mat-card class="stat-card green">
                <mat-card-content>
                  <p class="sc-label">Diplômés</p>
                  <h2 class="sc-val">{{ s.nbDiplomes }}</h2>
                </mat-card-content>
              </mat-card>
              <mat-card class="stat-card red">
                <mat-card-content>
                  <p class="sc-label">Abandons</p>
                  <h2 class="sc-val">{{ s.nbAbandonnes }}</h2>
                </mat-card-content>
              </mat-card>
            </div>

            <mat-card style="border-radius:12px">
              <mat-card-content>
                <div class="stat-row">
                  <span class="stat-label">Taux de réussite</span>
                  <strong class="stat-pct">
                    {{ (s.nbInscrits + s.nbDiplomes) > 0
                       ? ((s.nbDiplomes / (s.nbInscrits + s.nbDiplomes)) * 100 | number:'1.0-0')
                       : 0 }}%
                  </strong>
                </div>
                <mat-progress-bar mode="determinate" color="accent"
                  [value]="(s.nbInscrits + s.nbDiplomes) > 0
                    ? (s.nbDiplomes / (s.nbInscrits + s.nbDiplomes)) * 100 : 0">
                </mat-progress-bar>

                <div class="stat-row" style="margin-top:20px">
                  <span class="stat-label">Répartition par genre</span>
                </div>
                <div class="genre-bars">
                  <div class="genre-item">
                    <span>Hommes ({{ s.nbHommes }})</span>
                    <mat-progress-bar mode="determinate" color="primary"
                      [value]="(s.nbHommes + s.nbFemmes) > 0
                        ? (s.nbHommes / (s.nbHommes + s.nbFemmes)) * 100 : 0">
                    </mat-progress-bar>
                    <span>{{ (s.nbHommes + s.nbFemmes) > 0
                      ? ((s.nbHommes / (s.nbHommes + s.nbFemmes)) * 100 | number:'1.0-0')
                      : 0 }}%</span>
                  </div>
                  <div class="genre-item">
                    <span>Femmes ({{ s.nbFemmes }})</span>
                    <mat-progress-bar mode="determinate" color="accent"
                      [value]="(s.nbHommes + s.nbFemmes) > 0
                        ? (s.nbFemmes / (s.nbHommes + s.nbFemmes)) * 100 : 0">
                    </mat-progress-bar>
                    <span>{{ (s.nbHommes + s.nbFemmes) > 0
                      ? ((s.nbFemmes / (s.nbHommes + s.nbFemmes)) * 100 | number:'1.0-0')
                      : 0 }}%</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

      </mat-tab-group>
    </ng-container>
  `,
  styles: [`
    .center-spinner { display:flex; justify-content:center; padding:80px; }
    .page-header { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
    .header-text { flex:1; }
    .header-text h2 { margin:0; font-size:22px; color:#1a237e; }
    .header-text p  { margin:4px 0 0; color:#666; font-size:14px; }

    .summary-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:16px; margin-bottom:16px; }
    .sum-card { border-radius:12px; }
    .sum-content { display:flex; align-items:center; gap:16px; }
    .sum-icon { width:48px; height:48px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .sum-icon mat-icon { color:white; }
    .sum-label { color:#666; font-size:12px; margin:0 0 4px; }
    .sum-content h3 { margin:0; font-size:28px; font-weight:700; color:#1a237e; }

    .tabs-card { border-radius:12px; background:white; box-shadow:0 2px 8px rgba(0,0,0,.08); }
    .tab-content { padding:16px; display:flex; flex-direction:column; gap:16px; }

    .action-card { border-radius:12px; background:#f8f9ff; border:1px solid #e8eaf6; }
    .inline-form { display:flex; gap:12px; align-items:flex-start; flex-wrap:wrap; padding:8px 0; }
    .flex1 { flex:1; min-width:100px; }
    .flex2 { flex:2; min-width:200px; }

    .modules-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .module-card {
      border-radius: 12px;
      border-top: 4px solid #3949ab;
    }

    .module-header { display:flex; align-items:center; gap:12px; }
    .module-number {
      width: 36px; height: 36px; border-radius: 50%;
      background: #1a237e; color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 16px; flex-shrink: 0;
    }
    .module-title h4 { margin:0; font-size:15px; color:#1a237e; }
    .module-badges {
      display:flex;
      flex-wrap:wrap;
      gap:8px;
      margin-top:8px;
    }
    .module-badges span {
      display:inline-flex;
      align-items:center;
      gap:4px;
      border-radius:999px;
      background:#eef2ff;
      color:#27327a;
      font-size:12px;
      font-weight:600;
      padding:4px 10px;
    }
    .module-badges mat-icon { font-size:16px; width:16px; height:16px; }

    .module-stats { display:none; }

    .module-progress { margin-top:10px; }
    .progress-label { display:flex; justify-content:space-between; font-size:12px; color:#666; margin-bottom:4px; }
    .cours-section {
      margin-top:14px;
      border:1px solid #e4e7f2;
      background:#fbfcff;
      border-radius:10px;
      padding:14px;
    }
    .cours-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; }
    .cours-section h5 { margin:0; color:#1a237e; font-size:15px; }
    .cours-header p { margin:3px 0 0; color:#777; font-size:12px; }
    .mini-empty {
      color:#777;
      background:white;
      border:1px dashed #ccd3ea;
      border-radius:8px;
      padding:12px;
      font-size:13px;
      margin-bottom:12px;
    }
    .cours-section mat-list {
      background:white;
      border:1px solid #edf0f7;
      border-radius:8px;
      padding:0;
      margin-bottom:12px;
    }
    .cours-section mat-list-item:not(:last-child) { border-bottom:1px solid #edf0f7; }
    .cours-form {
      display:grid;
      grid-template-columns: minmax(220px, 1.6fr) 150px minmax(200px, 1fr) auto;
      gap:10px;
      align-items:flex-start;
      background:white;
      border:1px solid #dfe4f4;
      border-radius:10px;
      padding:12px;
      margin-top:12px;
    }
    .cours-form-title {
      grid-column:1 / -1;
      display:flex;
      align-items:center;
      gap:6px;
      color:#1a237e;
      font-weight:700;
      font-size:13px;
      margin-bottom:2px;
    }
    .file-field { display:flex; gap:8px; align-items:center; }

    .empty-tab { text-align:center; padding:48px; color:#bbb; }
    .empty-tab mat-icon { font-size:48px; width:48px; height:48px; display:block; margin:0 auto 8px; }
    .empty-sub { font-size:13px; margin-top:4px; }

    table { width:100%; }
    code { background:#f0f0f0; padding:2px 6px; border-radius:4px; font-size:12px; }

    .stats-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
    .stat-card { border-radius:12px; border-top:4px solid #3949ab; }
    .stat-card.green { border-top-color:#2e7d32; }
    .stat-card.red { border-top-color:#c62828; }
    .sc-label { color:#666; font-size:13px; margin:0 0 4px; }
    .sc-val { font-size:36px; font-weight:700; margin:0; color:#1a237e; }
    .stats-tab .stat-row { display:flex; justify-content:space-between; margin-bottom:8px; font-size:14px; }
    .stat-label { font-weight:600; color:#444; }
    .stat-pct { font-weight:700; color:#1a237e; }
    .genre-bars { display:flex; flex-direction:column; gap:12px; }
    .genre-item { display:grid; grid-template-columns:130px 1fr 45px; align-items:center; gap:12px; font-size:13px; }

    @media(max-width:600px) {
      .modules-grid { grid-template-columns:1fr; }
      .cours-form { grid-template-columns:1fr; }
      .stats-cards { grid-template-columns:1fr; }
    }
  `]
})
export class FormationDetailComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private svc    = inject(FormationService);
  private etSvc  = inject(EtudiantService);
  private formateurSvc = inject(FormateurService);
  private fb     = inject(FormBuilder);
  private snack  = inject(MatSnackBar);
  auth           = inject(AuthService);

  formation    = signal<FormationDetail | null>(null);
  stats        = signal<FormationStats | null>(null);
  etudiants    = signal<EtudiantSummary[]>([]);
  formateurs    = signal<FormateurSummary[]>([]);
  selectedCoursDocument = signal<File | null>(null);
  loading      = signal(true);
  savingModule = signal(false);

  moduleForm = this.fb.group({
    intitule:      ['', Validators.required],
    volumeHoraire: [null as number | null, [Validators.required, Validators.min(1)]],
    credits:       [null as number | null, [Validators.required, Validators.min(0)]],
    coefficient:   [1 as number | null, [Validators.required, Validators.min(1)]]
  });
  coursForm = this.fb.group({
    titre: ['', Validators.required],
    typeCours: ['CHAPITRE'],
    formateurId: [null as string | null]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadFormateurs();
    this.svc.findById(id).subscribe({
      next: f  => { this.formation.set(f); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    if (this.auth.hasRole('ADMIN','ADMINISTRATIF','RESPONSABLE_FORMATION')) {
      this.svc.getStats(id).subscribe({ next: s => this.stats.set(s), error: () => {} });
    }
    this.etSvc.findByFormation(id, 0, 100).subscribe({
      next: res => this.etudiants.set(res.content), error: () => {}
    });
  }

  loadFormateurs(): void {
    this.formateurSvc.findAll('', 0, 1000).subscribe({
      next: res => this.formateurs.set(res.content),
      error: () => this.formateurs.set([])
    });
  }

  addModule(formationId: string): void {
    if (this.moduleForm.invalid) return;
    this.savingModule.set(true);
    const payload = {
      formationId,
      intitule:      this.moduleForm.value.intitule!,
      volumeHoraire: Number(this.moduleForm.value.volumeHoraire),
      credits:       Number(this.moduleForm.value.credits),
      coefficient:   Number(this.moduleForm.value.coefficient)
    };
    this.svc.createModule(payload).subscribe({
      next: () => {
        this.snack.open('Module ajouté !', 'OK', { duration: 3000 });
        this.savingModule.set(false);
        this.moduleForm.reset();
        this.svc.findById(formationId).subscribe(f => this.formation.set(f));
      },
      error: err => {
        this.snack.open(err.error?.message || 'Erreur', 'Fermer', { duration: 4000 });
        this.savingModule.set(false);
      }
    });
  }

  deleteModule(formationId: string, moduleId: string): void {
    this.svc.deleteModule(moduleId).subscribe({
      next: () => {
        this.snack.open('Module supprimé', 'OK', { duration: 3000 });
        this.svc.findById(formationId).subscribe(f => this.formation.set(f));
      },
      error: err => this.snack.open(err.error?.message || 'Erreur', 'Fermer', { duration: 4000 })
    });
  }

  addCours(formationId: string, moduleId: string): void {
    if (this.coursForm.invalid) return;

    this.svc.createCours({
      moduleId,
      titre: this.coursForm.value.titre!,
      typeCours: this.coursForm.value.typeCours ?? 'CHAPITRE',
      formateurId: this.coursForm.value.formateurId,
      document: this.selectedCoursDocument()
    }).subscribe({
      next: () => {
        this.snack.open('Cours ajouté', 'OK', { duration: 3000 });
        this.coursForm.reset({ typeCours: 'CHAPITRE', formateurId: null });
        this.selectedCoursDocument.set(null);
        this.svc.findById(formationId).subscribe(f => this.formation.set(f));
      },
      error: err => this.snack.open(err.error?.message || 'Erreur', 'Fermer', { duration: 4000 })
    });
  }

  onCoursDocumentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedCoursDocument.set(input.files?.[0] ?? null);
  }

  deleteCours(formationId: string, coursId: string): void {
    this.svc.deleteCours(coursId).subscribe({
      next: () => {
        this.snack.open('Cours supprimé', 'OK', { duration: 3000 });
        this.svc.findById(formationId).subscribe(f => this.formation.set(f));
      },
      error: err => this.snack.open(err.error?.message || 'Erreur', 'Fermer', { duration: 4000 })
    });
  }
}

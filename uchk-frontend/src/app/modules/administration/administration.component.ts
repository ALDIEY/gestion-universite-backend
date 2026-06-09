import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdministrationService, EtudiantService, FormationService } from '../../core/services/api.services';
import { FormateurService } from '../../core/services/formateur.service';
import { ExportService } from '../../core/services/export.service';
import { DocumentAdminResponse, BudgetSummary, PartenaireResponse, EtudiantSummary, FormateurSummary, FormationSummary, Role } from '../../shared/models/models';
import { debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-administration',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTabsModule, MatCardModule, MatIconModule, MatButtonModule,
    MatTableModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressBarModule, MatSnackBarModule
  ],
  template: `
    <div class="page-header">
      <h2>Administration</h2>
    </div>

    <mat-tab-group animationDuration="200ms">

      <!-- Documents -->
      <mat-tab>
        <ng-template mat-tab-label><mat-icon>folder</mat-icon>&nbsp; Documents</ng-template>
        <div class="tab-content">
          <mat-card class="form-card">
            <mat-card-content>
              <form [formGroup]="documentForm" class="quick-form" (ngSubmit)="createDocument()">
                <mat-form-field appearance="outline">
                  <mat-label>Titre / objet</mat-label>
                  <input matInput formControlName="titre">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Type document</mat-label>
                  <mat-select formControlName="typeDocument">
                    <mat-option value="COURRIER_ARRIVE">Courrier arrive</mat-option>
                    <mat-option value="COURRIER_DEPART">Courrier depart</mat-option>
                    <mat-option value="NOTE_SERVICE">Note de service</mat-option>
                    <mat-option value="NOTE_ADMINISTRATIVE">Note administrative</mat-option>
                    <mat-option value="CIRCULAIRE">Circulaire</mat-option>
                  </mat-select>
                </mat-form-field>
                <div class="file-field">
                  <button mat-stroked-button type="button" (click)="documentInput.click()">
                    <mat-icon>attach_file</mat-icon> Joindre document
                  </button>
                  <input #documentInput type="file" hidden
                         accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                         (change)="onDocumentSelected($event)">
                  <span>{{ selectedDocumentFile()?.name || 'Aucun fichier selectionne' }}</span>
                </div>
                <mat-form-field appearance="outline">
                  <mat-label>Acces par role</mat-label>
                  <mat-select formControlName="rolesAutorises" multiple>
                    <mat-option value="ADMIN">Admin</mat-option>
                    <mat-option value="ADMINISTRATIF">Administratif</mat-option>
                    <mat-option value="RESPONSABLE_FORMATION">Responsable formation</mat-option>
                    <mat-option value="ENSEIGNANT">Enseignant</mat-option>
                    <mat-option value="ENSEIGNANT_ASSOCIE">Enseignant associe</mat-option>
                    <mat-option value="TUTEUR">Tuteur</mat-option>
                    <mat-option value="APPUI_INSERTION">Appui insertion</mat-option>
                    <mat-option value="ETUDIANT">Etudiant</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" class="wide">
                  <mat-label>Description</mat-label>
                  <input matInput formControlName="description">
                </mat-form-field>
                <button mat-raised-button color="primary" type="submit" [disabled]="documentForm.invalid">
                  <mat-icon>add</mat-icon> Ajouter document
                </button>
              </form>
            </mat-card-content>
          </mat-card>

          <div class="tab-toolbar">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Rechercher un document</mat-label>
              <input matInput [formControl]="docSearch">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            <div class="export-actions">
              <button mat-stroked-button type="button" (click)="exportDocumentsCsv()"><mat-icon>table_view</mat-icon> CSV</button>
              <button mat-stroked-button type="button" (click)="exportDocumentsPdf()"><mat-icon>picture_as_pdf</mat-icon> PDF</button>
            </div>
          </div>
          <table mat-table [dataSource]="documents()" class="full-table">
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let d">
                <mat-chip-set>
                  <mat-chip color="primary" selected>{{ d.typeDoc }}</mat-chip>
                </mat-chip-set>
              </td>
            </ng-container>
            <ng-container matColumnDef="objet">
              <th mat-header-cell *matHeaderCellDef>Objet</th>
              <td mat-cell *matCellDef="let d"><strong>{{ d.objet }}</strong></td>
            </ng-container>
            <ng-container matColumnDef="reference">
              <th mat-header-cell *matHeaderCellDef>Référence</th>
              <td mat-cell *matCellDef="let d"><code>{{ d.reference || '—' }}</code></td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let d">{{ d.dateCreation | date:'dd/MM/yyyy' }}</td>
            </ng-container>
            <ng-container matColumnDef="statut">
              <th mat-header-cell *matHeaderCellDef>Statut</th>
              <td mat-cell *matCellDef="let d">
                <mat-chip-set>
                  <mat-chip
                    [color]="d.statut === 'PUBLIE' ? 'accent' : d.statut === 'ARCHIVE' ? 'warn' : ''"
                    selected>
                    {{ d.statut }}
                  </mat-chip>
                </mat-chip-set>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let d">
                <button mat-icon-button color="accent"
                        *ngIf="d.statut === 'BROUILLON'"
                        (click)="publier(d)" matTooltip="Publier">
                  <mat-icon>publish</mat-icon>
                </button>
                <button mat-icon-button color="warn"
                        *ngIf="d.statut !== 'ARCHIVE'"
                        (click)="archiver(d)" matTooltip="Archiver">
                  <mat-icon>archive</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="docColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: docColumns"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" [attr.colspan]="docColumns.length" style="text-align:center;padding:32px;color:#bbb">
                Aucun document trouvé
              </td>
            </tr>
          </table>
        </div>
      </mat-tab>

      <!-- Utilisateurs -->
      <mat-tab>
        <ng-template mat-tab-label><mat-icon>manage_accounts</mat-icon>&nbsp; Utilisateurs</ng-template>
        <div class="tab-content">
          <mat-card class="form-card">
            <mat-card-content>
              <form [formGroup]="userForm" class="quick-form" (ngSubmit)="createUser()">
                <mat-form-field appearance="outline">
                  <mat-label>Nom</mat-label>
                  <input matInput formControlName="nom">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Prenom</mat-label>
                  <input matInput formControlName="prenom">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Telephone</mat-label>
                  <input matInput formControlName="telephone">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Role / profil</mat-label>
                  <mat-select formControlName="role">
                    <mat-option value="ADMIN">Administrateur</mat-option>
                    <mat-option value="ADMINISTRATIF">Administratif</mat-option>
                    <mat-option value="RESPONSABLE_FORMATION">Responsable formation</mat-option>
                    <mat-option value="ENSEIGNANT">Enseignant</mat-option>
                    <mat-option value="ENSEIGNANT_ASSOCIE">Enseignant associe</mat-option>
                    <mat-option value="TUTEUR">Tuteur</mat-option>
                    <mat-option value="APPUI_INSERTION">Appui insertion</mat-option>
                    <mat-option value="ETUDIANT">Etudiant</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Mot de passe</mat-label>
                  <input matInput type="password" formControlName="motDePasse">
                </mat-form-field>

                <ng-container *ngIf="isEtudiantRole()">
                  <mat-form-field appearance="outline">
                    <mat-label>Date de naissance</mat-label>
                    <input matInput type="date" formControlName="dateNaissance">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Genre</mat-label>
                    <mat-select formControlName="genre">
                      <mat-option value="M">Homme</mat-option>
                      <mat-option value="F">Femme</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="wide">
                    <mat-label>Adresse</mat-label>
                    <input matInput formControlName="adresse">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Formation initiale</mat-label>
                    <mat-select formControlName="formationId">
                      <mat-option [value]="null">Aucune inscription immediate</mat-option>
                      <mat-option *ngFor="let formation of formations()" [value]="formation.id">
                        {{ formation.intitule }} - {{ formation.niveau }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Annee academique</mat-label>
                    <input matInput formControlName="anneeAcademique" placeholder="2025-2026">
                  </mat-form-field>
                </ng-container>

                <ng-container *ngIf="isFormateurRole()">
                  <mat-form-field appearance="outline">
                    <mat-label>Type de formateur</mat-label>
                    <mat-select formControlName="typeFormateur">
                      <mat-option value="ENSEIGNANT">Enseignant</mat-option>
                      <mat-option value="ENSEIGNANT_ASSOCIE">Enseignant associe</mat-option>
                      <mat-option value="RESPONSABLE_FORMATION">Responsable formation</mat-option>
                      <mat-option value="TUTEUR">Tuteur</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Specialite</mat-label>
                    <input matInput formControlName="specialite">
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="wide">
                    <mat-label>Biographie / dossier personnel</mat-label>
                    <input matInput formControlName="biographie">
                  </mat-form-field>
                </ng-container>

                <p class="wide hint">La creation est centralisee ici : un role etudiant cree le dossier etudiant, un role formateur cree le dossier personnel pedagogique.</p>
                <button mat-raised-button color="primary" type="submit" [disabled]="userForm.invalid">
                  <mat-icon>person_add</mat-icon> Creer le profil
                </button>
              </form>
              <div class="local-users" *ngIf="createdUsers().length">
                <h4>Comptes crees pendant cette session</h4>
                <div class="local-user" *ngFor="let u of createdUsers()">
                  <strong>{{ u.prenom }} {{ u.nom }}</strong>
                  <span>{{ u.email }} - {{ u.role }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-tab>

      <!-- Dossiers RH -->
      <mat-tab>
        <ng-template mat-tab-label><mat-icon>badge</mat-icon>&nbsp; Dossiers RH</ng-template>
        <div class="tab-content">
          <div class="rh-summary">
            <mat-card class="rh-stat-card">
              <mat-card-content><mat-icon>groups</mat-icon><span>Personnel formateur</span><strong>{{ formateurs().length }}</strong></mat-card-content>
            </mat-card>
            <mat-card class="rh-stat-card">
              <mat-card-content><mat-icon>co_present</mat-icon><span>Enseignants</span><strong>{{ countFormateurs('ENSEIGNANT') + countFormateurs('ENSEIGNANT_ASSOCIE') }}</strong></mat-card-content>
            </mat-card>
            <mat-card class="rh-stat-card">
              <mat-card-content><mat-icon>support_agent</mat-icon><span>Tuteurs</span><strong>{{ countFormateurs('TUTEUR') }}</strong></mat-card-content>
            </mat-card>
            <mat-card class="rh-stat-card">
              <mat-card-content><mat-icon>school</mat-icon><span>Dossiers etudiants</span><strong>{{ etudiants().length }}</strong></mat-card-content>
            </mat-card>
          </div>

          <div class="tab-toolbar">
            <div class="export-actions">
              <button mat-stroked-button type="button" (click)="exportPersonnelCsv()"><mat-icon>table_view</mat-icon> Personnel CSV</button>
              <button mat-stroked-button type="button" (click)="exportDossiersEtudiantsCsv()"><mat-icon>school</mat-icon> Etudiants CSV</button>
            </div>
          </div>

          <div class="rh-grid">
            <mat-card>
              <mat-card-header><mat-card-title>Dossier du personnel</mat-card-title></mat-card-header>
              <mat-card-content>
                <table mat-table [dataSource]="formateurs()" class="full-table">
                  <ng-container matColumnDef="nom">
                    <th mat-header-cell *matHeaderCellDef>Nom</th>
                    <td mat-cell *matCellDef="let f"><strong>{{ f.nomComplet }}</strong><br><small>{{ f.email }}</small></td>
                  </ng-container>
                  <ng-container matColumnDef="role">
                    <th mat-header-cell *matHeaderCellDef>Profil</th>
                    <td mat-cell *matCellDef="let f">{{ f.typeFormateur }}</td>
                  </ng-container>
                  <ng-container matColumnDef="specialite">
                    <th mat-header-cell *matHeaderCellDef>Specialite</th>
                    <td mat-cell *matCellDef="let f">{{ f.specialite || '-' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="statut">
                    <th mat-header-cell *matHeaderCellDef>Statut</th>
                    <td mat-cell *matCellDef="let f"><mat-chip-set><mat-chip selected>{{ f.actif ? 'Actif' : 'Inactif' }}</mat-chip></mat-chip-set></td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="personnelColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: personnelColumns"></tr>
                </table>
                <p class="empty-line" *ngIf="formateurs().length === 0">Aucun dossier personnel.</p>
              </mat-card-content>
            </mat-card>

            <mat-card>
              <mat-card-header><mat-card-title>Dossier des etudiants</mat-card-title></mat-card-header>
              <mat-card-content>
                <table mat-table [dataSource]="etudiants()" class="full-table">
                  <ng-container matColumnDef="nom">
                    <th mat-header-cell *matHeaderCellDef>Etudiant</th>
                    <td mat-cell *matCellDef="let e"><strong>{{ e.nomComplet }}</strong><br><small>{{ e.ine || '-' }}</small></td>
                  </ng-container>
                  <ng-container matColumnDef="email">
                    <th mat-header-cell *matHeaderCellDef>Email</th>
                    <td mat-cell *matCellDef="let e">{{ e.email }}</td>
                  </ng-container>
                  <ng-container matColumnDef="genre">
                    <th mat-header-cell *matHeaderCellDef>Genre</th>
                    <td mat-cell *matCellDef="let e">{{ e.genre || '-' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="statut">
                    <th mat-header-cell *matHeaderCellDef>Statut</th>
                    <td mat-cell *matCellDef="let e"><mat-chip-set><mat-chip selected>{{ e.actif ? 'Actif' : 'Inactif' }}</mat-chip></mat-chip-set></td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="dossierEtudiantColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: dossierEtudiantColumns"></tr>
                </table>
                <p class="empty-line" *ngIf="etudiants().length === 0">Aucun dossier etudiant.</p>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </mat-tab>

      <!-- Budget -->
      <mat-tab>
        <ng-template mat-tab-label><mat-icon>account_balance</mat-icon>&nbsp; Budget</ng-template>
        <div class="tab-content">
          <mat-card class="form-card">
            <mat-card-content>
              <form [formGroup]="budgetForm" class="quick-form" (ngSubmit)="createBudget()">
                <mat-form-field appearance="outline">
                  <mat-label>Annee</mat-label>
                  <input matInput formControlName="annee">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Budget prevu</mat-label>
                  <input matInput type="number" formControlName="montantPrevisionnel">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Budget realise</mat-label>
                  <input matInput type="number" formControlName="montantRealise">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Statut</mat-label>
                  <mat-select formControlName="statut">
                    <mat-option value="PREVU">Prevu</mat-option>
                    <mat-option value="REALISE">Realise</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" class="wide">
                  <mat-label>Note d'orientation</mat-label>
                  <input matInput formControlName="noteOrientation">
                </mat-form-field>
                <button mat-raised-button color="primary" type="submit" [disabled]="budgetForm.invalid">
                  <mat-icon>save</mat-icon> Enregistrer budget
                </button>
              </form>
            </mat-card-content>
          </mat-card>
        </div>
        <div class="tab-content" *ngIf="budget() as b">
          <div class="budget-summary">
            <mat-card class="budget-card">
              <mat-card-content>
                <p class="budget-label">Budget prévu</p>
                <h3 class="budget-value">{{ b.totalPrevu | number:'1.0-0' }} FCFA</h3>
              </mat-card-content>
            </mat-card>
            <mat-card class="budget-card">
              <mat-card-content>
                <p class="budget-label">Budget réalisé</p>
                <h3 class="budget-value" [style.color]="b.totalRealise > b.totalPrevu ? '#e53935' : '#2e7d32'">
                  {{ b.totalRealise | number:'1.0-0' }} FCFA
                </h3>
              </mat-card-content>
            </mat-card>
            <mat-card class="budget-card">
              <mat-card-content>
                <p class="budget-label">Écart</p>
                <h3 class="budget-value" [style.color]="b.ecart < 0 ? '#e53935' : '#2e7d32'">
                  {{ b.ecart | number:'1.0-0' }} FCFA
                </h3>
              </mat-card-content>
            </mat-card>
          </div>

          <mat-card style="border-radius:12px;margin-top:16px">
            <mat-card-content>
              <p class="budget-progress-label">Taux d'exécution</p>
              <mat-progress-bar mode="determinate"
                [value]="b.totalPrevu > 0 ? (b.totalRealise / b.totalPrevu) * 100 : 0"
                [color]="b.totalRealise > b.totalPrevu ? 'warn' : 'primary'">
              </mat-progress-bar>
              <p style="text-align:right;margin:4px 0 0;font-size:13px;color:#666">
                {{ b.totalPrevu > 0 ? ((b.totalRealise / b.totalPrevu) * 100 | number:'1.0-0') : 0 }}%
              </p>
            </mat-card-content>
          </mat-card>
        </div>
        <div *ngIf="!budget()" class="tab-content empty-state">
          <mat-icon>account_balance</mat-icon>
          <p>Aucun budget disponible pour cette année</p>
        </div>
      </mat-tab>

      <!-- Partenaires -->
      <mat-tab>
        <ng-template mat-tab-label><mat-icon>handshake</mat-icon>&nbsp; Partenaires</ng-template>
        <div class="tab-content">
          <mat-card class="form-card">
            <mat-card-content>
              <form [formGroup]="partenaireForm" class="quick-form" (ngSubmit)="createPartenaire()">
                <mat-form-field appearance="outline">
                  <mat-label>Nom</mat-label>
                  <input matInput formControlName="nom">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Domaine</mat-label>
                  <input matInput formControlName="domaine">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Contact</mat-label>
                  <input matInput formControlName="contact">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput formControlName="email">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Type</mat-label>
                  <mat-select formControlName="typePartenaire">
                    <mat-option value="ENTREPRISE">Entreprise</mat-option>
                    <mat-option value="ONG">ONG</mat-option>
                    <mat-option value="INSTITUTION">Institution</mat-option>
                    <mat-option value="UNIVERSITE">Universite</mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-raised-button color="primary" type="submit" [disabled]="partenaireForm.invalid">
                  <mat-icon>add_business</mat-icon> Ajouter partenaire
                </button>
              </form>
            </mat-card-content>
          </mat-card>

          <div class="tab-toolbar">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Rechercher un partenaire</mat-label>
              <input matInput [formControl]="partenaireSearch">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            <div class="export-actions">
              <button mat-stroked-button type="button" (click)="exportPartenairesCsv()"><mat-icon>table_view</mat-icon> CSV</button>
              <button mat-stroked-button type="button" (click)="exportPartenairesPdf()"><mat-icon>picture_as_pdf</mat-icon> PDF</button>
            </div>
          </div>
          <div class="partenaires-grid">
            <mat-card class="partenaire-card" *ngFor="let p of partenaires()">
              <mat-card-content>
                <div class="partenaire-header">
                  <mat-icon color="primary">business</mat-icon>
                  <div>
                    <h4>{{ p.nom }}</h4>
                    <p>{{ p.secteur }}</p>
                  </div>
                </div>
                <div class="partenaire-contact" *ngIf="p.contactNom">
                  <mat-icon inline>person</mat-icon> {{ p.contactNom }}
                  <span *ngIf="p.contactEmail"> — {{ p.contactEmail }}</span>
                </div>
                <mat-chip-set *ngIf="p.typePartenariat" style="margin-top:8px">
                  <mat-chip>{{ p.typePartenariat }}</mat-chip>
                </mat-chip-set>
              </mat-card-content>
            </mat-card>
            <div *ngIf="partenaires().length === 0" class="empty-state" style="grid-column:1/-1">
              <mat-icon>handshake</mat-icon><p>Aucun partenaire</p>
            </div>
          </div>
        </div>
      </mat-tab>

    </mat-tab-group>
  `,
  styles: [`
    .page-header { margin-bottom:24px; }
    .page-header h2 { margin:0; font-size:24px; color:#1a237e; }
    .tab-content { padding:16px 0; }
    .tab-toolbar { margin-bottom:16px; }
    .form-card { border-radius:12px; margin-bottom:16px; }
    .quick-form { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; align-items:start; }
    .wide { grid-column:span 2; }
    .hint { margin:0; color:#666; font-size:13px; }
    .file-field { display:flex; align-items:center; gap:10px; min-height:56px; color:#64748b; font-size:13px; flex-wrap:wrap; }
    .export-actions { display:flex; gap:8px; flex-wrap:wrap; }
    .local-users { margin-top:12px; display:grid; gap:8px; }
    .local-users h4 { margin:0; color:#1a237e; }
    .local-user { display:flex; justify-content:space-between; gap:12px; background:#f6f8ff; border-radius:8px; padding:8px; color:#555; }
    .search-field { width:100%; max-width:400px; }
    .full-table { width:100%; }
    .rh-summary { display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:14px; }
    .rh-stat-card mat-card-content { display:grid; gap:6px; min-height:120px; }
    .rh-stat-card mat-icon { width:34px; height:34px; font-size:34px; color:#1f3a8a; }
    .rh-stat-card span { color:#64748b; font-size:13px; }
    .rh-stat-card strong { color:#172033; font-size:32px; line-height:1; }
    .rh-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .empty-line { color:#64748b; text-align:center; padding:24px; margin:0; }
    code { background:#f0f0f0; padding:2px 6px; border-radius:4px; font-size:12px; }
    .budget-summary { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
    .budget-card { border-radius:12px; }
    .budget-label { color:#666; font-size:13px; margin:0 0 4px; }
    .budget-value { font-size:24px; font-weight:700; margin:0; color:#1a237e; }
    .budget-progress-label { font-weight:600; margin:0 0 8px; }
    .partenaires-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
    .partenaire-card { border-radius:12px; }
    .partenaire-header { display:flex; gap:12px; align-items:flex-start; margin-bottom:8px; }
    .partenaire-header h4 { margin:0 0 2px; font-size:15px; }
    .partenaire-header p  { margin:0; color:#666; font-size:13px; }
    .partenaire-contact { font-size:13px; color:#555; display:flex; align-items:center; gap:4px; }
    .empty-state { text-align:center; padding:64px; color:#bbb; }
    .empty-state mat-icon { font-size:56px; width:56px; height:56px; }
    .empty-state p { margin:8px 0 0; }
    @media(max-width:900px){ .quick-form { grid-template-columns:1fr; } .wide { grid-column:auto; } .rh-grid { grid-template-columns:1fr; } }
  `]
})
export class AdministrationComponent implements OnInit {
  private svc  = inject(AdministrationService);
  private etudiantSvc = inject(EtudiantService);
  private formateurSvc = inject(FormateurService);
  private formationSvc = inject(FormationService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  private exporter = inject(ExportService);

  documents  = signal<DocumentAdminResponse[]>([]);
  budget     = signal<BudgetSummary | null>(null);
  partenaires = signal<PartenaireResponse[]>([]);
  etudiants = signal<EtudiantSummary[]>([]);
  formateurs = signal<FormateurSummary[]>([]);
  formations = signal<FormationSummary[]>([]);
  selectedDocumentFile = signal<File | null>(null);
  createdUsers = signal<Array<{ nom: string; prenom: string; email: string; role: string }>>([]);

  docColumns      = ['type','objet','reference','date','statut','actions'];
  personnelColumns = ['nom', 'role', 'specialite', 'statut'];
  dossierEtudiantColumns = ['nom', 'email', 'genre', 'statut'];
  docSearch       = new FormControl('');
  partenaireSearch = new FormControl('');
  documentForm = this.fb.group({
    titre: ['', Validators.required],
    typeDocument: ['COURRIER_ARRIVE', Validators.required],
    fichierUrl: [''],
    rolesAutorises: [[] as string[]],
    description: [''],
    statut: ['BROUILLON']
  });
  userForm = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
    role: ['ADMINISTRATIF', Validators.required],
    motDePasse: ['', Validators.required],
    dateNaissance: [''],
    genre: [''],
    adresse: [''],
    formationId: [null as string | null],
    anneeAcademique: [''],
    typeFormateur: ['ENSEIGNANT'],
    specialite: [''],
    biographie: ['']
  });
  budgetForm = this.fb.group({
    annee: [String(new Date().getFullYear()), Validators.required],
    montantPrevisionnel: [0, Validators.required],
    montantRealise: [0],
    noteOrientation: [''],
    statut: ['PREVU']
  });
  partenaireForm = this.fb.group({
    nom: ['', Validators.required],
    domaine: [''],
    contact: [''],
    email: [''],
    telephone: [''],
    adresse: [''],
    typePartenaire: ['ENTREPRISE'],
    actif: [true]
  });

  ngOnInit(): void {
    this.loadDocuments();
    this.loadBudget();
    this.loadPartenaires();
    this.loadDossiers();
    this.loadFormations();

    this.docSearch.valueChanges.pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => this.loadDocuments());

    this.partenaireSearch.valueChanges.pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => this.loadPartenaires());
  }

  loadDocuments(): void {
    this.svc.searchDocuments(this.docSearch.value ?? '').subscribe({
      next: r => this.documents.set(r.content), error: () => {}
    });
  }

  loadBudget(): void {
    const annee = new Date().getFullYear();
    this.svc.getBudgetSummary(annee).subscribe({
      next: b => this.budget.set(b), error: () => {}
    });
  }

  loadPartenaires(): void {
    this.svc.searchPartenaires(this.partenaireSearch.value ?? '').subscribe({
      next: r => this.partenaires.set(r.content), error: () => {}
    });
  }

  loadDossiers(): void {
    this.etudiantSvc.search('', 0, 1000).subscribe({
      next: r => this.etudiants.set(r.content),
      error: () => this.etudiants.set([])
    });
    this.formateurSvc.findAll('', 0, 1000).subscribe({
      next: r => this.formateurs.set(r.content),
      error: () => this.formateurs.set([])
    });
  }

  loadFormations(): void {
    this.formationSvc.findAll(0, 1000).subscribe({
      next: r => this.formations.set(r.content),
      error: () => this.formations.set([])
    });
  }

  publier(d: DocumentAdminResponse): void {
    this.svc.publierDocument(d.id).subscribe({
      next: updated => { Object.assign(d, updated); this.snack.open('Document publié', 'OK', { duration: 3000 }); }
    });
  }

  archiver(d: DocumentAdminResponse): void {
    this.svc.archiverDocument(d.id).subscribe({
      next: updated => { Object.assign(d, updated); this.snack.open('Document archivé', 'OK', { duration: 3000 }); }
    });
  }

  createDocument(): void {
    if (this.documentForm.invalid) return;
    const payload = {
      ...this.documentForm.getRawValue(),
      fichierUrl: this.selectedDocumentFile()?.name || this.documentForm.value.fichierUrl || ''
    };
    this.svc.createDocument(payload).subscribe({
      next: doc => {
        this.documents.update(items => [doc, ...items]);
        this.documentForm.reset({ typeDocument: 'COURRIER_ARRIVE', statut: 'BROUILLON' });
        this.selectedDocumentFile.set(null);
        this.snack.open('Document ajoute', 'OK', { duration: 2500 });
      },
      error: err => this.snack.open(err.error?.message || 'Creation document impossible', 'Fermer', { duration: 4000 })
    });
  }

  onDocumentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedDocumentFile.set(file);
    this.documentForm.patchValue({ fichierUrl: file?.name ?? '' });
  }

  createUser(): void {
    if (this.userForm.invalid) return;
    const value = this.userForm.getRawValue();
    const role = value.role as Role;
    const common = {
      nom: value.nom ?? '',
      prenom: value.prenom ?? '',
      email: value.email ?? '',
      telephone: value.telephone ?? undefined,
      motDePasse: value.motDePasse ?? ''
    };
    const request: any = this.isEtudiantRole(role)
      ? this.etudiantSvc.create({
          ...common,
          dateNaissance: value.dateNaissance ?? undefined,
          genre: value.genre ?? undefined,
          adresse: value.adresse ?? undefined
        }).pipe(
          switchMap(etudiant => value.formationId
            ? this.etudiantSvc.inscrire(etudiant.id, {
                formationId: value.formationId,
                anneeAcademique: value.anneeAcademique ?? '',
                statut: 'EN_COURS'
              }).pipe(map(() => etudiant))
            : of(etudiant))
        )
      : this.isFormateurRole(role)
        ? this.formateurSvc.create({
            ...common,
            typeFormateur: (value.typeFormateur || role) as any,
            specialite: value.specialite ?? undefined,
            biographie: value.biographie ?? undefined
          })
        : this.svc.createUser({ ...common, role });

    request.subscribe({
      next: () => {
        this.createdUsers.update(items => [{
          nom: value.nom ?? '',
          prenom: value.prenom ?? '',
          email: value.email ?? '',
          role: value.role ?? ''
        }, ...items]);
        this.userForm.reset({ role: 'ADMINISTRATIF', typeFormateur: 'ENSEIGNANT', formationId: null });
        this.loadDossiers();
        this.snack.open('Profil utilisateur cree', 'OK', { duration: 3000 });
      },
      error: (err: any) => this.snack.open(err.error?.message || 'Creation du profil impossible', 'Fermer', { duration: 4000 })
    });
  }

  createBudget(): void {
    if (this.budgetForm.invalid) return;
    this.svc.createBudget(this.budgetForm.getRawValue()).subscribe({
      next: () => {
        this.loadBudget();
        this.snack.open('Budget enregistre', 'OK', { duration: 2500 });
      },
      error: err => this.snack.open(err.error?.message || 'Creation budget impossible', 'Fermer', { duration: 4000 })
    });
  }

  createPartenaire(): void {
    if (this.partenaireForm.invalid) return;
    this.svc.createPartenaire(this.partenaireForm.getRawValue()).subscribe({
      next: partenaire => {
        this.partenaires.update(items => [partenaire, ...items]);
        this.partenaireForm.reset({ typePartenaire: 'ENTREPRISE', actif: true });
        this.snack.open('Partenaire ajoute', 'OK', { duration: 2500 });
      },
      error: err => this.snack.open(err.error?.message || 'Creation partenaire impossible', 'Fermer', { duration: 4000 })
    });
  }

  exportDocumentsCsv(): void {
    this.exporter.csv('documents', this.documentRows());
  }

  exportDocumentsPdf(): void {
    this.exporter.print('Documents administratifs', this.documentRows());
  }

  exportPartenairesCsv(): void {
    this.exporter.csv('partenaires', this.partenaireRows());
  }

  exportPartenairesPdf(): void {
    this.exporter.print('Partenaires', this.partenaireRows());
  }

  exportPersonnelCsv(): void {
    this.exporter.csv('dossiers-personnel', this.personnelRows());
  }

  exportDossiersEtudiantsCsv(): void {
    this.exporter.csv('dossiers-etudiants', this.etudiantRows());
  }

  countFormateurs(type: string): number {
    return this.formateurs().filter(f => String(f.typeFormateur) === type).length;
  }

  isEtudiantRole(role = this.userForm.value.role as Role | null): boolean {
    return role === 'ETUDIANT';
  }

  isFormateurRole(role = this.userForm.value.role as Role | null): boolean {
    return ['ENSEIGNANT', 'ENSEIGNANT_ASSOCIE', 'RESPONSABLE_FORMATION', 'TUTEUR'].includes(String(role));
  }

  private documentRows(): Array<Record<string, unknown>> {
    return this.documents().map(d => ({
      Type: d.typeDoc,
      Objet: d.objet,
      Reference: d.reference,
      Date: d.dateCreation,
      Statut: d.statut,
      Auteur: d.auteurNom
    }));
  }

  private partenaireRows(): Array<Record<string, unknown>> {
    return this.partenaires().map(p => ({
      Nom: p.nom,
      Domaine: p.secteur,
      Contact: p.contactNom,
      Email: p.contactEmail,
      Type: p.typePartenariat,
      Actif: p.actif !== false ? 'Oui' : 'Non'
    }));
  }

  private personnelRows(): Array<Record<string, unknown>> {
    return this.formateurs().map(f => ({
      Nom: f.nomComplet,
      Email: f.email,
      Profil: f.typeFormateur,
      Specialite: f.specialite,
      Statut: f.actif ? 'Actif' : 'Inactif'
    }));
  }

  private etudiantRows(): Array<Record<string, unknown>> {
    return this.etudiants().map(e => ({
      Etudiant: e.nomComplet,
      INE: e.ine,
      Email: e.email,
      Genre: e.genre,
      Statut: e.actif ? 'Actif' : 'Inactif'
    }));
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormateurService } from '../../../core/services/formateur.service';
import { FormationService } from '../../../core/services/api.services';
import { FormationSummary, ModuleResponse } from '../../../shared/models/models';

@Component({
  selector: 'app-formateur-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatDividerModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-header">
      <button mat-icon-button [routerLink]="['/formateurs']">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <h2>Nouveau formateur</h2>
    </div>

    <mat-card class="form-card">
      <mat-card-header>
        <mat-icon mat-card-avatar>person_add</mat-icon>
        <mat-card-title>Informations du formateur</mat-card-title>
      </mat-card-header>
      <mat-divider></mat-divider>

      <mat-card-content>
        <form [formGroup]="form" class="form-grid">

          <mat-form-field appearance="outline">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="nom">
            <mat-error>Nom requis</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Prénom</mat-label>
            <input matInput formControlName="prenom">
            <mat-error>Prénom requis</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email">
            <mat-icon matSuffix>email</mat-icon>
            <mat-error>Email valide requis</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Mot de passe</mat-label>
            <input matInput type="password" formControlName="motDePasse">
            <mat-error>8 caractères minimum</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Type de formateur</mat-label>
            <mat-select formControlName="typeFormateur">
              <mat-option value="ENSEIGNANT">Enseignant</mat-option>
              <mat-option value="ENSEIGNANT_ASSOCIE">Enseignant Associé</mat-option>
              <mat-option value="RESPONSABLE_FORMATION">Responsable de Formation</mat-option>
              <mat-option value="TUTEUR">Tuteur</mat-option>
            </mat-select>
            <mat-error>Type requis</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Spécialité</mat-label>
            <input matInput formControlName="specialite"
                   placeholder="ex: Génie Logiciel, Réseaux...">
            <mat-icon matSuffix>science</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-col">
            <mat-label>Formations associées</mat-label>
            <mat-select formControlName="formationIds" multiple>
              <mat-option *ngFor="let formation of formations()" [value]="formation.id">
                {{ formation.intitule }} — {{ formation.niveau }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-col">
            <mat-label>Modules associés</mat-label>
            <mat-select formControlName="moduleIds" multiple>
              <mat-option *ngFor="let module of modules()" [value]="module.id">
                {{ module.intitule }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-col">
            <mat-label>Biographie (optionnel)</mat-label>
            <textarea matInput formControlName="biographie" rows="3"
                      placeholder="Parcours académique, expériences..."></textarea>
          </mat-form-field>

        </form>
      </mat-card-content>

      <mat-divider></mat-divider>
      <mat-card-actions align="end">
        <button mat-stroked-button type="button" [routerLink]="['/formateurs']">
          Annuler
        </button>
        <button mat-raised-button color="primary"
                (click)="onSubmit()"
                [disabled]="form.invalid || saving()">
          <mat-spinner *ngIf="saving()" diameter="20"></mat-spinner>
          <mat-icon *ngIf="!saving()">save</mat-icon>
          <span>{{ saving() ? 'Enregistrement...' : 'Créer le formateur' }}</span>
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .page-header { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
    .page-header h2 { margin:0; font-size:22px; color:#1a237e; }
    .form-card { border-radius:12px; max-width:800px; }
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; padding:16px 0; }
    .full-col { grid-column:1/-1; }
    @media(max-width:600px) { .form-grid { grid-template-columns:1fr; } }
  `]
})
export class FormateurFormComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private svc    = inject(FormateurService);
  private formationSvc = inject(FormationService);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  saving = signal(false);
  formations = signal<FormationSummary[]>([]);
  modules = signal<ModuleResponse[]>([]);

  form = this.fb.group({
    nom:            ['', Validators.required],
    prenom:         ['', Validators.required],
    email:          ['', [Validators.required, Validators.email]],
    motDePasse:     ['', [Validators.required, Validators.minLength(8)]],
    typeFormateur:  ['', Validators.required],
    specialite:     [''],
    formationIds:   [[] as string[]],
    moduleIds:      [[] as string[]],
    biographie:     ['']
  });

  ngOnInit(): void {
    this.formationSvc.findAll(0, 1000).subscribe({
      next: res => {
        this.formations.set(res.content);
        this.loadModules(res.content);
      },
      error: () => this.formations.set([])
    });
  }

  private loadModules(formations: FormationSummary[]): void {
    const modules: ModuleResponse[] = [];
    formations.forEach(formation => {
      this.formationSvc.findModules(formation.id).subscribe({
        next: res => this.modules.set([...this.modules(), ...res]),
        error: () => {}
      });
    });
    this.modules.set(modules);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);

    this.svc.create(this.form.value as any).subscribe({
      next: () => {
        this.snack.open('Formateur créé avec succès', 'OK', { duration: 3000 });
        this.router.navigate(['/formateurs']);
      },
      error: err => {
        this.snack.open(err.error?.message || 'Erreur', 'Fermer', { duration: 4000 });
        this.saving.set(false);
      }
    });
  }
}

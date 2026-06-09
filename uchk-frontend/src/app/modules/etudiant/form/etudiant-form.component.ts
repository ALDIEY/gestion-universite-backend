import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { EtudiantService, FormationService } from '../../../core/services/api.services';
import { FormationSummary } from '../../../shared/models/models';

@Component({
  selector: 'app-etudiant-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatDatepickerModule, MatNativeDateModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatDividerModule
  ],
  template: `
    <div class="page-header">
      <button mat-icon-button [routerLink]="['/etudiants']">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <h2>{{ isEdit ? 'Modifier l\'étudiant' : 'Nouvel étudiant' }}</h2>
    </div>

    <mat-card class="form-card">
      <mat-card-header>
        <mat-icon mat-card-avatar>person_add</mat-icon>
        <mat-card-title>Informations personnelles</mat-card-title>
      </mat-card-header>
      <mat-divider></mat-divider>

      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">

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

          <mat-form-field appearance="outline" *ngIf="!isEdit">
            <mat-label>Mot de passe</mat-label>
            <input matInput type="password" formControlName="motDePasse">
            <mat-error>8 caractères minimum</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Genre</mat-label>
            <mat-select formControlName="genre">
              <mat-option value="M">Masculin</mat-option>
              <mat-option value="F">Féminin</mat-option>
              <mat-option value="AUTRE">Autre</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Formation</mat-label>
            <mat-select formControlName="formationId">
              <mat-option [value]="null">Aucune formation</mat-option>
              <mat-option *ngFor="let formation of formations()" [value]="formation.id">
                {{ formation.intitule }} — {{ formation.niveau }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Date de naissance</mat-label>
            <input matInput [matDatepicker]="dp" formControlName="dateNaissance">
            <mat-datepicker-toggle matIconSuffix [for]="dp"></mat-datepicker-toggle>
            <mat-datepicker #dp></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Téléphone</mat-label>
            <input matInput formControlName="telephone" placeholder="+221 77 000 0000">
            <mat-icon matSuffix>phone</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-col">
            <mat-label>Adresse</mat-label>
            <textarea matInput formControlName="adresse" rows="2"></textarea>
          </mat-form-field>

        </form>
      </mat-card-content>

      <mat-divider></mat-divider>
      <mat-card-actions align="end">
        <button mat-stroked-button type="button" [routerLink]="['/etudiants']">
          Annuler
        </button>
        <button mat-raised-button color="primary"
                (click)="onSubmit()"
                [disabled]="form.invalid || saving()">
          <mat-spinner *ngIf="saving()" diameter="20"></mat-spinner>
          <span *ngIf="!saving()">
            <mat-icon>save</mat-icon>
            {{ isEdit ? 'Enregistrer' : 'Créer l\'étudiant' }}
          </span>
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .page-header { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
    .page-header h2 { margin:0; font-size:22px; color:#1a237e; }
    .form-card { border-radius:12px; max-width:800px; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      padding: 16px 0;
    }
    .full-col { grid-column: 1 / -1; }
    @media (max-width:600px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class EtudiantFormComponent implements OnInit {
  private fb    = inject(FormBuilder);
  private svc   = inject(EtudiantService);
  private formationSvc = inject(FormationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  isEdit = false;
  saving = signal(false);
  formations = signal<FormationSummary[]>([]);

  form = this.fb.group({
    nom:           ['', Validators.required],
    prenom:        ['', Validators.required],
    email:         ['', [Validators.required, Validators.email]],
    motDePasse:    ['', [Validators.minLength(8)]],
    genre:         [''],
    formationId:   [null as string | null],
    dateNaissance: [null as Date | null],
    telephone:     [''],
    adresse:       ['']
  });

  ngOnInit(): void {
    this.loadFormations();

    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;

    if (this.isEdit && id) {
      this.form.get('motDePasse')?.clearValidators();
      this.form.get('motDePasse')?.updateValueAndValidity();
      this.svc.findById(id).subscribe(e => {
        this.form.patchValue({
          nom: e.nom, prenom: e.prenom, email: e.email,
          genre: e.genre,
          formationId: (e as any).formationId ? String((e as any).formationId) : null,
          dateNaissance: e.dateNaissance ? new Date(e.dateNaissance) : null,
          telephone: e.telephone, adresse: e.adresse
        });
      });
    } else {
      this.form.get('motDePasse')?.setValidators([Validators.required, Validators.minLength(8)]);
    }
  }

  private loadFormations(): void {
    this.formationSvc.findAll(0, 1000).subscribe({
      next: res => this.formations.set(res.content),
      error: () => this.formations.set([])
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);

    const id = this.route.snapshot.paramMap.get('id');
    const payload: any = { ...this.form.value };

    if (payload.dateNaissance instanceof Date) {
      payload.dateNaissance = payload.dateNaissance.toISOString().split('T')[0];
    }

    const obs = this.isEdit && id
      ? this.svc.update(id, payload)
      : this.svc.create(payload);

    obs.subscribe({
      next: () => {
        this.snack.open(
          this.isEdit ? 'Étudiant mis à jour' : 'Étudiant créé avec succès',
          'OK', { duration: 3000 }
        );
        this.router.navigate(['/etudiants']);
      },
      error: err => {
        this.saving.set(false);
        this.snack.open(err.error?.message || 'Une erreur est survenue', 'Fermer', { duration: 4000 });
      }
    });
  }
}

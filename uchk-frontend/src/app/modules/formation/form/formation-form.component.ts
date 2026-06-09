// ─── formation-form.component.ts ─────────────────────────────────────────────
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormationService } from '../../../core/services/api.services';

export { };

@Component({
  selector: 'app-formation-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatSnackBarModule, MatDividerModule, MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <div class="page-header">
      <button mat-icon-button [routerLink]="['/formations']"><mat-icon>arrow_back</mat-icon></button>
      <h2>Nouvelle formation</h2>
    </div>
    <mat-card class="form-card">
      <mat-card-header>
        <mat-icon mat-card-avatar>menu_book</mat-icon>
        <mat-card-title>Informations de la formation</mat-card-title>
      </mat-card-header>
      <mat-divider></mat-divider>
      <mat-card-content>
        <form [formGroup]="form" class="form-grid">
          <mat-form-field appearance="outline" class="full-col">
            <mat-label>Intitulé</mat-label>
            <input matInput formControlName="intitule">
            <mat-error>Intitulé requis</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Niveau</mat-label>
            <input matInput formControlName="niveau" placeholder="ex: Licence 3, Master 1">
            <mat-error>Niveau requis</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Type de formation</mat-label>
            <mat-select formControlName="typeFormation">
              <mat-option value="INITIALE">Initiale</mat-option>
              <mat-option value="CONTINUE">Continue</mat-option>
              <mat-option value="CERTIFICATION">Certification</mat-option>
              <mat-option value="PRIVEE">Privée</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Date de début</mat-label>
            <input matInput [matDatepicker]="dp1" formControlName="dateDebut">
            <mat-datepicker-toggle matIconSuffix [for]="dp1"></mat-datepicker-toggle>
            <mat-datepicker #dp1></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Date de fin</mat-label>
            <input matInput [matDatepicker]="dp2" formControlName="dateFin">
            <mat-datepicker-toggle matIconSuffix [for]="dp2"></mat-datepicker-toggle>
            <mat-datepicker #dp2></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Nombre de places</mat-label>
            <input matInput type="number" formControlName="nbPlaces">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Financement</mat-label>
            <mat-select formControlName="typeFinancement">
              <mat-option value="PUBLIC">Public</mat-option>
              <mat-option value="PRIVE">Privé</mat-option>
              <mat-option value="MIXTE">Mixte</mat-option>
              <mat-option value="BOURSE">Bourse</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Montant (FCFA)</mat-label>
            <input matInput type="number" formControlName="montant">
          </mat-form-field>
        </form>
      </mat-card-content>
      <mat-divider></mat-divider>
      <mat-card-actions align="end">
        <button mat-stroked-button [routerLink]="['/formations']">Annuler</button>
        <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="form.invalid">
          <mat-icon>save</mat-icon> Créer la formation
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`.page-header{display:flex;align-items:center;gap:12px;margin-bottom:20px;} .page-header h2{margin:0;font-size:22px;color:#1a237e;} .form-card{border-radius:12px;max-width:800px;} .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:16px 0;} .full-col{grid-column:1/-1;}`]
})
export class FormationFormComponent {
  private fb    = inject(FormBuilder);
  private svc   = inject(FormationService);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  form = this.fb.group({
    intitule:        ['', Validators.required],
    niveau:          ['', Validators.required],
    typeFormation:   [null],
    dateDebut:       [null],
    dateFin:         [null],
    nbPlaces:        [null],
    typeFinancement: [null],
    montant:         [null]
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    const val: any = { ...this.form.value };
    if (val.dateDebut instanceof Date) val.dateDebut = val.dateDebut.toISOString().split('T')[0];
    if (val.dateFin   instanceof Date) val.dateFin   = val.dateFin.toISOString().split('T')[0];
    this.svc.create(val).subscribe({
      next: () => { this.snack.open('Formation créée', 'OK', { duration: 3000 }); this.router.navigate(['/formations']); },
      error: err => this.snack.open(err.error?.message || 'Erreur', 'Fermer', { duration: 4000 })
    });
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdministrationService, EtudiantService } from '../../core/services/api.services';
import { FormateurService } from '../../core/services/formateur.service';
import { ExportService } from '../../core/services/export.service';
import { EtudiantSummary, FormateurSummary, PartenaireResponse, StageResponse } from '../../shared/models/models';

@Component({
  selector: 'app-appui-insertion',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatTableModule, MatChipsModule, MatSnackBarModule
  ],
  template: `
    <div class="page-head">
      <div>
        <h2>Appui a l'insertion</h2>
        <p>Suivi des stages, partenaires et insertion professionnelle</p>
      </div>
      <div class="export-actions">
        <button mat-stroked-button type="button" (click)="exportStagesCsv()"><mat-icon>table_view</mat-icon> Stages CSV</button>
        <button mat-stroked-button type="button" (click)="exportStagesPdf()"><mat-icon>picture_as_pdf</mat-icon> Stages PDF</button>
        <button mat-stroked-button type="button" (click)="exportPartenairesCsv()"><mat-icon>handshake</mat-icon> Partenaires CSV</button>
        <button mat-stroked-button type="button" (click)="exportContactsCsv()"><mat-icon>contacts</mat-icon> Contacts CSV</button>
      </div>
    </div>

    <div class="stats">
      <mat-card><mat-card-content><span>Contacts etudiants</span><strong>{{ etudiants().length }}</strong></mat-card-content></mat-card>
      <mat-card><mat-card-content><span>Stages</span><strong>{{ stages().length }}</strong></mat-card-content></mat-card>
      <mat-card><mat-card-content><span>Stages en cours</span><strong>{{ countByStatut('EN_COURS') }}</strong></mat-card-content></mat-card>
      <mat-card><mat-card-content><span>Stages termines</span><strong>{{ countByStatut('TERMINE') }}</strong></mat-card-content></mat-card>
      <mat-card><mat-card-content><span>Partenaires actifs</span><strong>{{ partenairesActifs() }}</strong></mat-card-content></mat-card>
      <mat-card><mat-card-content><span>Sortants auto-emploi</span><strong>{{ countAutoEmploi() }}</strong></mat-card-content></mat-card>
      <mat-card><mat-card-content><span>Sortants emploi salarie</span><strong>{{ countEmploiSalarie() }}</strong></mat-card-content></mat-card>
    </div>

    <div class="layout">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Nouveau stage</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="stageForm" class="form" (ngSubmit)="createStage()">
            <mat-form-field appearance="outline">
              <mat-label>Sujet</mat-label>
              <input matInput formControlName="sujet">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Etudiant</mat-label>
              <mat-select formControlName="etudiantId">
                <mat-option *ngFor="let e of etudiants()" [value]="e.id">{{ e.nomComplet }} - {{ e.ine }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Partenaire</mat-label>
              <mat-select formControlName="partenaireId">
                <mat-option [value]="null">Non renseigne</mat-option>
                <mat-option *ngFor="let p of partenaires()" [value]="p.id">{{ p.nom }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Encadrant academique</mat-label>
              <mat-select formControlName="encadrantAcademiqueId">
                <mat-option [value]="null">Non assigne</mat-option>
                <mat-option *ngFor="let f of formateurs()" [value]="f.id">{{ f.nomComplet }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Type</mat-label>
              <mat-select formControlName="typeStage">
                <mat-option value="ACADEMIQUE">Academique</mat-option>
                <mat-option value="PROFESSIONNEL">Professionnel</mat-option>
                <mat-option value="PRE_EMPLOI">Pre-emploi</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Statut</mat-label>
              <mat-select formControlName="statut">
                <mat-option value="EN_COURS">En cours</mat-option>
                <mat-option value="TERMINE">Termine</mat-option>
                <mat-option value="ABANDONNE">Abandonne</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Date debut</mat-label>
              <input matInput type="date" formControlName="dateDebut">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Date fin</mat-label>
              <input matInput type="date" formControlName="dateFin">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Note finale</mat-label>
              <input matInput type="number" formControlName="noteFinale">
            </mat-form-field>
            <mat-form-field appearance="outline" class="wide">
              <mat-label>Appreciation / bilan</mat-label>
              <textarea matInput rows="3" formControlName="appreciation"></textarea>
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" [disabled]="stageForm.invalid">
              <mat-icon>add</mat-icon> Enregistrer le stage
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Nouveau partenaire</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="partenaireForm" class="form" (ngSubmit)="createPartenaire()">
            <mat-form-field appearance="outline">
              <mat-label>Nom</mat-label>
              <input matInput formControlName="nom">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Domaine</mat-label>
              <input matInput formControlName="domaine">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Type partenaire</mat-label>
              <mat-select formControlName="typePartenaire">
                <mat-option value="ENTREPRISE">Entreprise</mat-option>
                <mat-option value="ONG">ONG</mat-option>
                <mat-option value="INSTITUTION">Institution</mat-option>
                <mat-option value="UNIVERSITE">Universite</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Contact</mat-label>
              <input matInput formControlName="contact">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Telephone</mat-label>
              <input matInput formControlName="telephone">
            </mat-form-field>
            <mat-form-field appearance="outline" class="wide">
              <mat-label>Adresse</mat-label>
              <input matInput formControlName="adresse">
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" [disabled]="partenaireForm.invalid">
              <mat-icon>business</mat-icon> Enregistrer le partenaire
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>

    <mat-card class="table-card">
      <mat-card-header><mat-card-title>Registre de contact des etudiants</mat-card-title></mat-card-header>
      <mat-card-content>
        <table mat-table [dataSource]="etudiants()" class="full-table">
          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef>Etudiant</th>
            <td mat-cell *matCellDef="let e"><strong>{{ e.nomComplet }}</strong><br><small>{{ e.ine || 'INE genere apres inscription' }}</small></td>
          </ng-container>
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let e">{{ e.email || '-' }}</td>
          </ng-container>
          <ng-container matColumnDef="genre">
            <th mat-header-cell *matHeaderCellDef>Genre</th>
            <td mat-cell *matCellDef="let e">{{ e.genre || '-' }}</td>
          </ng-container>
          <ng-container matColumnDef="statut">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let e"><mat-chip-set><mat-chip selected>{{ e.actif ? 'Actif' : 'Inactif' }}</mat-chip></mat-chip-set></td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="contactColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: contactColumns"></tr>
        </table>
        <p class="empty" *ngIf="etudiants().length === 0">Aucun contact etudiant disponible.</p>
      </mat-card-content>
    </mat-card>

    <mat-card class="table-card">
      <mat-card-header><mat-card-title>Registre des stages</mat-card-title></mat-card-header>
      <mat-card-content>
        <table mat-table [dataSource]="stages()" class="full-table">
          <ng-container matColumnDef="etudiant">
            <th mat-header-cell *matHeaderCellDef>Etudiant</th>
            <td mat-cell *matCellDef="let s">{{ studentName(s) }}<br><small>{{ s.ine }}</small></td>
          </ng-container>
          <ng-container matColumnDef="sujet">
            <th mat-header-cell *matHeaderCellDef>Sujet</th>
            <td mat-cell *matCellDef="let s"><strong>{{ s.sujet }}</strong><br><small>{{ s.typeStage }}</small></td>
          </ng-container>
          <ng-container matColumnDef="periode">
            <th mat-header-cell *matHeaderCellDef>Periode</th>
            <td mat-cell *matCellDef="let s">{{ s.dateDebut | date:'dd/MM/yyyy' }} - {{ s.dateFin | date:'dd/MM/yyyy' }}</td>
          </ng-container>
          <ng-container matColumnDef="partenaire">
            <th mat-header-cell *matHeaderCellDef>Partenaire</th>
            <td mat-cell *matCellDef="let s">{{ s.partenaireNom || '-' }}</td>
          </ng-container>
          <ng-container matColumnDef="bilan">
            <th mat-header-cell *matHeaderCellDef>Bilan</th>
            <td mat-cell *matCellDef="let s">{{ s.appreciation || '-' }}</td>
          </ng-container>
          <ng-container matColumnDef="statut">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let s"><mat-chip-set><mat-chip selected>{{ s.statut }}</mat-chip></mat-chip-set></td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="stageColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: stageColumns"></tr>
        </table>
        <p class="empty" *ngIf="stages().length === 0">Aucun stage enregistre.</p>
      </mat-card-content>
    </mat-card>

    <mat-card class="table-card">
      <mat-card-header><mat-card-title>Base des partenaires</mat-card-title></mat-card-header>
      <mat-card-content>
        <div class="partners">
          <div class="partner" *ngFor="let p of partenaires()">
            <strong>{{ p.nom }}</strong>
            <span>{{ p.secteur || '-' }} - {{ p.typePartenariat || '-' }}</span>
            <small>{{ p.contactNom }} <ng-container *ngIf="p.contactEmail">({{ p.contactEmail }})</ng-container></small>
          </div>
        </div>
        <p class="empty" *ngIf="partenaires().length === 0">Aucun partenaire enregistre.</p>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:18px}.page-head h2{margin:0;color:#1a237e}.page-head p{margin:4px 0 0;color:#666}.export-actions{display:flex;gap:8px;flex-wrap:wrap}.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:16px}.stats mat-card{border-radius:10px}.stats span{display:block;color:#666;font-size:13px}.stats strong{font-size:28px;color:#1a237e}.layout{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}mat-card{border-radius:10px}.form{display:grid;grid-template-columns:1fr 1fr;gap:12px}.wide{grid-column:1/-1}.table-card{margin-top:16px}.full-table{width:100%}.empty{text-align:center;color:#888;padding:24px}.partners{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}.partner{display:flex;flex-direction:column;gap:3px;background:#f6f8ff;border-left:3px solid #3949ab;border-radius:8px;padding:10px}.partner span,.partner small{color:#666}@media(max-width:1000px){.layout{grid-template-columns:1fr}.form{grid-template-columns:1fr}}@media(max-width:640px){.page-head{flex-direction:column}}
  `]
})
export class AppuiInsertionComponent implements OnInit {
  private svc = inject(AdministrationService);
  private etudiantSvc = inject(EtudiantService);
  private formateurSvc = inject(FormateurService);
  private exporter = inject(ExportService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  stages = signal<StageResponse[]>([]);
  partenaires = signal<PartenaireResponse[]>([]);
  etudiants = signal<EtudiantSummary[]>([]);
  formateurs = signal<FormateurSummary[]>([]);
  contactColumns = ['nom', 'email', 'genre', 'statut'];
  stageColumns = ['etudiant', 'sujet', 'periode', 'partenaire', 'bilan', 'statut'];

  stageForm = this.fb.group({
    sujet: ['', Validators.required],
    etudiantId: [null as string | null, Validators.required],
    partenaireId: [null as string | null],
    encadrantAcademiqueId: [null as string | null],
    typeStage: ['ACADEMIQUE'],
    statut: ['EN_COURS'],
    dateDebut: [''],
    dateFin: [''],
    noteFinale: [null as number | null],
    appreciation: ['']
  });

  partenaireForm = this.fb.group({
    nom: ['', Validators.required],
    domaine: [''],
    typePartenaire: ['ENTREPRISE'],
    contact: [''],
    email: [''],
    telephone: [''],
    adresse: ['']
  });

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.svc.findStages(0, 1000).subscribe({ next: r => this.stages.set(r.content), error: () => this.stages.set([]) });
    this.svc.searchPartenaires('', 0, 1000).subscribe({ next: r => this.partenaires.set(r.content), error: () => this.partenaires.set([]) });
    this.etudiantSvc.search('', 0, 1000).subscribe({ next: r => this.etudiants.set(r.content), error: () => this.etudiants.set([]) });
    this.formateurSvc.findAll('', 0, 1000).subscribe({ next: r => this.formateurs.set(r.content), error: () => this.formateurs.set([]) });
  }

  createStage(): void {
    if (this.stageForm.invalid) return;
    const value = this.stageForm.getRawValue();
    this.svc.createStage({
      sujet: value.sujet ?? '',
      etudiantId: value.etudiantId,
      partenaireId: value.partenaireId,
      encadrantAcademiqueId: value.encadrantAcademiqueId,
      typeStage: value.typeStage ?? undefined,
      statut: value.statut ?? undefined,
      dateDebut: value.dateDebut ?? undefined,
      dateFin: value.dateFin ?? undefined,
      noteFinale: value.noteFinale ?? undefined,
      appreciation: value.appreciation ?? undefined
    }).subscribe({
      next: stage => {
        this.stages.update(items => [stage, ...items]);
        this.stageForm.patchValue({ sujet: '', appreciation: '', noteFinale: null });
        this.snack.open('Stage enregistre', 'OK', { duration: 2500 });
      },
      error: err => this.snack.open(err.error?.message || 'Creation du stage impossible', 'Fermer', { duration: 4000 })
    });
  }

  createPartenaire(): void {
    if (this.partenaireForm.invalid) return;
    this.svc.createPartenaire({ ...this.partenaireForm.getRawValue(), actif: true }).subscribe({
      next: partenaire => {
        this.partenaires.update(items => [partenaire, ...items]);
        this.partenaireForm.reset({ typePartenaire: 'ENTREPRISE' });
        this.snack.open('Partenaire enregistre', 'OK', { duration: 2500 });
      },
      error: err => this.snack.open(err.error?.message || 'Creation du partenaire impossible', 'Fermer', { duration: 4000 })
    });
  }

  countByStatut(statut: string): number {
    return this.stages().filter(s => String(s.statut) === statut).length;
  }

  countByType(type: string): number {
    return this.stages().filter(s => String(s.typeStage) === type).length;
  }

  countAutoEmploi(): number {
    return this.stages().filter(s => this.isTerminated(s) && this.hasInsertionKeyword(s, ['auto', 'entrepreneur', 'entrepreneuriat'])).length;
  }

  countEmploiSalarie(): number {
    return this.stages().filter(s => this.isTerminated(s) && (String(s.typeStage) === 'PRE_EMPLOI' || this.hasInsertionKeyword(s, ['emploi', 'salarie', 'contrat']))).length;
  }

  partenairesActifs(): number {
    return this.partenaires().filter(p => p.actif !== false).length;
  }

  studentName(stage: StageResponse): string {
    return [stage.prenomEtudiant, stage.nomEtudiant].filter(Boolean).join(' ') || 'Etudiant';
  }

  exportStagesCsv(): void {
    this.exporter.csv('stages', this.stageRows());
  }

  exportStagesPdf(): void {
    this.exporter.print('Registre des stages', this.stageRows());
  }

  exportPartenairesCsv(): void {
    this.exporter.csv('partenaires', this.partenaireRows());
  }

  exportContactsCsv(): void {
    this.exporter.csv('registre-contacts-etudiants', this.contactRows());
  }

  private isTerminated(stage: StageResponse): boolean {
    return ['TERMINE', 'DIPLOME', 'TERMINEE'].includes(String(stage.statut));
  }

  private hasInsertionKeyword(stage: StageResponse, keywords: string[]): boolean {
    const text = `${stage.appreciation ?? ''} ${stage.sujet ?? ''}`.toLowerCase();
    return keywords.some(keyword => text.includes(keyword));
  }

  private stageRows(): Array<Record<string, unknown>> {
    return this.stages().map(s => ({
      Etudiant: this.studentName(s),
      INE: s.ine,
      Sujet: s.sujet,
      Type: s.typeStage,
      Debut: s.dateDebut,
      Fin: s.dateFin,
      Statut: s.statut,
      Partenaire: s.partenaireNom,
      Note: s.noteFinale
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

  private contactRows(): Array<Record<string, unknown>> {
    return this.etudiants().map(e => ({
      Etudiant: e.nomComplet,
      INE: e.ine,
      Email: e.email,
      Genre: e.genre,
      Statut: e.actif ? 'Actif' : 'Inactif'
    }));
  }
}

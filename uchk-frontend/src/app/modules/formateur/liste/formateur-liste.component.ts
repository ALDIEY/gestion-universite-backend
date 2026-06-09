import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormateurService } from '../../../core/services/formateur.service';
import { AuthService } from '../../../core/services/auth.service';
import { ExportService } from '../../../core/services/export.service';
import { FormateurSummary } from '../../../shared/models/models';

@Component({
  selector: 'app-formateur-liste',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatFormFieldModule,
    MatInputModule, MatIconModule, MatButtonModule, MatCardModule,
    MatChipsModule, MatProgressSpinnerModule, MatTooltipModule, MatSnackBarModule
  ],
  template: `
    <div class="page-header">
      <div>
        <h2>Formateurs</h2>
        <p>{{ total() }} formateur(s) enregistré(s)</p>
      </div>
      <div class="header-action" *ngIf="auth.hasRole('ADMIN','ADMINISTRATIF')">
        <span>Creation via Gestion des utilisateurs</span>
        <button mat-stroked-button color="primary" [routerLink]="['/administration']">
          <mat-icon>manage_accounts</mat-icon> Ouvrir
        </button>
      </div>
    </div>

    <mat-card class="table-card">
      <div class="search-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Rechercher (nom, spécialité...)</mat-label>
          <input matInput [formControl]="searchCtrl">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <div class="export-actions">
          <button mat-stroked-button type="button" (click)="exportCsv()"><mat-icon>table_view</mat-icon> CSV</button>
          <button mat-stroked-button type="button" (click)="exportPdf()"><mat-icon>picture_as_pdf</mat-icon> PDF</button>
        </div>
      </div>

      <div *ngIf="loading()" class="loading-overlay">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <div class="table-container" [class.blurred]="loading()">
        <table mat-table [dataSource]="formateurs()">

          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef>Nom complet</th>
            <td mat-cell *matCellDef="let f"><strong>{{ f.nomComplet }}</strong></td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let f">{{ f.email }}</td>
          </ng-container>

          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Rôle</th>
            <td mat-cell *matCellDef="let f">
              <mat-chip-set>
                <mat-chip [color]="typeColor(f.typeFormateur)" selected>
                  {{ typeLabel(f.typeFormateur) }}
                </mat-chip>
              </mat-chip-set>
            </td>
          </ng-container>

          <ng-container matColumnDef="specialite">
            <th mat-header-cell *matHeaderCellDef>Spécialité</th>
            <td mat-cell *matCellDef="let f">{{ f.specialite || '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="statut">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let f">
              <mat-chip-set>
                <mat-chip [color]="f.actif ? 'primary' : 'warn'" selected>
                  {{ f.actif ? 'Actif' : 'Inactif' }}
                </mat-chip>
              </mat-chip-set>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let f">
              <button mat-icon-button color="primary"
                      [routerLink]="['/formateurs', f.id]"
                      matTooltip="Voir le profil">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button
                      *ngIf="auth.isAdmin()"
                      [color]="f.actif ? 'warn' : 'primary'"
                      (click)="toggleActif(f)"
                      [matTooltip]="f.actif ? 'Désactiver' : 'Activer'">
                <mat-icon>{{ f.actif ? 'block' : 'check_circle' }}</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"
              class="clickable-row"
              [routerLink]="['/formateurs', row.id]"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell empty-row" [attr.colspan]="columns.length">
              <mat-icon>search_off</mat-icon>
              <p>Aucun formateur trouvé</p>
            </td>
          </tr>
        </table>
      </div>

      <mat-paginator
        [length]="total()" [pageSize]="pageSize"
        [pageSizeOptions]="[10,20,50]"
        (page)="onPage($event)" showFirstLastButtons>
      </mat-paginator>
    </mat-card>
  `,
  styles: [`
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; }
    .page-header h2 { margin:0; font-size:24px; color:#1a237e; }
    .page-header p  { margin:4px 0 0; color:#666; font-size:14px; }
    .header-action { display:flex; align-items:center; gap:10px; color:#64748b; font-size:13px; flex-wrap:wrap; justify-content:flex-end; }
    .table-card { border-radius:12px; overflow:hidden; position:relative; }
    .search-bar { padding:16px 16px 0; display:flex; gap:12px; align-items:flex-start; flex-wrap:wrap; }
    .export-actions { display:flex; gap:8px; margin-top:4px; }
    .search-field { width:100%; max-width:400px; }
    .loading-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.7); z-index:10; }
    .blurred { opacity:.4; pointer-events:none; }
    .table-container { overflow-x:auto; }
    table { width:100%; }
    .clickable-row { cursor:pointer; }
    .clickable-row:hover { background:#f5f5f5; }
    .empty-row { text-align:center; padding:48px; color:#bbb; }
    .empty-row mat-icon { font-size:48px; width:48px; height:48px; display:block; margin:0 auto 8px; }
    .empty-row p { margin:0; }
  `]
})
export class FormateurListeComponent implements OnInit {
  private svc   = inject(FormateurService);
  auth          = inject(AuthService);
  private snack = inject(MatSnackBar);
  private exporter = inject(ExportService);

  columns     = ['nom','email','type','specialite','statut','actions'];
  formateurs  = signal<FormateurSummary[]>([]);
  total       = signal(0);
  loading     = signal(false);
  pageSize    = 20;
  currentPage = 0;
  searchCtrl  = new FormControl('');

  ngOnInit(): void {
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => { this.currentPage = 0; this.load(); });
  }

  load(): void {
    this.loading.set(true);
    this.svc.findAll(this.searchCtrl.value ?? '', this.currentPage, this.pageSize)
      .subscribe({
        next: res => { this.formateurs.set(res.content); this.total.set(res.totalElements); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
  }

  onPage(e: PageEvent): void { this.currentPage = e.pageIndex; this.pageSize = e.pageSize; this.load(); }

  toggleActif(f: FormateurSummary): void {
    this.svc.toggleActif(f.id).subscribe({
      next: () => { f.actif = !f.actif; this.snack.open(`Formateur ${f.actif ? 'activé' : 'désactivé'}`, 'OK', { duration: 3000 }); }
    });
  }

  typeLabel(type: string): string {
    const labels: Record<string, string> = {
      ENSEIGNANT: 'Enseignant', ENSEIGNANT_ASSOCIE: 'Ens. Associé',
      RESPONSABLE_FORMATION: 'Resp. Formation', TUTEUR: 'Tuteur'
    };
    return labels[type] || type;
  }

  typeColor(type: string): string {
    return type === 'TUTEUR' ? 'accent' : type === 'RESPONSABLE_FORMATION' ? 'warn' : 'primary';
  }

  exportCsv(): void {
    this.exporter.csv('formateurs', this.exportRows());
  }

  exportPdf(): void {
    this.exporter.print('Liste des formateurs', this.exportRows());
  }

  private exportRows(): Array<Record<string, unknown>> {
    return this.formateurs().map(f => ({
      Nom: f.nomComplet,
      Email: f.email,
      Role: this.typeLabel(f.typeFormateur),
      Specialite: f.specialite,
      Statut: f.actif ? 'Actif' : 'Inactif'
    }));
  }
}

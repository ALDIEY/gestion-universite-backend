import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormationService } from '../../../core/services/api.services';
import { AuthService } from '../../../core/services/auth.service';
import { ExportService } from '../../../core/services/export.service';
import { FormationSummary } from '../../../shared/models/models';

@Component({
  selector: 'app-formation-liste',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule, MatChipsModule,
    MatPaginatorModule, MatProgressSpinnerModule, MatInputModule, MatFormFieldModule
  ],
  template: `
    <div class="page-header">
      <div>
        <h2>Formations</h2>
        <p>{{ total() }} formation(s) disponible(s)</p>
      </div>
      <div class="header-note" *ngIf="auth.hasRole('ADMIN','RESPONSABLE_FORMATION')">
        <mat-icon>info</mat-icon>
        <span>La creation des formations se fait depuis le parcours de gestion dedie.</span>
      </div>
      <div class="export-actions">
        <button mat-stroked-button type="button" (click)="exportCsv()"><mat-icon>table_view</mat-icon> CSV</button>
        <button mat-stroked-button type="button" (click)="exportPdf()"><mat-icon>picture_as_pdf</mat-icon> PDF</button>
      </div>
    </div>

    <mat-card class="filter-card">
      <mat-card-content>
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Rechercher une formation</mat-label>
          <input matInput [formControl]="searchCtrl" placeholder="Intitule, niveau, type...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </mat-card-content>
    </mat-card>

    <div *ngIf="loading()" class="center-spinner"><mat-spinner></mat-spinner></div>

    <div class="formations-grid" *ngIf="!loading()">
      <mat-card class="formation-card" *ngFor="let f of formations()"
                [routerLink]="['/formations', f.id]">
        <mat-card-header>
          <mat-icon mat-card-avatar color="primary">menu_book</mat-icon>
          <mat-card-title>{{ f.intitule }}</mat-card-title>
          <mat-card-subtitle>Niveau : {{ f.niveau }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="chips-row">
            <mat-chip-set>
              <mat-chip color="primary" selected>{{ f.typeFormation }}</mat-chip>
            </mat-chip-set>
          </div>
          <div class="stats-row">
            <div class="stat">
              <mat-icon>school</mat-icon>
              <span>{{ f.nbEtudiantsInscrits }} étudiant(s)</span>
            </div>
            <div class="stat">
              <mat-icon>layers</mat-icon>
              <span>{{ f.nbModules }} module(s)</span>
            </div>
            <div class="stat" *ngIf="f.dateDebut">
              <mat-icon>calendar_today</mat-icon>
              <span>{{ f.dateDebut | date:'MMM yyyy' }}</span>
            </div>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button color="primary" [routerLink]="['/formations', f.id]">
            Voir le détail
          </button>
        </mat-card-actions>
      </mat-card>

      <div *ngIf="formations().length === 0" class="empty-state">
        <mat-icon>menu_book</mat-icon>
        <p>Aucune formation disponible</p>
      </div>
    </div>

    <mat-paginator
      [length]="total()" [pageSize]="pageSize"
      [pageSizeOptions]="[6,12,24]" (page)="onPage($event)"
      showFirstLastButtons>
    </mat-paginator>
  `,
  styles: [`
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; }
    .header-note { display:flex; align-items:center; gap:8px; color:#64748b; font-size:13px; max-width:320px; }
    .header-note mat-icon { color:#2563eb; }
    .export-actions { display:flex; gap:8px; flex-wrap:wrap; }
    .page-header h2 { margin:0; font-size:24px; color:#1a237e; }
    .page-header p { margin:4px 0 0; color:#666; font-size:14px; }
    .center-spinner { display:flex; justify-content:center; padding:80px; }
    .filter-card { margin-bottom:16px; }
    .filter-card mat-card-content { display:flex; align-items:center; }
    .search-field { width:100%; max-width:520px; }
    .formations-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; margin-bottom:16px; }
    .formation-card { border-radius:12px; cursor:pointer; transition:transform .2s,box-shadow .2s; }
    .formation-card:hover { transform:translateY(-4px); box-shadow:0 8px 24px rgba(0,0,0,0.12); }
    .chips-row { margin:8px 0; }
    .stats-row { display:flex; gap:16px; flex-wrap:wrap; margin-top:8px; }
    .stat { display:flex; align-items:center; gap:4px; color:#666; font-size:13px; }
    .stat mat-icon { font-size:16px; width:16px; height:16px; }
    .empty-state { text-align:center; padding:80px; color:#bbb; grid-column:1/-1; }
    .empty-state mat-icon { font-size:64px; width:64px; height:64px; }
  `]
})
export class FormationListeComponent implements OnInit {
  private svc = inject(FormationService);
  auth        = inject(AuthService);
  private exporter = inject(ExportService);

  formations = signal<FormationSummary[]>([]);
  allFormations = signal<FormationSummary[]>([]);
  total      = signal(0);
  loading    = signal(false);
  pageSize   = 12;
  currentPage = 0;
  searchCtrl = new FormControl('');

  ngOnInit(): void {
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(250), distinctUntilChanged()).subscribe(() => {
      this.currentPage = 0;
      this.applyFilters();
    });
  }

  load(): void {
    this.loading.set(true);
    this.svc.findAll(0, 1000).subscribe({
      next: res => {
        this.allFormations.set(res.content);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPage(e: PageEvent): void {
    this.currentPage = e.pageIndex;
    this.pageSize    = e.pageSize;
    this.applyFilters();
  }

  private applyFilters(): void {
    const query = (this.searchCtrl.value ?? '').trim().toLowerCase();
    const filtered = query
      ? this.allFormations().filter(f =>
          [f.intitule, f.niveau, f.typeFormation, f.dateDebut, f.dateFin]
            .some(value => (value ?? '').toLowerCase().includes(query)))
      : this.allFormations();
    const start = this.currentPage * this.pageSize;
    this.formations.set(filtered.slice(start, start + this.pageSize));
    this.total.set(filtered.length);
  }

  exportCsv(): void {
    this.exporter.csv('formations', this.exportRows());
  }

  exportPdf(): void {
    this.exporter.print('Liste des formations', this.exportRows());
  }

  private exportRows(): Array<Record<string, unknown>> {
    return this.formations().map(f => ({
      Intitule: f.intitule,
      Niveau: f.niveau,
      Type: f.typeFormation,
      Debut: f.dateDebut,
      Fin: f.dateFin,
      Etudiants: f.nbEtudiantsInscrits,
      Modules: f.nbModules
    }));
  }
}

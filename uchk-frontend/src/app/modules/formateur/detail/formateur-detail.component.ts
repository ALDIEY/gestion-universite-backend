import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { FormateurService } from '../../../core/services/formateur.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormateurDetail, SlotResponse } from '../../../shared/models/models';

@Component({
  selector: 'app-formateur-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatTabsModule, MatIconModule, MatButtonModule,
    MatChipsModule, MatDividerModule, MatListModule,
    MatProgressSpinnerModule, MatTableModule
  ],
  template: `
    <div *ngIf="loading()" class="center-spinner"><mat-spinner></mat-spinner></div>

    <ng-container *ngIf="formateur() as f">
      <div class="page-header">
        <button mat-icon-button [routerLink]="['/formateurs']">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h2>{{ f.nomComplet }}</h2>
        <button mat-stroked-button color="accent"
                *ngIf="auth.hasRole('ADMIN','ADMINISTRATIF')"
                [routerLink]="['/formateurs', f.id, 'edit']">
          <mat-icon>edit</mat-icon> Modifier
        </button>
      </div>

      <!-- Carte profil -->
      <mat-card class="profile-card">
        <mat-card-content>
          <div class="profile-layout">
            <div class="avatar-circle">
              <mat-icon>school</mat-icon>
            </div>
            <div class="profile-info">
              <h3>{{ f.nomComplet }}</h3>
              <p><mat-icon inline>email</mat-icon> {{ f.email }}</p>
              <div class="chips-row">
                <mat-chip-set>
                  <mat-chip color="primary" selected>{{ typeLabel(f.typeFormateur) }}</mat-chip>
                  <mat-chip *ngIf="f.specialite" color="accent" selected>
                    <mat-icon>science</mat-icon> {{ f.specialite }}
                  </mat-chip>
                </mat-chip-set>
              </div>
              <div class="chips-row" *ngIf="modulesAssocies().length">
                <p class="modules-title">Modules associés</p>
                <mat-chip-set>
                  <mat-chip *ngFor="let module of modulesAssocies()" selected>
                    {{ module }}
                  </mat-chip>
                </mat-chip-set>
              </div>
              <p *ngIf="f.biographie" class="bio">{{ f.biographie }}</p>
            </div>
            <div class="stats-col">
              <div class="stat-item">
                <span class="stat-val">{{ f.cours.length }}</span>
                <span class="stat-label">Cours assignés</span>
              </div>
              <div class="stat-item">
                <span class="stat-val">{{ slotsThisWeek() }}</span>
                <span class="stat-label">Séances cette semaine</span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Onglets -->
      <mat-tab-group class="tabs-card">

        <!-- Cours -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>menu_book</mat-icon>&nbsp; Cours ({{ f.cours.length }})
          </ng-template>
          <div class="tab-content">
            <div *ngIf="f.cours.length === 0" class="empty-tab">
              <mat-icon>menu_book</mat-icon><p>Aucun cours assigné</p>
            </div>
            <table mat-table [dataSource]="f.cours" *ngIf="f.cours.length > 0">
              <ng-container matColumnDef="module">
                <th mat-header-cell *matHeaderCellDef>Module</th>
                <td mat-cell *matCellDef="let c"><strong>{{ c.moduleIntitule }}</strong></td>
              </ng-container>
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let c">
                  <mat-chip-set>
                    <mat-chip [color]="seanceColor(c.typeSeance)" selected>{{ c.typeSeance }}</mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let c">
                  {{ c.dateHeure ? (c.dateHeure | date:'dd/MM/yyyy HH:mm') : '—' }}
                </td>
              </ng-container>
              <ng-container matColumnDef="salle">
                <th mat-header-cell *matHeaderCellDef>Salle</th>
                <td mat-cell *matCellDef="let c">{{ c.salle || '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="duree">
                <th mat-header-cell *matHeaderCellDef>Durée</th>
                <td mat-cell *matCellDef="let c">{{ c.dureeMin ? c.dureeMin + ' min' : '—' }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="coursColumns"></tr>
              <tr mat-row *matRowDef="let r; columns: coursColumns"></tr>
            </table>
          </div>
        </mat-tab>

        <!-- Planning semaine -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>calendar_today</mat-icon>&nbsp; Planning
          </ng-template>
          <div class="tab-content">

            <!-- Navigation semaine -->
            <div class="week-nav">
              <button mat-stroked-button (click)="changeWeek(-1)">
                <mat-icon>chevron_left</mat-icon> Semaine précédente
              </button>
              <span class="week-label">{{ weekLabel() }}</span>
              <button mat-stroked-button (click)="changeWeek(1)">
                Semaine suivante <mat-icon>chevron_right</mat-icon>
              </button>
            </div>

            <!-- Grille planning -->
            <div *ngIf="loadingPlanning()" class="center-spinner" style="padding:40px">
              <mat-spinner diameter="36"></mat-spinner>
            </div>

            <div *ngIf="!loadingPlanning()">
              <div *ngIf="slots().length === 0" class="empty-tab">
                <mat-icon>event_available</mat-icon>
                <p>Aucune séance planifiée cette semaine</p>
              </div>

              <div class="planning-grid" *ngIf="slots().length > 0">
                <mat-card class="slot-card" *ngFor="let s of slots()">
                  <mat-card-content>
                    <div class="slot-date">
                      <mat-icon>calendar_today</mat-icon>
                      {{ s.dateSlot | date:'EEEE d MMMM':'':'fr' }}
                    </div>
                    <div class="slot-time">
                      <mat-icon>schedule</mat-icon>
                      {{ s.heureDebut }} — {{ s.heureFin }}
                    </div>
                    <mat-divider style="margin:8px 0"></mat-divider>
                    <div class="slot-module">
                      <strong>{{ s.cours.moduleIntitule }}</strong>
                    </div>
                    <div class="slot-meta">
                      <mat-chip-set>
                        <mat-chip [color]="seanceColor(s.cours.typeSeance)" selected>
                          {{ s.cours.typeSeance }}
                        </mat-chip>
                      </mat-chip-set>
                      <span *ngIf="s.cours.salle" class="salle">
                        <mat-icon inline>room</mat-icon> {{ s.cours.salle }}
                      </span>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </div>
        </mat-tab>

      </mat-tab-group>
    </ng-container>
  `,
  styles: [`
    .center-spinner { display:flex; justify-content:center; padding:80px; }
    .page-header { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
    .page-header h2 { flex:1; margin:0; font-size:22px; color:#1a237e; }
    .profile-card { border-radius:12px; margin-bottom:16px; }
    .profile-layout { display:flex; gap:24px; align-items:flex-start; flex-wrap:wrap; }
    .avatar-circle {
      width:80px; height:80px; border-radius:50%;
      background:linear-gradient(135deg,#1a237e,#3949ab);
      display:flex; align-items:center; justify-content:center; flex-shrink:0;
    }
    .avatar-circle mat-icon { font-size:40px; width:40px; height:40px; color:white; }
    .profile-info { flex:1; }
    .profile-info h3 { margin:0 0 4px; font-size:20px; }
    .profile-info p { display:flex; align-items:center; gap:4px; color:#666; margin:4px 0; font-size:14px; }
    .chips-row { margin:8px 0; }
    .modules-title { margin:0 0 4px; color:#666; font-size:12px; }
    .bio { font-style:italic; color:#555; font-size:14px; line-height:1.5; }
    .stats-col { display:flex; flex-direction:column; gap:12px; }
    .stat-item { text-align:center; background:#f0f4ff; border-radius:10px; padding:10px 20px; }
    .stat-val { display:block; font-size:28px; font-weight:700; color:#1a237e; }
    .stat-label { font-size:11px; color:#666; }
    .tabs-card { border-radius:12px; background:white; box-shadow:0 2px 8px rgba(0,0,0,.08); }
    .tab-content { padding:16px; display:flex; flex-direction:column; gap:12px; }
    table { width:100%; }
    .empty-tab { text-align:center; padding:48px; color:#bbb; }
    .empty-tab mat-icon { font-size:48px; width:48px; height:48px; display:block; margin:0 auto 8px; }
    .week-nav { display:flex; align-items:center; justify-content:space-between; }
    .week-label { font-weight:600; color:#1a237e; font-size:15px; }
    .planning-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:12px; }
    .slot-card { border-radius:10px; border-left:4px solid #3949ab; }
    .slot-date { display:flex; align-items:center; gap:4px; font-weight:600; color:#1a237e; font-size:14px; margin-bottom:4px; }
    .slot-time { display:flex; align-items:center; gap:4px; color:#555; font-size:13px; }
    .slot-module { font-size:14px; margin-bottom:6px; }
    .slot-meta { display:flex; align-items:center; justify-content:space-between; }
    .salle { font-size:12px; color:#666; display:flex; align-items:center; gap:2px; }
  `]
})
export class FormateurDetailComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private svc    = inject(FormateurService);
  auth           = inject(AuthService);

  formateur      = signal<FormateurDetail | null>(null);
  slots          = signal<SlotResponse[]>([]);
  loading        = signal(true);
  loadingPlanning = signal(false);
  coursColumns   = ['module','type','date','salle','duree'];

  private weekOffset = 0;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.findById(id).subscribe({
      next: f  => {
        this.svc.getCours(id).subscribe({
          next: cours => this.formateur.set({ ...f, cours }),
          error: () => this.formateur.set(f)
        });
        this.loading.set(false);
        this.loadPlanning(id);
      },
      error: () => this.loading.set(false)
    });
  }

  loadPlanning(formateurId: string): void {
    this.loadingPlanning.set(true);
    const { debut, fin } = this.getWeekRange();
    this.svc.getPlanning(formateurId, debut, fin).subscribe({
      next: s => { this.slots.set(s); this.loadingPlanning.set(false); },
      error: () => this.loadingPlanning.set(false)
    });
  }

  changeWeek(delta: number): void {
    this.weekOffset += delta;
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadPlanning(id);
  }

  getWeekRange(): { debut: string; fin: string } {
    const now = new Date();
    const day = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1 + this.weekOffset * 7);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 6);
    return {
      debut: monday.toISOString().split('T')[0],
      fin:   friday.toISOString().split('T')[0]
    };
  }

  weekLabel(): string {
    const { debut, fin } = this.getWeekRange();
    const d = new Date(debut);
    const f = new Date(fin);
    return `${d.toLocaleDateString('fr-FR', { day:'numeric', month:'short' })} — ${f.toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' })}`;
  }

  slotsThisWeek(): number {
    return this.slots().length;
  }

  modulesAssocies(): string[] {
    const cours = this.formateur()?.cours ?? [];
    return [...new Set(cours.map(c => c.moduleIntitule).filter(Boolean))];
  }

  typeLabel(type: string): string {
    const labels: Record<string, string> = {
      ENSEIGNANT: 'Enseignant', ENSEIGNANT_ASSOCIE: 'Ens. Associé',
      RESPONSABLE_FORMATION: 'Resp. Formation', TUTEUR: 'Tuteur'
    };
    return labels[type] || type;
  }

  seanceColor(type?: string): string {
    return type === 'CM' ? 'primary' : type === 'TD' ? 'accent' : type === 'TP' ? 'warn' : '';
  }

  toggleActif(id: string): void {
    this.svc.toggleActif(id).subscribe({ next: () => {} });
  }
}

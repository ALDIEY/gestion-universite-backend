import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommunicationService, FormationService } from '../../core/services/api.services';
import { ExportService } from '../../core/services/export.service';
import { ReunionSummary, NotificationResponse, CompteRenduResponse, FormationSummary } from '../../shared/models/models';

@Component({
  selector: 'app-communication',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTabsModule, MatCardModule, MatIconModule,
    MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatListModule, MatChipsModule, MatDividerModule, MatBadgeModule, MatSnackBarModule
  ],
  template: `
    <div class="page-header">
      <h2>Communication</h2>
      <div class="export-actions">
        <button mat-stroked-button type="button" (click)="exportReunionsCsv()"><mat-icon>table_view</mat-icon> Reunions CSV</button>
        <button mat-stroked-button type="button" (click)="exportCompteRendusPdf()"><mat-icon>picture_as_pdf</mat-icon> CR PDF</button>
      </div>
    </div>

    <mat-tab-group animationDuration="200ms">

      <!-- Réunions -->
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>groups</mat-icon>&nbsp; Mes réunions
        </ng-template>
        <div class="tab-content">
          <mat-card class="form-card">
            <mat-card-content>
              <form [formGroup]="reunionForm" class="quick-form" (ngSubmit)="createReunion()">
                <mat-form-field appearance="outline">
                  <mat-label>Titre</mat-label>
                  <input matInput formControlName="titre">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Type</mat-label>
                  <mat-select formControlName="typeReunion">
                    <mat-option value="REUNION_EQUIPE">Reunion equipe</mat-option>
                    <mat-option value="RENCONTRE">Rencontre</mat-option>
                    <mat-option value="SEMINAIRE">Seminaire</mat-option>
                    <mat-option value="WEBINAIRE">Webinaire</mat-option>
                    <mat-option value="CONSEIL_UNIVERSITE">Conseil d'universite</mat-option>
                    <mat-option value="SUIVI_TUTORAT">Suivi tutorat</mat-option>
                    <mat-option value="PREPARATION_COURS">Preparation cours</mat-option>
                    <mat-option value="PREPARATION_EVAL">Preparation evaluations</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Formation liee</mat-label>
                  <mat-select formControlName="formationId">
                    <mat-option [value]="null">Aucune formation</mat-option>
                    <mat-option *ngFor="let f of formations()" [value]="f.id">{{ f.intitule }}</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Date</mat-label>
                  <input matInput type="date" formControlName="dateReunion">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Debut</mat-label>
                  <input #debutReunionInput matInput type="time" step="900" formControlName="heureDebut" (focus)="openTimePicker($event)">
                  <button mat-icon-button matSuffix type="button" (click)="openTimePicker(debutReunionInput)">
                    <mat-icon>schedule</mat-icon>
                  </button>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Fin</mat-label>
                  <input #finReunionInput matInput type="time" step="900" formControlName="heureFin" (focus)="openTimePicker($event)">
                  <button mat-icon-button matSuffix type="button" (click)="openTimePicker(finReunionInput)">
                    <mat-icon>schedule</mat-icon>
                  </button>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Lieu</mat-label>
                  <input matInput formControlName="lieu">
                </mat-form-field>
                <mat-form-field appearance="outline" class="wide">
                  <mat-label>Ordre du jour</mat-label>
                  <input matInput formControlName="ordreDuJour">
                </mat-form-field>
                <button mat-raised-button color="primary" type="submit" [disabled]="reunionForm.invalid">
                  <mat-icon>add</mat-icon> Programmer
                </button>
              </form>
            </mat-card-content>
          </mat-card>

          <div *ngIf="reunions().length === 0" class="empty-state">
            <mat-icon>event_available</mat-icon><p>Aucune réunion</p>
          </div>
          <mat-card class="item-card" *ngFor="let r of reunions()">
            <mat-card-content>
              <div class="item-layout">
                <div class="item-icon">
                  <mat-icon color="primary">groups</mat-icon>
                </div>
                <div class="item-body">
                  <h4>{{ r.objet }}</h4>
                  <p>
                    <mat-icon inline>calendar_today</mat-icon>
                    {{ r.dateHeure | date:'dd/MM/yyyy HH:mm' }}
                    <span *ngIf="r.lieu"> &nbsp;|&nbsp; <mat-icon inline>location_on</mat-icon> {{ r.lieu }}</span>
                  </p>
                  <p *ngIf="reunionFormationLabel(r)">
                    <mat-icon inline>school</mat-icon>
                    Formation : {{ reunionFormationLabel(r) }}
                  </p>
                  <p *ngIf="r.lienVisio">
                    <mat-icon inline>videocam</mat-icon>
                    <a [href]="r.lienVisio" target="_blank">Lien visio</a>
                  </p>
                </div>
                <div class="item-meta">
                  <mat-chip-set>
                    <mat-chip color="primary" selected>{{ r.typeReunion }}</mat-chip>
                  </mat-chip-set>
                  <p class="participants">
                    <mat-icon inline>people</mat-icon> {{ r.nbParticipants }} participant(s)
                  </p>
                  <mat-chip *ngIf="r.hasCompteRendu" color="accent" selected>
                    <mat-icon>description</mat-icon> CR disponible
                  </mat-chip>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-tab>

      <!-- Comptes rendus -->
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon>description</mat-icon>&nbsp; Comptes rendus
        </ng-template>
        <div class="tab-content">
          <mat-card class="form-card">
            <mat-card-content>
              <form [formGroup]="compteRenduForm" class="quick-form" (ngSubmit)="createCompteRendu()">
                <mat-form-field appearance="outline">
                  <mat-label>Titre</mat-label>
                  <input matInput formControlName="titre">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Reunion</mat-label>
                  <mat-select formControlName="reunionId">
                    <mat-option [value]="null">Compte rendu libre</mat-option>
                    <mat-option *ngFor="let r of reunions()" [value]="r.id">{{ r.objet }}</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Lien fichier</mat-label>
                  <input matInput formControlName="fichierUrl">
                </mat-form-field>
                <mat-form-field appearance="outline" class="wide">
                  <mat-label>Contenu</mat-label>
                  <textarea matInput rows="3" formControlName="contenu"></textarea>
                </mat-form-field>
                <button mat-raised-button color="primary" type="submit" [disabled]="compteRenduForm.invalid">
                  <mat-icon>description</mat-icon> Ajouter CR
                </button>
              </form>
            </mat-card-content>
          </mat-card>

          <div *ngIf="compteRendus().length === 0" class="empty-state">
            <mat-icon>description</mat-icon><p>Aucun compte rendu</p>
          </div>
          <mat-card class="item-card" *ngFor="let cr of compteRendus()">
            <mat-card-content>
              <div class="cr-layout">
                <div>
                  <h4>{{ cr.reunionObjet || 'Compte rendu libre' }}</h4>
                  <p class="meta-line">
                    <mat-icon inline>person</mat-icon> {{ cr.redacteurNom }} &nbsp;|&nbsp;
                    <mat-icon inline>schedule</mat-icon> {{ cr.createdAt | date:'dd/MM/yyyy' }}
                  </p>
                  <p class="cr-extrait">{{ cr.contenu | slice:0:200 }}{{ cr.contenu.length > 200 ? '…' : '' }}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-tab>

      <!-- Notifications -->
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon [matBadge]="notifCount() || null" matBadgeColor="warn" matBadgeSize="small">
            notifications
          </mat-icon>&nbsp; Notifications
        </ng-template>
        <div class="tab-content">
          <div class="notif-actions" *ngIf="notifCount() > 0">
            <button mat-stroked-button (click)="markAllRead()">
              <mat-icon>done_all</mat-icon> Tout marquer comme lu
            </button>
          </div>
          <div *ngIf="notifications().length === 0" class="empty-state">
            <mat-icon>notifications_none</mat-icon><p>Aucune notification</p>
          </div>
          <mat-card class="item-card notif-card"
                    [class.unread]="!n.lu"
                    *ngFor="let n of notifications()"
                    (click)="markRead(n)">
            <mat-card-content>
              <div class="item-layout">
                <mat-icon [color]="n.lu ? '' : 'accent'">
                  {{ n.lu ? 'notifications_none' : 'notifications_active' }}
                </mat-icon>
                <div class="item-body">
                  <h4 [style.fontWeight]="n.lu ? '400' : '700'">{{ n.titre }}</h4>
                  <p>{{ n.message }}</p>
                  <small>{{ n.createdAt | date:'dd/MM/yyyy HH:mm' }}</small>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-tab>

    </mat-tab-group>
  `,
  styles: [`
    .page-header { margin-bottom:24px; display:flex; justify-content:space-between; gap:12px; align-items:flex-start; }
    .page-header h2 { margin:0; font-size:24px; color:#1a237e; }
    .export-actions { display:flex; gap:8px; flex-wrap:wrap; }
    .tab-content { padding:16px 0; display:flex; flex-direction:column; gap:12px; }
    .form-card { border-radius:12px; }
    .quick-form { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; align-items:start; }
    .wide { grid-column:span 2; }
    .item-card { border-radius:12px; }
    .item-layout { display:flex; gap:16px; align-items:flex-start; }
    .item-body { flex:1; }
    .item-body h4 { margin:0 0 4px; font-size:16px; }
    .item-body p  { margin:4px 0; color:#555; font-size:13px; display:flex; align-items:center; gap:4px; }
    .item-meta { display:flex; flex-direction:column; gap:8px; align-items:flex-end; }
    .participants { color:#666; font-size:12px; display:flex; align-items:center; gap:4px; }
    .cr-layout h4 { margin:0 0 4px; font-size:16px; }
    .meta-line { color:#666; font-size:13px; display:flex; align-items:center; gap:4px; margin:4px 0; }
    .cr-extrait { color:#555; font-size:14px; line-height:1.5; }
    .notif-actions { margin-bottom:8px; }
    .notif-card { cursor:pointer; transition:background .2s; }
    .notif-card.unread { border-left:4px solid #3f51b5; }
    .notif-card:hover { background:#f9f9ff; }
    .empty-state { text-align:center; padding:64px; color:#bbb; }
    .empty-state mat-icon { font-size:56px; width:56px; height:56px; }
    .empty-state p { margin:8px 0 0; }
    @media(max-width:900px){ .quick-form { grid-template-columns:1fr; } .wide { grid-column:auto; } }
  `]
})
export class CommunicationComponent implements OnInit {
  private svc = inject(CommunicationService);
  private formationSvc = inject(FormationService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  private exporter = inject(ExportService);

  reunions      = signal<ReunionSummary[]>([]);
  compteRendus  = signal<CompteRenduResponse[]>([]);
  notifications = signal<NotificationResponse[]>([]);
  formations    = signal<FormationSummary[]>([]);
  notifCount    = signal(0);
  reunionForm = this.fb.group({
    titre: ['', Validators.required],
    typeReunion: ['REUNION_EQUIPE', Validators.required],
    formationId: [null as string | null],
    dateReunion: ['', Validators.required],
    heureDebut: ['', Validators.required],
    heureFin: [''],
    lieu: [''],
    statut: ['PLANIFIEE'],
    ordreDuJour: ['']
  });
  compteRenduForm = this.fb.group({
    titre: ['', Validators.required],
    reunionId: [null as string | null],
    contenu: ['', Validators.required],
    fichierUrl: [''],
    publie: [true]
  });

  ngOnInit(): void {
    this.svc.mesReunions(0, 20).subscribe({ next: r => this.reunions.set(r.content), error: () => {} });
    this.svc.findCompteRendus(0, 20).subscribe({ next: r => this.compteRendus.set(r.content), error: () => {} });
    this.svc.mesNotifications(0, 20).subscribe({ next: r => this.notifications.set(r.content), error: () => {} });
    this.svc.countNonLus().subscribe({ next: r => this.notifCount.set(r.nonLus), error: () => {} });
    this.formationSvc.findAll(0, 1000).subscribe({ next: r => this.formations.set(r.content), error: () => this.formations.set([]) });
  }

  markRead(n: NotificationResponse): void {
    if (n.lu) return;
    this.svc.markAsRead(n.id).subscribe(() => { n.lu = true; this.notifCount.update(c => Math.max(0, c - 1)); });
  }

  markAllRead(): void {
    this.svc.markAllAsRead().subscribe(() => {
      this.notifications.update(list => list.map(n => ({ ...n, lu: true })));
      this.notifCount.set(0);
    });
  }

  createReunion(): void {
    if (this.reunionForm.invalid) return;
    const value = this.reunionForm.getRawValue();
    if (!this.isValidReunionTime()) {
      this.snack.open("L'heure de fin doit etre apres l'heure de debut", 'Fermer', { duration: 4000 });
      return;
    }
    this.svc.createReunion({
      ...value,
      formationId: value.formationId ? Number(value.formationId) : null
    }).subscribe({
      next: reunion => {
        this.reunions.update(items => [reunion, ...items]);
        this.reunionForm.reset({ typeReunion: 'REUNION_EQUIPE', statut: 'PLANIFIEE', formationId: null });
        this.snack.open('Reunion programmee', 'OK', { duration: 2500 });
      },
      error: err => this.snack.open(err.error?.message || 'Creation reunion impossible', 'Fermer', { duration: 4000 })
    });
  }

  openTimePicker(target: Event | HTMLInputElement): void {
    const input = target instanceof Event ? target.target as HTMLInputElement : target;
    input.showPicker?.();
  }

  createCompteRendu(): void {
    if (this.compteRenduForm.invalid) return;
    const value = this.compteRenduForm.getRawValue();
    this.svc.createCompteRendu({
      titre: value.titre ?? '',
      reunionId: value.reunionId,
      contenu: value.contenu ?? '',
      fichierUrl: value.fichierUrl ?? undefined,
      publie: value.publie ?? true
    }).subscribe({
      next: cr => {
        this.compteRendus.update(items => [cr, ...items]);
        this.compteRenduForm.reset({ publie: true });
        this.snack.open('Compte rendu ajoute', 'OK', { duration: 2500 });
      },
      error: err => this.snack.open(err.error?.message || 'Creation compte rendu impossible', 'Fermer', { duration: 4000 })
    });
  }

  exportReunionsCsv(): void {
    this.exporter.csv('reunions', this.reunionRows());
  }

  exportCompteRendusPdf(): void {
    this.exporter.print('Comptes rendus', this.compteRenduRows());
  }

  private reunionRows(): Array<Record<string, unknown>> {
    return this.reunions().map(r => ({
      Titre: r.objet,
      Type: r.typeReunion,
      Formation: this.reunionFormationLabel(r),
      Date: r.dateHeure,
      Lieu: r.lieu,
      Statut: r.statut
    }));
  }

  private compteRenduRows(): Array<Record<string, unknown>> {
    return this.compteRendus().map(cr => ({
      Titre: cr.reunionObjet,
      Redacteur: cr.redacteurNom,
      Date: cr.createdAt,
      Publie: cr.publie ? 'Oui' : 'Non',
      Contenu: cr.contenu
    }));
  }

  reunionFormationLabel(reunion: ReunionSummary): string {
    return reunion.formationIntitule
      ?? this.formations().find(f => f.id === reunion.formationId)?.intitule
      ?? '';
  }

  private isValidReunionTime(): boolean {
    const start = this.reunionForm.value.heureDebut;
    const end = this.reunionForm.value.heureFin;
    return !end || (!!start && end > start);
  }
}

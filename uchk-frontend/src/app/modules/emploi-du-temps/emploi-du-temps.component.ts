import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { EtudiantService, FormationService } from '../../core/services/api.services';
import { FormateurService } from '../../core/services/formateur.service';
import { EmploiDuTempsResponse, FormationSummary, FormateurSummary, ModuleResponse } from '../../shared/models/models';

@Component({
  selector: 'app-emploi-du-temps',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-header planner-head">
      <div>
        <h2>Emploi du temps</h2>
        <p>{{ isAdminView() ? 'Programmation des seances par formation' : 'Planning de votre formation active' }}</p>
      </div>
      <div class="week-nav" *ngIf="selectedFormationId()">
        <button mat-icon-button (click)="changeWeek(-1)" aria-label="Semaine precedente">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <strong>{{ calendarDays()[0].date | date:'dd MMM' }} - {{ calendarDays()[6].date | date:'dd MMM yyyy' }}</strong>
        <button mat-icon-button (click)="changeWeek(1)" aria-label="Semaine suivante">
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>
    </div>

    <mat-card class="toolbar-card">
      <mat-card-content>
        <mat-form-field appearance="outline" class="formation-select" *ngIf="isAdminView()">
          <mat-label>Formation / promotion</mat-label>
          <mat-select [value]="selectedFormationId()" (selectionChange)="selectFormation($event.value)">
            <mat-option *ngFor="let f of formations()" [value]="f.id">{{ f.intitule }} - {{ f.niveau }}</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="selected-formation" *ngIf="selectedFormationId()">
          <mat-icon>school</mat-icon>
          <div>
            <span>Formation</span>
            <strong>{{ selectedFormationLabel() }}</strong>
          </div>
        </div>
      </mat-card-content>
    </mat-card>

    <div class="summary-grid" *ngIf="selectedFormationId()">
      <mat-card class="summary-card">
        <mat-card-content><mat-icon>event</mat-icon><span>Seances semaine</span><strong>{{ weekSlots().length }}</strong></mat-card-content>
      </mat-card>
      <mat-card class="summary-card">
        <mat-card-content><mat-icon>schedule</mat-icon><span>Volume horaire</span><strong>{{ weeklyHours() }}h</strong></mat-card-content>
      </mat-card>
      <mat-card class="summary-card">
        <mat-card-content><mat-icon>layers</mat-icon><span>Modules concernes</span><strong>{{ activeModulesCount() }}</strong></mat-card-content>
      </mat-card>
      <mat-card class="summary-card">
        <mat-card-content><mat-icon>room</mat-icon><span>Salles utilisees</span><strong>{{ roomsCount() }}</strong></mat-card-content>
      </mat-card>
    </div>

    <mat-card class="panel" *ngIf="isAdminView() && selectedFormationId()">
      <mat-card-header>
        <mat-icon mat-card-avatar>edit_calendar</mat-icon>
        <mat-card-title>Programmer des seances</mat-card-title>
        <mat-card-subtitle>Les seances creees sont valables pour toute la promotion</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="form" class="schedule-form">
          <mat-form-field appearance="outline">
            <mat-label>Module</mat-label>
            <mat-select formControlName="moduleId" (selectionChange)="selectModule($event.value)">
              <mat-option *ngFor="let m of modules()" [value]="m.id">{{ m.intitule }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Enseignant</mat-label>
            <mat-select formControlName="formateurId">
              <mat-option [value]="null">Non assigne</mat-option>
              <mat-option *ngFor="let f of formateurs()" [value]="f.id">{{ f.nomComplet }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Heure de debut</mat-label>
            <input #debutInput matInput type="time" step="900" formControlName="heureDebut" (focus)="openTimePicker($event)">
            <button mat-icon-button matSuffix type="button" (click)="openTimePicker(debutInput)">
              <mat-icon>schedule</mat-icon>
            </button>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Heure de fin</mat-label>
            <input #finInput matInput type="time" step="900" formControlName="heureFin" (focus)="openTimePicker($event)">
            <button mat-icon-button matSuffix type="button" (click)="openTimePicker(finInput)">
              <mat-icon>schedule</mat-icon>
            </button>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Salle</mat-label>
            <input matInput formControlName="salle" placeholder="ex: Salle 204">
          </mat-form-field>

          <div class="date-picker-row">
            <mat-form-field appearance="outline">
              <mat-label>Ajouter une date</mat-label>
              <input matInput type="date" formControlName="dateToAdd">
            </mat-form-field>
            <button mat-stroked-button type="button" (click)="addDateFromInput()">
              <mat-icon>add</mat-icon> Ajouter
            </button>
          </div>

          <div class="dates-panel">
            <div class="dates-title">
              <strong>Dates selectionnees</strong>
              <span>{{ parsedDates().length }} seance(s) a creer</span>
            </div>
            <div class="date-chips" *ngIf="parsedDates().length; else noDates">
              <button class="date-chip" type="button" *ngFor="let date of parsedDates()" (click)="removeDate(date)">
                {{ date | date:'EEE dd/MM':'':'fr' }}
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <ng-template #noDates>
              <p class="no-dates">Ajoute une ou plusieurs dates pour creer plusieurs seances en une fois.</p>
            </ng-template>
          </div>

          <button mat-raised-button color="primary" type="button" [disabled]="form.invalid || !selectedFormationId()" (click)="addSlots()">
            <mat-icon>add</mat-icon> Creer les seances
          </button>
        </form>
      </mat-card-content>
    </mat-card>

    <div *ngIf="loading()" class="loading"><mat-spinner></mat-spinner></div>

    <mat-card class="empty" *ngIf="!loading() && !selectedFormationId()">
      <mat-card-content>Aucune formation active trouvee.</mat-card-content>
    </mat-card>

    <div class="calendar" *ngIf="!loading() && selectedFormationId()">
      <mat-card class="day" *ngFor="let day of calendarDays()">
        <mat-card-header>
          <mat-card-title>{{ day.label }}</mat-card-title>
          <mat-card-subtitle>{{ day.date | date:'dd/MM/yyyy' }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="slot" *ngFor="let item of slotsForDate(day.iso)" [style.borderLeftColor]="slotColor(item)">
            <div class="slot-top">
              <div class="time">{{ item.heureDebut }} - {{ item.heureFin }}</div>
              <span class="status">{{ item.statut || 'PLANIFIE' }}</span>
            </div>
            <strong>{{ moduleTitleForSlot(item) }}</strong>
            <span class="slot-line"><mat-icon>menu_book</mat-icon>{{ item.coursTitre || 'Module programme' }}</span>
            <span class="slot-line" *ngIf="item.salle"><mat-icon>room</mat-icon>{{ item.salle }}</span>
            <span class="slot-line" *ngIf="item.formateurNomComplet"><mat-icon>person</mat-icon>{{ item.formateurNomComplet }}</span>
            <button mat-icon-button color="warn" *ngIf="isAdminView()" (click)="deleteSlot(item.id)">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
          <p class="none" *ngIf="slotsForDate(day.iso).length === 0">Aucune seance</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .planner-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}
    .week-nav{display:flex;align-items:center;gap:8px;color:#1f3a8a;background:#edf3ff;border-radius:999px;padding:4px 8px}
    .week-nav strong{min-width:210px;text-align:center}
    .toolbar-card{margin-bottom:16px}
    .toolbar-card mat-card-content{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}
    .formation-select{width:100%;max-width:460px}
    .selected-formation{display:flex;align-items:center;gap:10px;color:#172033}
    .selected-formation mat-icon{color:#1f3a8a}
    .selected-formation span{display:block;color:#64748b;font-size:12px}
    .selected-formation strong{color:#1f3a8a}
    .summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:16px}
    .summary-card mat-card-content{display:grid;gap:5px;min-height:112px}
    .summary-card mat-icon{color:#0f766e;font-size:30px;width:30px;height:30px}
    .summary-card span{color:#64748b;font-size:13px}
    .summary-card strong{font-size:30px;color:#172033}
    .panel,.day,.empty{border-radius:12px}
    .panel{margin-bottom:16px}
    .schedule-form{display:grid;grid-template-columns:repeat(4,minmax(150px,1fr));gap:14px;align-items:start}
    .date-picker-row{display:flex;gap:10px;align-items:flex-start}
    .date-picker-row mat-form-field{flex:1}
    .dates-panel{grid-column:span 3;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px}
    .dates-title{display:flex;justify-content:space-between;gap:12px;margin-bottom:10px}
    .dates-title span,.no-dates{color:#64748b;font-size:13px;margin:0}
    .date-chips{display:flex;gap:8px;flex-wrap:wrap}
    .date-chip{border:1px solid #bfdbfe;background:#edf3ff;color:#1f3a8a;border-radius:999px;padding:7px 10px;display:inline-flex;align-items:center;gap:6px;cursor:pointer}
    .date-chip mat-icon{font-size:16px;width:16px;height:16px}
    .loading{display:flex;justify-content:center;padding:60px}
    .calendar{display:grid;grid-template-columns:repeat(7,minmax(160px,1fr));gap:12px;margin-top:16px}
    .day{min-height:260px;background:#fff}
    .day mat-card-title{text-transform:capitalize;font-size:15px;color:#172033}
    .slot{position:relative;display:flex;flex-direction:column;gap:6px;border-left:4px solid #3949ab;background:#f8fafc;border-radius:10px;padding:10px 36px 10px 10px;margin-bottom:10px}
    .slot button{position:absolute;right:2px;top:2px}
    .slot-top{display:flex;justify-content:space-between;gap:6px;align-items:center}
    .time{font-weight:800;color:#1f3a8a;font-size:13px}
    .status{font-size:10px;color:#0f766e;background:#ccfbf1;border-radius:999px;padding:3px 7px}
    .slot strong{color:#172033}
    .slot-line{display:flex;align-items:center;gap:5px;color:#64748b;font-size:12px}
    .slot-line mat-icon{font-size:15px;width:15px;height:15px}
    .none{color:#94a3b8;text-align:center;border:1px dashed #cbd5e1;border-radius:10px;padding:22px 8px;margin:0;background:#fbfdff}
    @media(max-width:1180px){.calendar{grid-template-columns:repeat(2,1fr)}.schedule-form{grid-template-columns:1fr 1fr}.dates-panel{grid-column:1/-1}}
    @media(max-width:700px){.calendar,.schedule-form{grid-template-columns:1fr}.planner-head{flex-direction:column}.week-nav strong{min-width:auto}.toolbar-card mat-card-content{align-items:stretch}.date-picker-row{flex-direction:column}.date-picker-row button{width:100%}}
  `]
})
export class EmploiDuTempsComponent implements OnInit {
  private auth = inject(AuthService);
  private etudiantSvc = inject(EtudiantService);
  private formationSvc = inject(FormationService);
  private formateurSvc = inject(FormateurService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  formations = signal<FormationSummary[]>([]);
  formateurs = signal<FormateurSummary[]>([]);
  modules = signal<ModuleResponse[]>([]);
  edt = signal<EmploiDuTempsResponse[]>([]);
  selectedFormationId = signal<string | null>(null);
  selectedModuleId = signal<string | null>(null);
  weekStart = signal(this.startOfWeek(new Date()));
  loading = signal(false);
  isAdminView = computed(() => this.auth.hasRole('ADMIN', 'ADMINISTRATIF', 'RESPONSABLE_FORMATION'));

  form = this.fb.group({
    moduleId: ['', Validators.required],
    formateurId: [null as string | null],
    heureDebut: ['', Validators.required],
    heureFin: ['', Validators.required],
    salle: [''],
    dateToAdd: [''],
    dates: ['', Validators.required]
  });

  selectedFormationLabel = computed(() => this.formations().find(f => f.id === this.selectedFormationId())?.intitule ?? '');
  coursForModule = computed(() => this.modules().find(m => m.id === this.selectedModuleId())?.cours ?? []);
  parsedDates = computed(() => this.parseDates(this.form.value.dates ?? ''));
  calendarDays = computed(() => Array.from({ length: 7 }, (_, i) => {
    const date = new Date(this.weekStart());
    date.setDate(date.getDate() + i);
    return { date, iso: this.toIso(date), label: date.toLocaleDateString('fr-FR', { weekday: 'long' }) };
  }));
  weekSlots = computed(() => this.edt()
    .filter(item => this.calendarDays().some(day => day.iso === item.dateCours))
    .sort((a, b) => `${a.dateCours}${a.heureDebut}`.localeCompare(`${b.dateCours}${b.heureDebut}`)));

  ngOnInit(): void {
    this.loadFormations();
    if (this.isAdminView()) this.loadFormateurs();
    else this.loadStudentFormation();
  }

  loadFormations(): void {
    this.formationSvc.findAll(0, 1000).subscribe({
      next: res => {
        this.formations.set(res.content);
        if (this.isAdminView() && res.content.length) this.selectFormation(res.content[0].id);
      },
      error: () => this.formations.set([])
    });
  }

  loadFormateurs(): void {
    this.formateurSvc.findAll('', 0, 1000).subscribe({
      next: res => this.formateurs.set(res.content),
      error: () => this.formateurs.set([])
    });
  }

  loadStudentFormation(): void {
    const email = this.auth.currentUser()?.email;
    if (!email) return;
    this.loading.set(true);
    this.etudiantSvc.search(email, 0, 1000).subscribe({
      next: res => {
        const etudiant = res.content.find(e => e.email === email);
        if (!etudiant) { this.loading.set(false); return; }
        this.etudiantSvc.findById(etudiant.id).subscribe({
          next: detail => {
            const current = detail.inscriptions.find(i => ['EN_COURS', 'ACTIF'].includes(String(i.statut)));
            if (current) this.selectFormation(current.formationId);
            else this.loading.set(false);
          },
          error: () => this.loading.set(false)
        });
      },
      error: () => this.loading.set(false)
    });
  }

  selectFormation(id: string): void {
    this.selectedFormationId.set(id);
    this.loadEdt(id);
    this.formationSvc.findModules(id).subscribe({
      next: modules => this.modules.set(modules),
      error: () => this.modules.set([])
    });
  }

  selectModule(id: string): void {
    this.selectedModuleId.set(id);
  }

  loadEdt(formationId: string): void {
    this.loading.set(true);
    this.formationSvc.findEdtByFormation(formationId).subscribe({
      next: res => { this.edt.set(res); this.loading.set(false); },
      error: () => { this.edt.set([]); this.loading.set(false); }
    });
  }

  addDateFromInput(): void {
    const date = this.form.value.dateToAdd;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    const dates = [...new Set([...this.parsedDates(), date])].sort();
    this.form.patchValue({ dates: dates.join('\n'), dateToAdd: '' });
  }

  removeDate(date: string): void {
    this.form.patchValue({ dates: this.parsedDates().filter(item => item !== date).join('\n') });
  }

  openTimePicker(target: Event | HTMLInputElement): void {
    const input = target instanceof Event ? target.target as HTMLInputElement : target;
    input.showPicker?.();
  }

  addSlots(): void {
    const formationId = this.selectedFormationId();
    if (!formationId || this.form.invalid) return;
    if (!this.isValidTimeRange()) {
      this.snack.open("L'heure de fin doit etre apres l'heure de debut", 'Fermer', { duration: 4000 });
      return;
    }
    const dates = this.parsedDates();
    if (dates.length === 0) {
      this.snack.open('Ajoute au moins une date valide au format AAAA-MM-JJ', 'Fermer', { duration: 4000 });
      return;
    }

    const coursId = this.coursForModule()[0]?.id ?? null;
    const requests = dates.map(dateCours => this.formationSvc.createEdt({
      formationId,
      dateCours,
      jour: this.dayName(dateCours),
      heureDebut: this.form.value.heureDebut!,
      heureFin: this.form.value.heureFin!,
      salle: this.form.value.salle ?? '',
      coursId,
      formateurId: this.form.value.formateurId
    }));

    forkJoin(requests).subscribe({
      next: () => {
        this.snack.open(`${dates.length} seance(s) creee(s)`, 'OK', { duration: 2500 });
        this.form.patchValue({ dates: '', dateToAdd: '' });
        this.loadEdt(formationId);
      },
      error: (err: any) => this.snack.open(err.error?.message || 'Creation impossible', 'Fermer', { duration: 4000 })
    });
  }

  slotsForDate(date: string): EmploiDuTempsResponse[] {
    return this.edt().filter(item => item.dateCours === date).sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
  }

  moduleTitleForSlot(item: EmploiDuTempsResponse): string {
    const module = this.modules().find(m => m.cours?.some(c => c.id === item.coursId));
    return module?.intitule || item.coursTitre || 'Seance';
  }

  weeklyHours(): number {
    return this.weekSlots().reduce((total, item) => total + this.durationHours(item.heureDebut, item.heureFin), 0);
  }

  activeModulesCount(): number {
    return new Set(this.weekSlots().map(item => this.moduleTitleForSlot(item))).size;
  }

  roomsCount(): number {
    return new Set(this.weekSlots().map(item => item.salle).filter(Boolean)).size;
  }

  slotColor(item: EmploiDuTempsResponse): string {
    const colors = ['#1f3a8a', '#0f766e', '#7c3aed', '#c2410c', '#be123c'];
    const key = this.moduleTitleForSlot(item);
    const index = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }

  changeWeek(delta: number): void {
    const next = new Date(this.weekStart());
    next.setDate(next.getDate() + delta * 7);
    this.weekStart.set(next);
  }

  deleteSlot(id: string): void {
    const formationId = this.selectedFormationId();
    if (!formationId) return;
    this.formationSvc.deleteEdt(id).subscribe({
      next: () => this.loadEdt(formationId),
      error: (err: any) => this.snack.open(err.error?.message || 'Suppression impossible', 'Fermer', { duration: 4000 })
    });
  }

  private durationHours(start?: string, end?: string): number {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const minutes = (eh * 60 + em) - (sh * 60 + sm);
    return minutes > 0 ? Math.round((minutes / 60) * 10) / 10 : 0;
  }

  private isValidTimeRange(): boolean {
    const start = this.form.value.heureDebut;
    const end = this.form.value.heureFin;
    return !!start && !!end && end > start;
  }

  private parseDates(value: string): string[] {
    return [...new Set(value.split(/[\n,; ]+/).map(v => v.trim()).filter(v => /^\d{4}-\d{2}-\d{2}$/.test(v)))].sort();
  }

  private startOfWeek(date: Date): Date {
    const copy = new Date(date);
    const day = copy.getDay() || 7;
    copy.setDate(copy.getDate() - day + 1);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  private dayName(date: string): string {
    return new Date(`${date}T00:00:00`).toLocaleDateString('fr-FR', { weekday: 'long' });
  }

  private toIso(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

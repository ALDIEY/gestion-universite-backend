import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import {
  PageResponse, EtudiantSummary, EtudiantDetail,
  CreateEtudiantRequest, InscriptionRequest, InscriptionResponse,
  FormationSummary, FormationDetail, FormationStats,
  ModuleResponse, CoursResponse, SlotResponse,
  EmploiDuTempsResponse, CreateFormationRequest,
  CreateEmploiDuTempsRequest,
  ReunionSummary, ReunionDetail, CompteRenduResponse,
  NotificationResponse, DocumentAdminResponse, BudgetResponse,
  BudgetSummary, PartenaireResponse, StageResponse, CreateStageRequest, AuthResponse, RegisterRequest
} from '../../shared/models/models';

const API = '/api';

function toPage<T>(items: T[], page: number, size: number): PageResponse<T> {
  const safePage = Math.max(page, 0);
  const safeSize = Math.max(size, 1);
  const start = safePage * safeSize;
  const content = items.slice(start, start + safeSize);

  return {
    content,
    page: safePage,
    size: safeSize,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / safeSize)
  };
}

function toFormationSummary(raw: any): FormationSummary {
  return {
    id: String(raw.id),
    intitule: raw.intitule,
    niveau: raw.niveau,
    typeFormation: raw.typeFormation,
    dateDebut: raw.dateDebut,
    dateFin: raw.dateFin,
    nbEtudiantsInscrits: (raw.nbHommes ?? 0) + (raw.nbFemmes ?? 0),
    nbModules: raw.nbModules ?? raw.modules?.length ?? 0
  };
}

function toFormationDetail(raw: any): FormationDetail {
  const modules = (raw.modules ?? []).map(toModuleResponse);

  return {
    ...toFormationSummary(raw),
    typeFinancement: raw.typeFinancement,
    montant: raw.montant ?? raw.montantFinancement,
    nbPlaces: raw.nbPlaces,
    totalVolumeHoraire: raw.totalVolumeHoraire ?? modules.reduce((total: number, module: ModuleResponse) => total + (module.volumeHoraire ?? 0), 0),
    totalCredits: raw.totalCredits ?? modules.reduce((total: number, module: ModuleResponse) => total + (module.credits ?? 0), 0),
    modules
  };
}

function toModuleResponse(raw: any): ModuleResponse {
  return {
    id: String(raw.id),
    intitule: raw.intitule ?? raw.libelle,
    volumeHoraire: raw.volumeHoraire ?? 0,
    credits: raw.credits ?? 0,
    coefficient: raw.coefficient ?? 1,
    nbCours: raw.nbCours ?? raw.cours?.length ?? 0,
    cours: raw.cours ?? []
  };
}

function toCoursResponse(raw: any): CoursResponse {
  return {
    id: String(raw.id),
    titre: raw.titre,
    typeCours: raw.typeCours,
    description: raw.description,
    documentName: raw.documentName ?? raw.nomDocument,
    documentUrl: raw.documentUrl ?? raw.fichierUrl ?? raw.fichierPath,
    moduleId: raw.moduleId ? String(raw.moduleId) : undefined,
    moduleIntitule: raw.moduleIntitule ?? raw.moduleLibelle ?? '',
    formateurId: raw.formateurId ? String(raw.formateurId) : undefined,
    formateurNomComplet: raw.formateurNomComplet ?? [raw.formateurPrenom, raw.formateurNom].filter(Boolean).join(' ')
  };
}

function toInscriptionResponse(raw: any): InscriptionResponse {
  return {
    id: String(raw.id),
    formationId: String(raw.formationId),
    formationIntitule: raw.formationIntitule ?? raw.intituleFormation,
    anneeDebut: raw.anneeDebut,
    anneeSortie: raw.anneeSortie,
    anneeAcademique: raw.anneeAcademique,
    dateInscription: raw.dateInscription,
    statut: raw.statut ?? 'EN_COURS',
    commentaire: raw.commentaire
  };
}

function toEmploiDuTempsResponse(raw: any): EmploiDuTempsResponse {
  return {
    id: String(raw.id),
    dateCours: raw.dateCours,
    jour: raw.jour,
    heureDebut: raw.heureDebut,
    heureFin: raw.heureFin,
    salle: raw.salle,
    statut: raw.statut,
    coursId: raw.coursId ? String(raw.coursId) : undefined,
    coursTitre: raw.coursTitre,
    typeCours: raw.typeCours,
    formationId: String(raw.formationId),
    formationIntitule: raw.formationIntitule,
    formateurId: raw.formateurId ? String(raw.formateurId) : undefined,
    formateurNomComplet: [raw.formateurPrenom, raw.formateurNom].filter(Boolean).join(' ')
  };
}

function toReunionSummary(raw: any): ReunionSummary {
  const dateHeure = raw.dateHeure ?? (raw.dateReunion && raw.heureDebut ? `${raw.dateReunion}T${raw.heureDebut}` : raw.createdAt);
  return {
    id: String(raw.id),
    objet: raw.objet ?? raw.titre ?? '',
    typeReunion: raw.typeReunion,
    dateHeure,
    lieu: raw.lieu,
    lienVisio: raw.lienVisio,
    nbParticipants: raw.nbParticipants ?? raw.participants?.length ?? 0,
    hasCompteRendu: raw.hasCompteRendu ?? !!raw.compteRendu,
    statut: raw.statut,
    ordreDuJour: raw.ordreDuJour,
    formationId: raw.formationId ? String(raw.formationId) : undefined,
    formationIntitule: raw.formationIntitule ?? raw.formationLibelle
  };
}

function toReunionDetail(raw: any): ReunionDetail {
  return {
    ...toReunionSummary(raw),
    participants: raw.participants ?? [],
    compteRendu: raw.compteRendu ? toCompteRenduResponse(raw.compteRendu) : undefined
  };
}

function toCompteRenduResponse(raw: any): CompteRenduResponse {
  return {
    id: String(raw.id),
    reunionId: raw.reunionId ? String(raw.reunionId) : undefined,
    reunionObjet: raw.reunionObjet ?? raw.reunionTitre,
    redacteurNom: raw.redacteurNom ?? 'Non renseigne',
    contenu: raw.contenu ?? '',
    documentPath: raw.documentPath ?? raw.fichierUrl,
    createdAt: raw.createdAt ?? raw.updatedAt ?? '',
    publie: raw.publie
  };
}

function toNotificationResponse(raw: any): NotificationResponse {
  return {
    id: String(raw.id),
    titre: raw.titre,
    message: raw.message,
    lu: raw.lu ?? false,
    createdAt: raw.createdAt ?? raw.updatedAt ?? '',
    typeNotification: raw.typeNotification
  };
}

function toDocumentAdminResponse(raw: any): DocumentAdminResponse {
  return {
    id: String(raw.id),
    typeDoc: raw.typeDoc ?? raw.typeDocument,
    objet: raw.objet ?? raw.titre,
    reference: raw.reference ?? raw.codeDocument,
    fichierPath: raw.fichierPath ?? raw.fichierUrl,
    dateCreation: raw.dateCreation ?? raw.createdAt,
    statut: raw.statut,
    auteurNom: raw.auteurNom ?? [raw.createdByPrenom, raw.createdByNom].filter(Boolean).join(' ')
  };
}

function toBudgetResponse(raw: any): BudgetResponse {
  return {
    id: String(raw.id),
    annee: Number(raw.annee),
    libelle: raw.libelle ?? raw.noteOrientation ?? `Budget ${raw.annee}`,
    montantPrevu: raw.montantPrevu ?? raw.montantPrevisionnel ?? 0,
    montantRealise: raw.montantRealise ?? 0,
    documentPath: raw.documentPath,
    statut: raw.statut
  };
}

function toBudgetSummary(raw: any): BudgetSummary {
  const ligne = toBudgetResponse(raw);
  const totalPrevu = ligne.montantPrevu ?? 0;
  const totalRealise = ligne.montantRealise ?? 0;
  return {
    annee: ligne.annee,
    totalPrevu,
    totalRealise,
    ecart: raw.ecart ?? totalPrevu - totalRealise,
    lignes: [ligne]
  };
}

function toPartenaireResponse(raw: any): PartenaireResponse {
  return {
    id: String(raw.id),
    nom: raw.nom,
    secteur: raw.secteur ?? raw.domaine,
    contactNom: raw.contactNom ?? raw.contact,
    contactEmail: raw.contactEmail ?? raw.email,
    typePartenariat: raw.typePartenariat ?? raw.typePartenaire,
    actif: raw.actif
  };
}

function toStageResponse(raw: any): StageResponse {
  return {
    id: String(raw.id),
    codeStage: raw.codeStage,
    sujet: raw.sujet,
    typeStage: raw.typeStage,
    dateDebut: raw.dateDebut,
    dateFin: raw.dateFin,
    statut: raw.statut,
    appreciation: raw.appreciation,
    noteFinale: raw.noteFinale,
    etudiantId: raw.etudiantId ? String(raw.etudiantId) : undefined,
    ine: raw.ine,
    nomEtudiant: raw.nomEtudiant,
    prenomEtudiant: raw.prenomEtudiant,
    partenaireId: raw.partenaireId ? String(raw.partenaireId) : undefined,
    partenaireNom: raw.partenaireNom,
    encadrantAcademiqueId: raw.encadrantAcademiqueId ? String(raw.encadrantAcademiqueId) : undefined,
    encadrantNom: raw.encadrantNom,
    encadrantPrenom: raw.encadrantPrenom
  };
}

function toStagePayload(req: Partial<CreateStageRequest>): any {
  return {
    ...req,
    etudiantId: req.etudiantId ? Number(req.etudiantId) : null,
    partenaireId: req.partenaireId ? Number(req.partenaireId) : null,
    encadrantAcademiqueId: req.encadrantAcademiqueId ? Number(req.encadrantAcademiqueId) : null
  };
}

function toEtudiantSummary(raw: any): EtudiantSummary {
  return {
    id: String(raw.id),
    ine: raw.ine,
    nomComplet: raw.nomComplet ?? [raw.prenom, raw.nom].filter(Boolean).join(' '),
    email: raw.email,
    genre: raw.genre ?? raw.sexe,
    actif: raw.actif ?? raw.statut !== 'INACTIF'
  };
}

function toEtudiantDetail(raw: any): EtudiantDetail {
  const inscriptions = raw.inscriptions?.map(toInscriptionResponse) ?? (raw.formationId ? [{
    id: String(raw.formationId),
    formationId: String(raw.formationId),
    formationIntitule: raw.formationIntitule,
    anneeDebut: raw.anneeDebut,
    anneeSortie: raw.anneeSortie,
    statut: raw.statut ?? 'EN_COURS'
  }] : []);

  return {
    ...raw,
    id: String(raw.id),
    genre: raw.genre ?? raw.sexe,
    telephone: raw.telephone ?? '',
    adresse: raw.adresse ?? '',
    createdAt: raw.createdAt ?? '',
    inscriptions,
    diplomes: raw.diplomes ?? []
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// ETUDIANT SERVICE
// ═════════════════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class EtudiantService {
  private url = `${API}/etudiants`;
  private inscriptionUrl = `${API}/inscriptions`;
  constructor(private http: HttpClient) {}

  search(q = '', page = 0, size = 20): Observable<PageResponse<EtudiantSummary>> {
    const query = q.trim().toLowerCase();
    return this.http.get<any[]>(this.url).pipe(
      map(items => items.map(toEtudiantSummary)),
      map(items => query
        ? items.filter(item =>
            [item.ine, item.nomComplet, item.email, item.genre]
              .some(value => (value ?? '').toLowerCase().includes(query)))
        : items),
      map(items => toPage(items, page, size))
    );
  }

  findById(id: string): Observable<EtudiantDetail> {
    return forkJoin({
      etudiant: this.http.get<any>(`${this.url}/${id}`),
      inscriptions: this.findInscriptions(id)
    }).pipe(
      map(({ etudiant, inscriptions }) => toEtudiantDetail({ ...etudiant, inscriptions }))
    );
  }

  findByIne(ine: string): Observable<EtudiantDetail> {
    return this.http.get<any>(`${this.url}/ine/${ine}`).pipe(map(toEtudiantDetail));
  }

  findByFormation(formationId: string, page = 0, size = 100) {
    return this.http.get<any[]>(this.url).pipe(
      map(items => items
        .filter(item => String(item.formationId) === String(formationId))
        .map(toEtudiantSummary)),
      map(items => toPage(items, page, size))
    );
  }

  create(req: CreateEtudiantRequest): Observable<EtudiantDetail> {
    return this.http.post<any>(this.url, this.toEtudiantPayload(req)).pipe(map(toEtudiantDetail));
  }

  update(id: string, req: Partial<CreateEtudiantRequest>): Observable<EtudiantDetail> {
    return this.http.put<any>(`${this.url}/${id}`, this.toEtudiantPayload(req)).pipe(map(toEtudiantDetail));
  }

  toggleActif(id: string): Observable<void> {
    return this.http.get<any>(`${this.url}/${id}`).pipe(
      switchMap(raw => this.http.put<any>(`${this.url}/${id}`, {
        ...this.toEtudiantPayload(raw),
        statut: (raw.actif ?? raw.statut !== 'INACTIF') ? 'INACTIF' : 'ACTIF'
      })),
      map(() => void 0)
    );
  }

  inscrire(id: string, req: InscriptionRequest): Observable<InscriptionResponse> {
    return this.http.post<any>(this.inscriptionUrl, {
      etudiantId: Number(id),
      formationId: Number(req.formationId),
      dateInscription: req.dateInscription ?? new Date().toISOString().split('T')[0],
      anneeAcademique: req.anneeAcademique,
      statut: req.statut ?? 'EN_COURS',
      commentaire: req.commentaire
    }).pipe(map(toInscriptionResponse));
  }

  updateStatutInscription(etudiantId: string, inscriptionId: string,
      req: { statut: string; anneeSortie?: number }): Observable<InscriptionResponse> {
    return this.http.put<any>(`${this.inscriptionUrl}/${inscriptionId}`, req).pipe(map(toInscriptionResponse));
  }

  findInscriptions(etudiantId: string): Observable<InscriptionResponse[]> {
    return this.http.get<any[]>(`${this.inscriptionUrl}/etudiant/${etudiantId}`).pipe(
      map(items => items.map(toInscriptionResponse))
    );
  }

  private toEtudiantPayload(req: Partial<CreateEtudiantRequest>): any {
    const payload: any = { ...req };
    payload.password = payload.password ?? payload.motDePasse;
    payload.sexe = payload.sexe ?? payload.genre;
    if (payload.formationId) payload.formationId = Number(payload.formationId);
    delete payload.motDePasse;
    delete payload.genre;
    delete payload.ine;
    return payload;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// FORMATION SERVICE
// ═════════════════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class FormationService {
  private url = `${API}/formations`;
  private moduleUrl = `${API}/modules-formation`;
  private coursUrl = `${API}/cours`;
  private edtUrl = `${API}/emplois-du-temps`;
  constructor(private http: HttpClient) {}

  findAll(page = 0, size = 20): Observable<PageResponse<FormationSummary>> {
    return this.http.get<any[]>(this.url).pipe(
      map(items => items.map(toFormationSummary)),
      map(items => toPage(items, page, size))
    );
  }

  findById(id: string): Observable<FormationDetail> {
    return forkJoin({
      formation: this.http.get<any>(`${this.url}/${id}`),
      modules: this.findModules(id)
    }).pipe(
      map(({ formation, modules }) => toFormationDetail({ ...formation, modules }))
    );
  }

  getStats(id: string): Observable<FormationStats> {
    return forkJoin({
      formation: this.http.get<any>(`${this.url}/${id}`),
      inscriptions: this.http.get<any[]>(`${API}/inscriptions/formation/${id}`)
    }).pipe(
      map(({ formation, inscriptions }) => ({
        formationId: String(id),
        intitule: formation.intitule,
        nbInscrits: inscriptions.length,
        nbDiplomes: inscriptions.filter(i => String(i.statut) === 'DIPLOME').length,
        nbAbandonnes: inscriptions.filter(i => String(i.statut) === 'ABANDONNE').length,
        nbHommes: formation.nbHommes ?? 0,
        nbFemmes: formation.nbFemmes ?? 0
      }))
    );
  }

  create(req: CreateFormationRequest): Observable<FormationDetail> {
    return this.http.post<any>(this.url, this.toFormationPayload(req)).pipe(map(toFormationDetail));
  }

  update(id: string, req: Partial<CreateFormationRequest>): Observable<FormationDetail> {
    return this.http.put<any>(`${this.url}/${id}`, this.toFormationPayload(req)).pipe(map(toFormationDetail));
  }

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.url}/${id}`, { responseType: 'text' }).pipe(map(() => void 0));
  }

  // Modules
  findModules(formationId: string): Observable<ModuleResponse[]> {
    return this.http.get<any[]>(`${this.moduleUrl}/formation/${formationId}`).pipe(
      map(items => items.map(toModuleResponse)),
      switchMap(modules => modules.length
        ? forkJoin(modules.map(module =>
            this.findCoursByModule(module.id).pipe(
              map(cours => ({ ...module, cours, nbCours: cours.length }))
            )))
        : of([]))
    );
  }

  createModule(req: { formationId: string; intitule: string; volumeHoraire: number; credits: number; coefficient: number }): Observable<ModuleResponse> {
    return this.http.post<any>(this.moduleUrl, {
      formationId: Number(req.formationId),
      libelle: req.intitule,
      volumeHoraire: req.volumeHoraire,
      credits: req.credits,
      coefficient: req.coefficient,
      active: true
    }).pipe(map(toModuleResponse));
  }

  updateModule(moduleId: string, req: { intitule?: string; volumeHoraire?: number; credits?: number; coefficient?: number }): Observable<ModuleResponse> {
    return this.http.put<any>(`${this.moduleUrl}/${moduleId}`, {
      libelle: req.intitule,
      volumeHoraire: req.volumeHoraire,
      credits: req.credits,
      coefficient: req.coefficient
    }).pipe(map(toModuleResponse));
  }

  deleteModule(moduleId: string): Observable<void> {
    return this.http.delete(`${this.moduleUrl}/${moduleId}`, { responseType: 'text' }).pipe(map(() => void 0));
  }

  // Cours
  findCoursByModule(moduleId: string): Observable<CoursResponse[]> {
    return this.http.get<any[]>(`${this.coursUrl}/module/${moduleId}`).pipe(
      map(items => items.map(toCoursResponse))
    );
  }

  createCours(req: { moduleId: string; titre: string; typeCours?: string; description?: string; formateurId?: string | null; document?: File | null }): Observable<CoursResponse> {
    return this.http.post<any>(this.coursUrl, {
      moduleId: Number(req.moduleId),
      titre: req.titre,
      typeCours: req.typeCours,
      description: req.description,
      documentName: req.document?.name,
      formateurId: req.formateurId ? Number(req.formateurId) : null
    }).pipe(map(toCoursResponse));
  }

  deleteCours(coursId: string): Observable<void> {
    return this.http.delete(`${this.coursUrl}/${coursId}`, { responseType: 'text' }).pipe(map(() => void 0));
  }

  // Emploi du temps
  findEdtByFormation(formationId: string): Observable<EmploiDuTempsResponse[]> {
    return this.http.get<any[]>(`${this.edtUrl}/formation/${formationId}`).pipe(
      map(items => items.map(toEmploiDuTempsResponse))
    );
  }

  createEdt(req: CreateEmploiDuTempsRequest): Observable<EmploiDuTempsResponse> {
    return this.http.post<any>(this.edtUrl, {
      ...req,
      formationId: Number(req.formationId),
      coursId: req.coursId ? Number(req.coursId) : null,
      formateurId: req.formateurId ? Number(req.formateurId) : null,
      statut: req.statut ?? 'PLANIFIE'
    }).pipe(map(toEmploiDuTempsResponse));
  }

  deleteEdt(id: string): Observable<void> {
    return this.http.delete(`${this.edtUrl}/${id}`, { responseType: 'text' }).pipe(map(() => void 0));
  }

  getPlanning(formationId: string, debut: string, fin: string): Observable<SlotResponse[]> {
    return this.findEdtByFormation(formationId).pipe(
      map(items => items
        .filter(item => item.dateCours >= debut && item.dateCours <= fin)
        .map(item => ({
          id: item.id,
          dateSlot: item.dateCours,
          heureDebut: item.heureDebut,
          heureFin: item.heureFin,
          cours: {
            id: item.coursId ?? item.id,
            titre: item.coursTitre ?? 'Seance',
            typeCours: item.typeCours,
            moduleIntitule: item.coursTitre ?? item.formationIntitule ?? '',
            formateurNomComplet: item.formateurNomComplet ?? ''
          }
        })))
    );
  }

  getPlanningFormateur(formateurId: string, debut: string, fin: string): Observable<SlotResponse[]> {
    return this.http.get<any[]>(this.edtUrl).pipe(
      map(items => items
        .map(toEmploiDuTempsResponse)
        .filter(item => item.formateurId === String(formateurId))
        .filter(item => item.dateCours >= debut && item.dateCours <= fin)
        .map(item => ({
          id: item.id,
          dateSlot: item.dateCours,
          heureDebut: item.heureDebut,
          heureFin: item.heureFin,
          cours: {
            id: item.coursId ?? item.id,
            titre: item.coursTitre ?? 'Seance',
            typeCours: item.typeCours,
            moduleIntitule: item.coursTitre ?? item.formationIntitule ?? '',
            formateurNomComplet: item.formateurNomComplet ?? ''
          }
        })))
    );
  }

  private toFormationPayload(req: Partial<CreateFormationRequest>): any {
    const payload: any = { ...req };
    payload.montantFinancement = payload.montantFinancement ?? payload.montant;
    delete payload.montant;
    delete payload.nbPlaces;
    return payload;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// COMMUNICATION SERVICE
// ═════════════════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class CommunicationService {
  private reunionsUrl = `${API}/reunions`;
  private comptesRendusUrl = `${API}/comptes-rendus`;
  private notificationsUrl = `${API}/notifications`;
  constructor(private http: HttpClient, private auth: AuthService) {}

  findReunions(type: string, page = 0, size = 20): Observable<PageResponse<ReunionSummary>> {
    const source = type ? `${this.reunionsUrl}/type/${type}` : this.reunionsUrl;
    return this.http.get<any[]>(source).pipe(
      map(items => items.map(toReunionSummary)),
      map(items => toPage(items, page, size))
    );
  }

  findReunion(id: string): Observable<ReunionDetail> {
    return this.http.get<any>(`${this.reunionsUrl}/${id}`).pipe(map(toReunionDetail));
  }

  mesReunions(page = 0, size = 20): Observable<PageResponse<ReunionSummary>> {
    return this.http.get<any[]>(this.reunionsUrl).pipe(
      map(items => items.map(toReunionSummary)),
      map(items => toPage(items, page, size))
    );
  }

  createReunion(req: any): Observable<ReunionDetail> {
    return this.http.post<any>(this.reunionsUrl, req).pipe(map(toReunionDetail));
  }

  findCompteRendus(page = 0, size = 20): Observable<PageResponse<CompteRenduResponse>> {
    return this.http.get<any[]>(this.comptesRendusUrl).pipe(
      map(items => items.map(toCompteRenduResponse)),
      map(items => toPage(items, page, size))
    );
  }

  createCompteRendu(req: { titre?: string; reunionId?: string | null; contenu: string; fichierUrl?: string; publie?: boolean }): Observable<CompteRenduResponse> {
    return this.http.post<any>(this.comptesRendusUrl, {
      ...req,
      reunionId: req.reunionId ? Number(req.reunionId) : null
    }).pipe(map(toCompteRenduResponse));
  }

  mesNotifications(page = 0, size = 20): Observable<PageResponse<NotificationResponse>> {
    const userId = this.auth.currentUser()?.id;
    const source = userId ? `${this.notificationsUrl}/user/${userId}` : this.notificationsUrl;
    return this.http.get<any[]>(source).pipe(
      map(items => items.map(toNotificationResponse)),
      map(items => toPage(items, page, size))
    );
  }

  countNonLus(): Observable<{ nonLus: number }> {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return of({ nonLus: 0 });
    return this.http.get<number>(`${this.notificationsUrl}/user/${userId}/unread/count`).pipe(
      map(nonLus => ({ nonLus }))
    );
  }

  markAsRead(id: string): Observable<void> {
    return this.http.patch(`${this.notificationsUrl}/${id}/read`, {}, { responseType: 'text' }).pipe(map(() => void 0));
  }

  markAllAsRead(): Observable<void> {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return of(void 0);
    return this.http.get<any[]>(`${this.notificationsUrl}/user/${userId}/unread`).pipe(
      switchMap(items => items.length
        ? forkJoin(items.map(item => this.markAsRead(String(item.id)))).pipe(map(() => void 0))
        : of(void 0))
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// ADMINISTRATION SERVICE
// ═════════════════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class AdministrationService {
  private documentsUrl = `${API}/documents`;
  private budgetsUrl = `${API}/budgets`;
  private partenairesUrl = `${API}/partenaires`;
  private stagesUrl = `${API}/stages`;
  private authUrl = `${API}/auth`;
  constructor(private http: HttpClient) {}

  searchDocuments(q = '', page = 0, size = 50): Observable<PageResponse<DocumentAdminResponse>> {
    const query = q.trim().toLowerCase();
    return this.http.get<any[]>(this.documentsUrl).pipe(
      map(items => items.map(toDocumentAdminResponse)),
      map(items => query
        ? items.filter(item => [item.typeDoc, item.objet, item.reference, item.statut, item.auteurNom]
          .some(value => (value ?? '').toLowerCase().includes(query)))
        : items),
      map(items => toPage(items, page, size))
    );
  }

  createDocument(req: any): Observable<DocumentAdminResponse> {
    return this.http.post<any>(this.documentsUrl, req).pipe(map(toDocumentAdminResponse));
  }

  publierDocument(id: string): Observable<DocumentAdminResponse> {
    return this.http.patch<any>(`${this.documentsUrl}/${id}/publish`, {}).pipe(map(toDocumentAdminResponse));
  }

  archiverDocument(id: string): Observable<DocumentAdminResponse> {
    return this.http.patch<any>(`${this.documentsUrl}/${id}/archive`, {}).pipe(map(toDocumentAdminResponse));
  }

  getBudgetSummary(annee: number): Observable<BudgetSummary> {
    return this.http.get<any>(`${this.budgetsUrl}/annee/${annee}`).pipe(map(toBudgetSummary));
  }

  createBudget(req: any): Observable<any> {
    return this.http.post<any>(this.budgetsUrl, req).pipe(map(toBudgetResponse));
  }

  searchPartenaires(q = '', page = 0, size = 50): Observable<PageResponse<PartenaireResponse>> {
    const query = q.trim().toLowerCase();
    return this.http.get<any[]>(this.partenairesUrl).pipe(
      map(items => items.map(toPartenaireResponse)),
      map(items => query
        ? items.filter(item => [item.nom, item.secteur, item.contactNom, item.contactEmail, item.typePartenariat]
          .some(value => (value ?? '').toLowerCase().includes(query)))
        : items),
      map(items => toPage(items, page, size))
    );
  }

  createPartenaire(req: any): Observable<PartenaireResponse> {
    return this.http.post<any>(this.partenairesUrl, req).pipe(map(toPartenaireResponse));
  }

  findStages(page = 0, size = 50): Observable<PageResponse<StageResponse>> {
    return this.http.get<any[]>(this.stagesUrl).pipe(
      map(items => items.map(toStageResponse)),
      map(items => toPage(items, page, size))
    );
  }

  findStagesByEtudiant(etudiantId: string, page = 0, size = 50): Observable<PageResponse<StageResponse>> {
    return this.http.get<any[]>(`${this.stagesUrl}/etudiant/${etudiantId}`).pipe(
      map(items => items.map(toStageResponse)),
      map(items => toPage(items, page, size))
    );
  }

  findStagesByPartenaire(partenaireId: string, page = 0, size = 50): Observable<PageResponse<StageResponse>> {
    return this.http.get<any[]>(`${this.stagesUrl}/partenaire/${partenaireId}`).pipe(
      map(items => items.map(toStageResponse)),
      map(items => toPage(items, page, size))
    );
  }

  findStagesByStatut(statut: string, page = 0, size = 50): Observable<PageResponse<StageResponse>> {
    return this.http.get<any[]>(`${this.stagesUrl}/statut/${statut}`).pipe(
      map(items => items.map(toStageResponse)),
      map(items => toPage(items, page, size))
    );
  }

  createStage(req: CreateStageRequest): Observable<StageResponse> {
    return this.http.post<any>(this.stagesUrl, toStagePayload(req)).pipe(map(toStageResponse));
  }

  updateStage(id: string, req: Partial<CreateStageRequest>): Observable<StageResponse> {
    return this.http.put<any>(`${this.stagesUrl}/${id}`, toStagePayload(req)).pipe(map(toStageResponse));
  }

  deleteStage(id: string): Observable<void> {
    return this.http.delete(`${this.stagesUrl}/${id}`, { responseType: 'text' }).pipe(map(() => void 0));
  }

  createUser(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/register`, {
      nom: req.nom,
      prenom: req.prenom,
      email: req.email,
      password: req.password ?? req.motDePasse,
      telephone: req.telephone,
      role: req.role
    });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  PageResponse, FormateurSummary, FormateurDetail,
  CreateFormateurRequest, UpdateFormateurRequest,
  CoursResponse, SlotResponse
} from '../../shared/models/models';

const API = '/api';

function toPage<T>(items: T[], page: number, size: number): PageResponse<T> {
  const safePage = Math.max(page, 0);
  const safeSize = Math.max(size, 1);
  const start = safePage * safeSize;

  return {
    content: items.slice(start, start + safeSize),
    page: safePage,
    size: safeSize,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / safeSize)
  };
}

function toFormateurSummary(raw: any): FormateurSummary {
  return {
    id: String(raw.id),
    nomComplet: raw.nomComplet ?? [raw.prenom, raw.nom].filter(Boolean).join(' '),
    email: raw.email,
    typeFormateur: raw.typeFormateur,
    specialite: raw.specialite,
    actif: raw.actif ?? raw.statut !== 'INACTIF'
  };
}

function toFormateurDetail(raw: any): FormateurDetail {
  return {
    id: String(raw.id),
    utilisateurId: String(raw.utilisateurId ?? raw.userId ?? ''),
    nomComplet: raw.nomComplet ?? [raw.prenom, raw.nom].filter(Boolean).join(' '),
    email: raw.email,
    typeFormateur: raw.typeFormateur,
    specialite: raw.specialite,
    biographie: raw.biographie,
    cvPath: raw.cvPath,
    cours: raw.cours ?? [],
    formationIds: raw.formationIds?.map(String) ?? []
  };
}

@Injectable({ providedIn: 'root' })
export class FormateurService {
  private url = `${API}/formateurs`;
  constructor(private http: HttpClient) {}

  findAll(q = '', page = 0, size = 20): Observable<PageResponse<FormateurSummary>> {
    const query = q.trim().toLowerCase();
    return this.http.get<any[]>(this.url).pipe(
      map(items => items.map(toFormateurSummary)),
      map(items => query
        ? items.filter(item =>
            [item.nomComplet, item.email, item.specialite, item.typeFormateur]
              .some(value => (value ?? '').toLowerCase().includes(query)))
        : items),
      map(items => toPage(items, page, size))
    );
  }

  findById(id: string): Observable<FormateurDetail> {
    return this.http.get<any>(`${this.url}/${id}`).pipe(map(toFormateurDetail));
  }

  create(req: CreateFormateurRequest): Observable<FormateurDetail> {
    return this.http.post<any>(this.url, this.toPayload(req)).pipe(map(toFormateurDetail));
  }

  update(id: string, req: UpdateFormateurRequest): Observable<FormateurDetail> {
    return this.http.put<any>(`${this.url}/${id}`, this.toPayload(req)).pipe(map(toFormateurDetail));
  }

  toggleActif(id: string): Observable<void> {
    return this.http.get<any>(`${this.url}/${id}`).pipe(
      switchMap(raw => this.http.put<any>(`${this.url}/${id}`, {
        ...this.toPayload(raw),
        statut: (raw.actif ?? raw.statut !== 'INACTIF') ? 'INACTIF' : 'ACTIF'
      })),
      map(() => void 0)
    );
  }

  getCours(formateurId: string): Observable<CoursResponse[]> {
    return this.http.get<any[]>(`${API}/cours/formateur/${formateurId}`).pipe(
      map(items => items.map(item => ({
        id: String(item.id),
        titre: item.titre,
        typeCours: item.typeCours,
        description: item.description,
        moduleId: item.moduleId ? String(item.moduleId) : undefined,
        moduleIntitule: item.moduleIntitule ?? item.moduleLibelle ?? '',
        formateurId: item.formateurId ? String(item.formateurId) : undefined,
        formateurNomComplet: item.formateurNomComplet ?? [item.formateurPrenom, item.formateurNom].filter(Boolean).join(' ')
      })))
    );
  }

  getPlanning(formateurId: string, debut: string, fin: string): Observable<SlotResponse[]> {
    return this.http.get<any[]>(`${API}/emplois-du-temps`).pipe(
      map(items => items
        .filter(item => String(item.formateurId) === String(formateurId))
        .filter(item => item.dateCours >= debut && item.dateCours <= fin)
        .map(item => ({
          id: String(item.id),
          dateSlot: item.dateCours,
          heureDebut: item.heureDebut,
          heureFin: item.heureFin,
          cours: {
            id: item.coursId ? String(item.coursId) : String(item.id),
            titre: item.coursTitre ?? 'Seance',
            typeCours: item.typeCours,
            moduleIntitule: item.coursTitre ?? item.formationIntitule ?? '',
            formateurNomComplet: [item.formateurPrenom, item.formateurNom].filter(Boolean).join(' ')
          }
        })))
    );
  }

  private toPayload(req: CreateFormateurRequest | UpdateFormateurRequest): any {
    const payload: any = { ...req };
    payload.password = payload.password ?? payload.motDePasse;
    if (payload.formationIds) {
      payload.formationIds = payload.formationIds.map((id: string | number) => Number(id));
    }
    if (payload.moduleIds) {
      payload.moduleIds = payload.moduleIds.map((id: string | number) => Number(id));
    }
    delete payload.motDePasse;
    return payload;
  }
}

export type Role = 'ADMIN'|'ADMINISTRATIF'|'ENSEIGNANT'|'ENSEIGNANT_ASSOCIE'|'RESPONSABLE_FORMATION'|'TUTEUR'|'ETUDIANT'|'APPUI_INSERTION';
export type TypeFormation = 'INITIALE'|'CONTINUE'|'CERTIFICATION'|'PRIVEE';
export type TypeFinancement = 'PUBLIC'|'PRIVE'|'MIXTE'|'BOURSE';
export type TypeSeance = 'CM'|'TD'|'TP'|'EXAMEN'|'DEVOIR';
export type TypeFormateur = 'ENSEIGNANT'|'ENSEIGNANT_ASSOCIE'|'RESPONSABLE_FORMATION'|'TUTEUR';
export type TypeReunion = 'REUNION_EQUIPE'|'RENCONTRE'|'SEMINAIRE'|'WEBINAIRE'|'CONSEIL_UNIVERSITE'|'PREPARATION_COURS'|'SUIVI_TUTORAT'|'PREPARATION_EVAL';
export type StatutInscription = 'EN_COURS'|'DIPLOME'|'ABANDONNE'|'SUSPENDU';

export interface PageResponse<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; }
export interface AuthResponse {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  user: UserInfo;
}
export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { nom: string; prenom: string; email: string; motDePasse: string; role?: Role; }
export interface UserInfo {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  actif?: boolean;
  role?: Role;
  roles?: Role[];
}

export interface CoursResponse { id: string; titre: string; typeCours?: string; description?: string; documentName?: string; documentUrl?: string; moduleId?: string; moduleIntitule: string; formateurId?: string; formateurNomComplet: string; typeSeance?: TypeSeance; dateHeure?: string; dureeMin?: number; salle?: string; }
export interface SlotResponse { id: string; dateSlot: string; heureDebut: string; heureFin: string; cours: CoursResponse; }
export interface ModuleResponse { id: string; intitule: string; volumeHoraire: number; credits: number; coefficient: number; nbCours: number; cours?: CoursResponse[]; }
export interface EmploiDuTempsResponse { id: string; dateCours: string; jour: string; heureDebut: string; heureFin: string; salle?: string; statut?: string; coursId?: string; coursTitre?: string; typeCours?: string; formationId: string; formationIntitule: string; formateurId?: string; formateurNomComplet?: string; }
export interface CreateEmploiDuTempsRequest { dateCours: string; jour: string; heureDebut: string; heureFin: string; salle?: string; statut?: string; coursId?: string | null; formationId: string; formateurId?: string | null; }

export interface InscriptionResponse { id: string; formationId: string; formationIntitule: string; anneeDebut?: number; anneeSortie?: number; anneeAcademique?: string; dateInscription?: string; statut: StatutInscription | string; commentaire?: string; }
export interface InscriptionRequest { formationId: string; etudiantId?: string; anneeDebut?: number; anneeAcademique?: string; dateInscription?: string; statut?: string; commentaire?: string; }
export interface DiplomeResponse { id: string; intitule: string; anneeObtention: number; etablissement: string; documentPath?: string; }

export interface EtudiantSummary { id: string; ine: string; nomComplet: string; email: string; genre: string; actif: boolean; }
export interface EtudiantDetail { id: string; ine: string; nom: string; prenom: string; email: string; dateNaissance: string; genre: string; telephone: string; adresse: string; photoProfil?: string; createdAt: string; inscriptions: InscriptionResponse[]; diplomes: DiplomeResponse[]; }
export interface CreateEtudiantRequest { nom: string; prenom: string; email: string; motDePasse: string; ine?: string; dateNaissance?: string; genre?: string; telephone?: string; adresse?: string; formationId?: string | number | null; }

export interface FormationSummary { id: string; intitule: string; niveau: string; typeFormation: TypeFormation; dateDebut: string; dateFin: string; nbEtudiantsInscrits: number; nbModules: number; }
export interface FormationDetail { id: string; intitule: string; niveau: string; typeFormation: TypeFormation; typeFinancement: TypeFinancement; dateDebut: string; dateFin: string; montant?: number; nbPlaces?: number; totalVolumeHoraire: number; totalCredits: number; modules: ModuleResponse[]; }
export interface FormationStats { formationId: string; intitule: string; nbInscrits: number; nbDiplomes: number; nbAbandonnes: number; nbHommes: number; nbFemmes: number; }
export interface CreateFormationRequest { intitule: string; typeFormation?: TypeFormation; niveau: string; dateDebut?: string; dateFin?: string; montant?: number; typeFinancement?: TypeFinancement; nbPlaces?: number; }

// FORMATEUR
export interface FormateurSummary { id: string; nomComplet: string; email: string; typeFormateur: TypeFormateur; specialite?: string; actif: boolean; }
export interface FormateurDetail { id: string; utilisateurId: string; nomComplet: string; email: string; typeFormateur: TypeFormateur; specialite?: string; biographie?: string; cvPath?: string; cours: CoursResponse[]; formationIds?: string[]; }
export interface CreateFormateurRequest { nom: string; prenom: string; email: string; motDePasse: string; telephone?: string; typeFormateur: TypeFormateur; specialite?: string; biographie?: string; formationIds?: Array<string | number>; moduleIds?: Array<string | number>; }
export interface UpdateFormateurRequest { nom?: string; prenom?: string; email?: string; telephone?: string; typeFormateur?: TypeFormateur; specialite?: string; biographie?: string; formationIds?: Array<string | number>; moduleIds?: Array<string | number>; }

// COMMUNICATION
export interface ReunionSummary { id: string; objet: string; typeReunion: TypeReunion; dateHeure: string; lieu?: string; lienVisio?: string; nbParticipants: number; hasCompteRendu: boolean; statut?: string; ordreDuJour?: string; formationId?: string; formationIntitule?: string; }
export interface ReunionDetail extends ReunionSummary { participants: any[]; compteRendu?: CompteRenduResponse; }
export interface CompteRenduResponse { id: string; reunionId?: string; reunionObjet?: string; redacteurNom: string; contenu: string; documentPath?: string; createdAt: string; publie?: boolean; }
export interface NotificationResponse { id: string; titre: string; message: string; lu: boolean; createdAt: string; typeNotification?: string; }

// ADMINISTRATION
export interface DocumentAdminResponse { id: string; typeDoc: string; objet: string; reference?: string; fichierPath?: string; dateCreation: string; statut: string; auteurNom: string; }
export interface BudgetResponse { id: string; annee: number; libelle: string; montantPrevu?: number; montantRealise?: number; documentPath?: string; statut?: string; }
export interface BudgetSummary { annee: number; totalPrevu: number; totalRealise: number; ecart: number; lignes: BudgetResponse[]; }
export interface PartenaireResponse { id: string; nom: string; secteur?: string; contactNom?: string; contactEmail?: string; typePartenariat?: string; actif?: boolean; }
export interface StageResponse { id: string; codeStage?: string; sujet: string; typeStage?: string; dateDebut?: string; dateFin?: string; statut?: string; appreciation?: string; noteFinale?: number; etudiantId?: string; ine?: string; nomEtudiant?: string; prenomEtudiant?: string; partenaireId?: string; partenaireNom?: string; encadrantAcademiqueId?: string; encadrantNom?: string; encadrantPrenom?: string; }
export interface CreateStageRequest { sujet: string; typeStage?: string; dateDebut?: string; dateFin?: string; statut?: string; appreciation?: string; noteFinale?: number; etudiantId?: string | number | null; partenaireId?: string | number | null; encadrantAcademiqueId?: string | number | null; }

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  password?: string;
  telephone?: string;
  role?: Role;
}

// ── MODÈLES UTILISATEURS ──────────────────────

export type ProfilUtilisateur = 'lecteur' | 'operateur' | 'superviseur' | 'administrateur';
export type StatutUtilisateur = 'actif' | 'inactif' | 'suspendu';

export interface Utilisateur {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  departement: string;
  poste?: string;
  username: string;
  profil: ProfilUtilisateur;
  statut: StatutUtilisateur;
  dateExpiration?: string;
  auth2fa: boolean;
  droits?: DroitsModule;
  derniereConnexion?: string;
  activiteRecente?: ActiviteUtilisateur[];
}

export interface DroitsModule {
  virements:      PermissionCRUD;
  messagesMx:     PermissionCRUD;
  rapprochement:  PermissionCRUD;
  tableauxBord:   PermissionCRUD;
  administration: PermissionCRUD;
}

export interface PermissionCRUD {
  lire:     boolean;
  creer:    boolean;
  modifier: boolean;
  supprimer: boolean;
  valider:  boolean;
}

export interface ActiviteUtilisateur {
  action: string;
  date: string;
  statut: 'done' | 'active' | 'pending';
}

export interface FiltreUtilisateur {
  nom?: string;
  departement?: string;
  profil?: ProfilUtilisateur | '';
  statut?: StatutUtilisateur | '';
}

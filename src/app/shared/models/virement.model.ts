// ── MODÈLES VIREMENTS ─────────────────────────

export type StatutVirement = 'rapproche' | 'non-rapproche' | 'en-attente';
export type DirectionVirement = 'emis' | 'recus';

export interface Virement {
  id: string;
  reference: string;
  direction: DirectionVirement;
  statut: StatutVirement;
  emetteur: PartieBancaire;
  beneficiaire: PartieBancaire;
  montant: number;
  devise: string;
  sop: string;
  dateValeur: string;
  dateCreation: string;
  motif?: string;
  messagesMx?: MessageMx[];
  historique?: EtapeHistorique[];
}

export interface PartieBancaire {
  banque: string;
  bic: string;
  iban: string;
}

export interface MessageMx {
  id: string;
  typeMessage: string;     // ex: pacs.008.001.09
  msgId: string;
  dateHeure: string;
  statut: 'envoye' | 'acquitte' | 'erreur';
  xmlContent?: string;
  accuseReception?: string;
  network: string;
}

export interface EtapeHistorique {
  titre: string;
  date: string;
  statut: 'done' | 'active' | 'pending';
}

export interface FiltreVirement {
  reference?: string;
  sop?: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: StatutVirement | '';
  emetteurBic?: string;
  montantMin?: number;
  montantMax?: number;
  compteBeneficiaire?: string;
  compteDonneurOrdre?: string;
  direction?: DirectionVirement | 'tous';
}

export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ── CONSTANTES GLOBALES BMCE ──────────────────

export const APP_NAME    = 'AGGMA';
export const APP_SUBTITLE = 'Bank of Africa · BMCE Group';
export const APP_LOGO    = 'logo-bmce.png';

export const SOP_LIST = ['SOP-001', 'SOP-002', 'SOP-003'];

export const DEPARTEMENTS = [
  'Règlements', 'Trésorerie', 'Contrôle', 'Informatique', 'Direction'
];

export const PROFILS_LABELS: Record<string, string> = {
  lecteur:        'Lecteur',
  operateur:      'Opérateur',
  superviseur:    'Superviseur',
  administrateur: 'Administrateur'
};

export const STATUT_VIREMENT_LABELS: Record<string, string> = {
  'rapproche':     'Rapproché',
  'non-rapproche': 'Non rapproché',
  'en-attente':    'En attente'
};

export const STATUT_VIREMENT_BADGE: Record<string, string> = {
  'rapproche':     'badge--green',
  'non-rapproche': 'badge--red',
  'en-attente':    'badge--orange'
};

export const STATUT_USER_BADGE: Record<string, string> = {
  'actif':    'badge--green',
  'inactif':  'badge--gray',
  'suspendu': 'badge--orange'
};

export const PROFIL_BADGE: Record<string, string> = {
  'lecteur':        'badge--gray',
  'operateur':      'badge--navy',
  'superviseur':    'badge--orange',
  'administrateur': 'badge--red'
};

export const PAGE_SIZE = 10;

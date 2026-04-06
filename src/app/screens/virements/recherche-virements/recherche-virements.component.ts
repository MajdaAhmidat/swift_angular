import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { FiltreVirement } from '../../../shared/models/virement.model';
import {
  SopApi,
  VirementEmisApi,
  VirementRecuApi,
  VirementsService
} from '../../../shared/services/virements.service';

type DirectionFilter = 'tous' | 'emis' | 'recus';
type StatutFilter    = 'tous' | 'rapproche' | 'non-rapproche' | 'en-attente';

@Component({
  selector: 'app-recherche-virements',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TopbarComponent],
  templateUrl: './recherche-virements.component.html',
  styleUrls:   ['./recherche-virements.component.scss']
})
export class RechercheVirementsComponent implements OnInit {

  filtre: FiltreVirement = {
    reference: '', sop: '', dateDebut: '', dateFin: '',
    statut: '', emetteurBic: '', montantMin: undefined, montantMax: undefined,
    compteBeneficiaire: '', compteDonneurOrdre: '', direction: 'tous'
  };

  directionActive = signal<DirectionFilter>('tous');
  statutActif     = signal<StatutFilter>('tous');

  loading = false;
  error = '';
  virements: SearchVirementRow[] = [];
  sops: string[] = [];

  constructor(
    private virementsService: VirementsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadVirements();
  }

  private loadVirements(): void {
    this.loading = true;
    this.error = '';
    this.virementsService.getRecherchePayload().subscribe({
      next: ({ emis, recus, sops }) => {
        const sopMap = this.buildSopMap(sops);
        const mappedEmis = emis.map((v) => this.mapEmis(v, sopMap));
        const mappedRecus = recus.map((v) => this.mapRecus(v, sopMap));
        this.virements = [...mappedEmis, ...mappedRecus]
          .sort((a, b) => b.sortId - a.sortId);
        this.sops = Array.from(new Set(this.virements.map(v => v.sop))).sort();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.error = 'Impossible de charger les virements.';
        this.cdr.detectChanges();
      }
    });
  }

  get virementsFiltres() {
    return this.virements.filter((v) => {
      const ref = (this.filtre.reference || '').trim().toLowerCase();
      const sop = (this.filtre.sop || '').trim();
      const emetteurBic = (this.filtre.emetteurBic || '').trim().toLowerCase();
      const cpteBnf = (this.filtre.compteBeneficiaire || '').trim().toLowerCase();
      const cpteOrd = (this.filtre.compteDonneurOrdre || '').trim().toLowerCase();
      const statutSelect = (this.filtre.statut || '').trim() as StatutFilter | '';
      const min = this.filtre.montantMin;
      const max = this.filtre.montantMax;
      const dateDebut = this.filtre.dateDebut ? new Date(this.filtre.dateDebut) : null;
      const dateFin = this.filtre.dateFin ? new Date(this.filtre.dateFin) : null;
      const dir = this.directionActive();
      const st  = this.statutActif();
      const matchDir    = dir === 'tous' || v.direction === dir;
      const matchStatut = st  === 'tous' || v.statut    === st;
      const matchStatutSelect = !statutSelect || v.statut === statutSelect;
      const matchRef = !ref || v.ref.toLowerCase().includes(ref);
      const matchSop = !sop || v.sop === sop;
      const matchBic = !emetteurBic || (v.emetteurBic || '').toLowerCase().includes(emetteurBic);
      const matchCpteBnf = !cpteBnf || (v.beneficiaireIban || '').toLowerCase().includes(cpteBnf);
      const matchCpteOrd = !cpteOrd || (v.compteDonneurOrdre || '').toLowerCase().includes(cpteOrd);
      const matchMin = min == null || v.montant >= min;
      const matchMax = max == null || v.montant <= max;
      const matchDateDebut = !dateDebut || v.dateIso >= dateDebut;
      const matchDateFin = !dateFin || v.dateIso <= dateFin;
      return matchDir
          && matchStatut
          && matchStatutSelect
          && matchRef
          && matchSop
          && matchBic
          && matchCpteBnf
          && matchCpteOrd
          && matchMin
          && matchMax
          && matchDateDebut
          && matchDateFin;
    });
  }

  get countEmis()  { return this.virements.filter(v => v.direction === 'emis').length; }
  get countRecus() { return this.virements.filter(v => v.direction === 'recus').length; }

  setDirection(d: DirectionFilter) { this.directionActive.set(d); }
  setStatut(s: StatutFilter)       { this.statutActif.set(s); }

  badgeClass(statut: string): string {
    return statut === 'rapproche' ? 'badge--green'
         : statut === 'non-rapproche' ? 'badge--red'
         : 'badge--orange';
  }

  badgeLabel(statut: string): string {
    return statut === 'rapproche' ? 'Rapproché'
         : statut === 'non-rapproche' ? 'Non rapproché'
         : 'En attente';
  }

  resetFiltre() {
    this.filtre = {
      reference:'', sop:'', dateDebut:'', dateFin:'',
      statut:'', emetteurBic:'', montantMin:undefined, montantMax:undefined,
      compteBeneficiaire:'', compteDonneurOrdre:'', direction:'tous'
    };
  }

  get totalMontant(): number {
    return this.virements.reduce((sum, v) => sum + (v.montant || 0), 0);
  }

  get countRapproches(): number {
    return this.virements.filter(v => v.statut === 'rapproche').length;
  }

  get countNonRapproches(): number {
    return this.virements.filter(v => v.statut === 'non-rapproche').length;
  }

  private buildSopMap(sops: SopApi[]): Map<number, string> {
    const map = new Map<number, string>();
    (sops || []).forEach((sop) => {
      if (sop && sop.id != null) {
        map.set(sop.id, (sop.libelleSop || '').trim() || `SOP-${sop.id}`);
      }
    });
    return map;
  }

  private mapEmis(v: VirementEmisApi, sopMap: Map<number, string>): SearchVirementRow {
    return {
      id: String(v.idVrtEmis),
      sortId: v.idVrtEmis || 0,
      ref: v.reference || '',
      direction: 'emis',
      emetteur: v.denominationOrd || '',
      emetteurBic: v.bicOrdonnateur || '',
      beneficiaire: v.denominationBnf || '',
      beneficiaireIban: v.numCompteBnf || '',
      compteDonneurOrdre: v.numCompteOrd || '',
      montant: Number(v.montant || 0),
      sop: sopMap.get(v.idSop) || `SOP-${v.idSop}`,
      date: this.formatDate(v.dateValeur),
      dateIso: this.toDate(v.dateValeur),
      statut: this.mapEmisStatut(v.statutSwift)
    };
  }

  private mapRecus(v: VirementRecuApi, sopMap: Map<number, string>): SearchVirementRow {
    return {
      id: String(v.idVrtRecu),
      sortId: v.idVrtRecu || 0,
      ref: v.reference || '',
      direction: 'recus',
      emetteur: v.denominationOrd || '',
      emetteurBic: v.bicOrdonnateur || '',
      beneficiaire: v.denominationBnf || '',
      beneficiaireIban: v.numCompteBnf || '',
      compteDonneurOrdre: v.numCompteOrd || '',
      montant: Number(v.montant || 0),
      sop: sopMap.get(v.idSop) || `SOP-${v.idSop}`,
      date: this.formatDate(v.dateValeur),
      dateIso: this.toDate(v.dateValeur),
      statut: this.mapRecuStatut(v.statutRapprochement)
    };
  }

  private mapEmisStatut(statutSwift?: string): 'rapproche' | 'non-rapproche' | 'en-attente' {
    const s = (statutSwift || '').trim().toUpperCase();
    if (s === 'ACK') {
      return 'rapproche';
    }
    if (s === 'NACK') {
      return 'non-rapproche';
    }
    return 'en-attente';
  }

  private mapRecuStatut(statutRapprochement?: string): 'rapproche' | 'non-rapproche' | 'en-attente' {
    const s = (statutRapprochement || '').trim().toUpperCase();
    if (s === 'RAPPROCHE') {
      return 'rapproche';
    }
    if (s === 'NON_RAPPROCHE') {
      return 'non-rapproche';
    }
    return 'en-attente';
  }

  private toDate(value?: string): Date {
    if (!value) {
      return new Date(0);
    }
    const date = new Date(value);
    return isNaN(date.getTime()) ? new Date(0) : date;
  }

  private formatDate(value?: string): string {
    const date = this.toDate(value);
    if (date.getTime() === 0) {
      return '';
    }
    return date.toLocaleDateString('fr-FR');
  }
}

type SearchVirementRow = {
  id: string;
  sortId: number;
  ref: string;
  direction: 'emis' | 'recus';
  emetteur: string;
  emetteurBic: string;
  beneficiaire: string;
  beneficiaireIban: string;
  compteDonneurOrdre: string;
  montant: number;
  sop: string;
  date: string;
  dateIso: Date;
  statut: 'rapproche' | 'non-rapproche' | 'en-attente';
};

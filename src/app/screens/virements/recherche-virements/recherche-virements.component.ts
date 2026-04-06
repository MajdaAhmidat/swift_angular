import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { FiltreVirement } from '../../../shared/models/virement.model';

type DirectionFilter = 'tous' | 'emis' | 'recus';
type StatutFilter    = 'tous' | 'rapproche' | 'non-rapproche' | 'en-attente';

@Component({
  selector: 'app-recherche-virements',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TopbarComponent],
  templateUrl: './recherche-virements.component.html',
  styleUrls:   ['./recherche-virements.component.scss']
})
export class RechercheVirementsComponent {

  filtre: FiltreVirement = {
    reference: '', sop: '', dateDebut: '2026-03-01', dateFin: '2026-03-11',
    statut: '', emetteurBic: '', montantMin: undefined, montantMax: undefined,
    compteBeneficiaire: '', compteDonneurOrdre: '', direction: 'tous'
  };

  directionActive = signal<DirectionFilter>('tous');
  statutActif     = signal<StatutFilter>('tous');

  virements = [
    { id:'4821', ref:'VIR-2026-4821', direction:'emis',  emetteur:'Banque Centrale MA', emetteurBic:'BKCMMAMC', beneficiaire:'Société Générale', beneficiaireIban:'MA64 0220 0000 0456', montant:250000, sop:'SOP-001', date:'11/03/2026', statut:'rapproche' },
    { id:'4820', ref:'VIR-2026-4820', direction:'recus', emetteur:'Attijariwafa Bank',  emetteurBic:'ATTMMAMC', beneficiaire:'CIH Bank',          beneficiaireIban:'MA64 0150 0000 0789', montant:1500000, sop:'SOP-002', date:'11/03/2026', statut:'non-rapproche' },
    { id:'4819', ref:'VIR-2026-4819', direction:'emis',  emetteur:'BMCE Bank',          emetteurBic:'BMCEMAMC', beneficiaire:'Banque Populaire',   beneficiaireIban:'MA64 0100 0000 0321', montant:87500, sop:'SOP-001', date:'10/03/2026', statut:'rapproche' },
    { id:'4818', ref:'VIR-2026-4818', direction:'recus', emetteur:'Crédit du Maroc',    emetteurBic:'CDMAMAMC', beneficiaire:'Al Barid Bank',      beneficiaireIban:'MA64 0300 0000 0654', montant:340000, sop:'SOP-003', date:'10/03/2026', statut:'en-attente' },
    { id:'4817', ref:'VIR-2026-4817', direction:'emis',  emetteur:'BMCI',               emetteurBic:'BMCIMAMC', beneficiaire:'CFG Bank',           beneficiaireIban:'MA64 0400 0000 0987', montant:720000, sop:'SOP-002', date:'10/03/2026', statut:'non-rapproche' },
    { id:'4816', ref:'VIR-2026-4816', direction:'recus', emetteur:'Société Générale',   emetteurBic:'SGMBMAMC', beneficiaire:'Attijariwafa Bank',  beneficiaireIban:'MA64 0500 0000 0112', montant:95000, sop:'SOP-001', date:'09/03/2026', statut:'rapproche' },
  ];

  get virementsFiltres() {
    return this.virements.filter(v => {
      const dir = this.directionActive();
      const st  = this.statutActif();
      const matchDir    = dir === 'tous' || v.direction === dir;
      const matchStatut = st  === 'tous' || v.statut    === st;
      return matchDir && matchStatut;
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

  sops = ['SOP-001', 'SOP-002', 'SOP-003'];
}

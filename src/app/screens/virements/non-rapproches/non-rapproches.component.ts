import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-non-rapproches',
  standalone: true,
  imports: [CommonModule, RouterModule, TopbarComponent],
  templateUrl: './non-rapproches.component.html',
  styleUrls: ['./non-rapproches.component.scss']
})
export class NonRaprochesComponent {
  sopActif = signal<string>('tous');

  virements = [
    { id:'4820', ref:'VIR-2026-4820', emetteur:'Attijariwafa Bank', bic:'ATTMMAMC', montant:1500000, sop:'SOP-002', date:'11/03/2026', anciennete:'2h14', urgence:'haute' },
    { id:'4817', ref:'VIR-2026-4817', emetteur:'BMCI',              bic:'BMCIMAMC', montant:720000,  sop:'SOP-002', date:'10/03/2026', anciennete:'18h07', urgence:'critique' },
    { id:'4810', ref:'VIR-2026-4810', emetteur:'Crédit du Maroc',   bic:'CDMAMAMC', montant:95500,   sop:'SOP-001', date:'10/03/2026', anciennete:'22h30', urgence:'critique' },
    { id:'4805', ref:'VIR-2026-4805', emetteur:'Banque Populaire',  bic:'GBMAMAMC', montant:340000,  sop:'SOP-003', date:'09/03/2026', anciennete:'2j 06h', urgence:'critique' },
    { id:'4801', ref:'VIR-2026-4801', emetteur:'CFG Bank',          bic:'CFGBMAMC', montant:87500,   sop:'SOP-001', date:'09/03/2026', anciennete:'2j 12h', urgence:'haute' },
    { id:'4798', ref:'VIR-2026-4798', emetteur:'Al Barid Bank',     bic:'BPAWMAMC', montant:210000,  sop:'SOP-003', date:'08/03/2026', anciennete:'3j 04h', urgence:'normale' },
  ];

  get virementsFiltres() {
    const sop = this.sopActif();
    return sop === 'tous' ? this.virements : this.virements.filter(v => v.sop === sop);
  }

  setSop(sop: string) { this.sopActif.set(sop); }

  urgenceClass(u: string): string {
    return u === 'critique' ? 'badge--red' : u === 'haute' ? 'badge--orange' : 'badge--gray';
  }

  urgenceLabel(u: string): string {
    return u === 'critique' ? '🔴 Critique' : u === 'haute' ? '🟠 Haute' : '⚪ Normale';
  }

  get countCritique() { return this.virements.filter(v => v.urgence === 'critique').length; }
  get countHaute()    { return this.virements.filter(v => v.urgence === 'haute').length; }
}

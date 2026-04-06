import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-consulter-virement',
  standalone: true,
  imports: [CommonModule, RouterModule, TopbarComponent],
  templateUrl: './consulter-virement.component.html',
  styleUrls: ['./consulter-virement.component.scss']
})
export class ConsulterVirementComponent implements OnInit {
  virementId = '';

  virement = {
    reference: 'VIR-2026-4821',
    statut: 'rapproche',
    direction: 'emis',
    dateCreation: '11/03/2026',
    heureCreation: '09h34',
    emetteur:      { banque: 'Banque Centrale du Maroc', bic: 'BKCMMAMC', iban: 'MA64 0011 1000 0123' },
    beneficiaire:  { banque: 'Société Générale Maroc',   bic: 'SGMBMAMC', iban: 'MA64 0220 0000 0456' },
    montant: 250000,
    devise: 'MAD',
    dateValeur: '11/03/2026',
    sop: 'SOP-001',
    motif: 'Règlement fournisseur #F4821',
    historique: [
      { titre: 'Virement reçu',            date: '11/03/2026 · 09h34', statut: 'done'    },
      { titre: 'Validation SOP-001',        date: '11/03/2026 · 09h47', statut: 'done'    },
      { titre: 'Message MX envoyé',         date: '11/03/2026 · 10h02', statut: 'done'    },
      { titre: 'Rapprochement effectué',    date: '11/03/2026 · 10h12', statut: 'done'    },
    ]
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.virementId = this.route.snapshot.paramMap.get('id') || '';
  }

  get badgeClass() {
    return this.virement.statut === 'rapproche' ? 'badge--green'
         : this.virement.statut === 'non-rapproche' ? 'badge--red' : 'badge--orange';
  }

  get badgeLabel() {
    return this.virement.statut === 'rapproche' ? 'Rapproché'
         : this.virement.statut === 'non-rapproche' ? 'Non rapproché' : 'En attente';
  }
}

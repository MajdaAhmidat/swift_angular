import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-modifier-utilisateur',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TopbarComponent],
  templateUrl: './modifier-utilisateur.component.html',
  styleUrls: ['./modifier-utilisateur.component.scss']
})
export class ModifierUtilisateurComponent implements OnInit {
  userId = '';
  departements = ['Règlements', 'Trésorerie', 'Contrôle', 'Informatique', 'Direction'];

  user = {
    prenom: 'Salma', nom: 'Mansouri', email: 'salma.mansouri@bmcebank.ma',
    telephone: '+212 661 234 567', departement: 'Règlements',
    poste: 'Chargée de règlements', profil: 'operateur', statut: 'actif', auth2fa: true
  };

  activite = [
    { action: 'Connexion',               date: '11/03/2026 · 09h12', statut: 'done'    },
    { action: 'Rapprochement VIR-4815',  date: '10/03/2026 · 16h44', statut: 'done'    },
    { action: 'Consultation VIR-4810',   date: '10/03/2026 · 14h20', statut: 'done'    },
    { action: 'Export rapport mensuel',  date: '09/03/2026 · 11h05', statut: 'done'    },
  ];

  constructor(private route: ActivatedRoute) {}
  ngOnInit() { this.userId = this.route.snapshot.paramMap.get('id') || ''; }

  get initiales() { return (this.user.prenom[0] + this.user.nom[0]).toUpperCase(); }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-creer-utilisateur',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TopbarComponent],
  templateUrl: './creer-utilisateur.component.html',
  styleUrls: ['./creer-utilisateur.component.scss']
})
export class CreerUtilisateurComponent {
  user = {
    prenom: '', nom: '', email: '', telephone: '',
    departement: '', poste: '', profil: '', dateExpiration: '', auth2fa: false
  };

  departements = ['Règlements', 'Trésorerie', 'Contrôle', 'Informatique', 'Direction'];

  get initiales() {
    const p = this.user.prenom?.[0] || '';
    const n = this.user.nom?.[0] || '';
    return (p + n).toUpperCase() || 'NV';
  }

  get nomComplet() {
    return (this.user.prenom + ' ' + this.user.nom).trim() || 'Nouvel utilisateur';
  }

  get profilLabel() {
    const map: Record<string,string> = {
      lecteur: 'Lecteur', operateur: 'Opérateur',
      superviseur: 'Superviseur', administrateur: 'Administrateur'
    };
    return map[this.user.profil] || '—';
  }

  get badgeProfilClass() {
    const map: Record<string,string> = {
      lecteur: 'badge--gray', operateur: 'badge--navy',
      superviseur: 'badge--orange', administrateur: 'badge--red'
    };
    return map[this.user.profil] || 'badge--gray';
  }

  reset() {
    this.user = { prenom:'', nom:'', email:'', telephone:'', departement:'', poste:'', profil:'', dateExpiration:'', auth2fa:false };
  }
}

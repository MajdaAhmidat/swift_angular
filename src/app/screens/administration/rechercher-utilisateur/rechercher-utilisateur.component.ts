import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-rechercher-utilisateur',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TopbarComponent],
  templateUrl: './rechercher-utilisateur.component.html',
  styleUrls: ['./rechercher-utilisateur.component.scss']
})
export class RechercherUtilisateurComponent {
  filtre = { nom: '', departement: '', profil: '', statut: '' };
  departements = ['Règlements', 'Trésorerie', 'Contrôle', 'Informatique', 'Direction'];

  users = [
    { id:'1', initiales:'SM', nom:'Salma Mansouri',  poste:'Chargée de règlements', dept:'Règlements', profil:'operateur',      statut:'actif',    derniere:'11/03/2026' },
    { id:'2', initiales:'KA', nom:'Karim Alaoui',    poste:'Superviseur SWIFT',      dept:'Trésorerie', profil:'superviseur',    statut:'actif',    derniere:'10/03/2026' },
    { id:'3', initiales:'FZ', nom:'Fatima Zahraoui', poste:'Contrôleur interne',     dept:'Contrôle',   profil:'lecteur',        statut:'actif',    derniere:'09/03/2026' },
    { id:'4', initiales:'OB', nom:'Omar Benjelloun', poste:'Admin systèmes',         dept:'Informatique',profil:'administrateur', statut:'actif',    derniere:'11/03/2026' },
    { id:'5', initiales:'NH', nom:'Nadia Haddad',    poste:'Directrice adjointe',    dept:'Direction',  profil:'superviseur',    statut:'inactif',  derniere:'01/02/2026' },
    { id:'6', initiales:'YA', nom:'Youssef Amine',   poste:'Opérateur virements',    dept:'Règlements', profil:'operateur',      statut:'suspendu', derniere:'28/02/2026' },
  ];

  get usersFiltres() {
    return this.users.filter(u => {
      const matchNom   = !this.filtre.nom        || u.nom.toLowerCase().includes(this.filtre.nom.toLowerCase());
      const matchDept  = !this.filtre.departement || u.dept   === this.filtre.departement;
      const matchProfil= !this.filtre.profil      || u.profil  === this.filtre.profil;
      const matchStatut= !this.filtre.statut      || u.statut  === this.filtre.statut;
      return matchNom && matchDept && matchProfil && matchStatut;
    });
  }

  badgeProfil(p: string) {
    return {lecteur:'badge--gray',operateur:'badge--navy',superviseur:'badge--orange',administrateur:'badge--red'}[p] || 'badge--gray';
  }
  labelProfil(p: string) {
    return {lecteur:'Lecteur',operateur:'Opérateur',superviseur:'Superviseur',administrateur:'Administrateur'}[p] || p;
  }
  badgeStatut(s: string) {
    return {actif:'badge--green',inactif:'badge--gray',suspendu:'badge--orange'}[s] || 'badge--gray';
  }
  avatarColors = ['#1B3A6B','#00B4D8','#10B981','#F59E0B','#8B5CF6','#EF4444'];
  avatarColor(i: number) { return this.avatarColors[i % this.avatarColors.length]; }
}

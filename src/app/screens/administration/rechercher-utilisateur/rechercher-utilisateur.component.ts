import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { UtilisateurService, UtilisateurApi } from '../../../shared/services/utilisateur.service';

interface UserRow {
  id: number;
  idRoleRole: number;
  initiales: string;
  nom: string;
  poste: string;
  dept: string;
  profil: string;
  statut: string;
  derniere: string;
}

@Component({
  selector: 'app-rechercher-utilisateur',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TopbarComponent],
  templateUrl: './rechercher-utilisateur.component.html',
  styleUrls: ['./rechercher-utilisateur.component.scss']
})
export class RechercherUtilisateurComponent implements OnInit {
  filtre = { nom: '', departement: '', profil: '', statut: '' };
  departements = ['Règlements', 'Trésorerie', 'Contrôle', 'Informatique', 'Direction'];

  users: UserRow[] = [];
  loading = true;
  deletingId: number | null = null;
  error = '';
  success = '';

  constructor(
    private utilisateurService: UtilisateurService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.utilisateurService.getList().subscribe({
      next: (list) => {
        this.users = list.map(u => this.toRow(u));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Impossible de charger la liste des utilisateurs.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private toRow(u: UtilisateurApi): UserRow {
    const prenom = (u.prenom || '').trim();
    const nom = (u.nom || '').trim();
    const fullName = [prenom, nom].filter(Boolean).join(' ') || u.login || '—';
    const ini = prenom && nom ? (prenom[0] + nom[0]).toUpperCase() : (fullName.slice(0, 2).toUpperCase() || '?');
    const roleCode = (u.roleCode || '').toLowerCase();
    const createdAt = u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
    const statutStr = (u.statut || '').trim().toLowerCase() || (u.actif !== false ? 'actif' : 'inactif');
    return {
      id: u.idUser!,
      idRoleRole: u.idRoleRole!,
      initiales: ini,
      nom: fullName,
      poste: (u.poste || '').trim() || '—',
      dept: (u.departement || '').trim() || '—',
      profil: roleCode,
      statut: statutStr,
      derniere: createdAt
    };
  }

  /** Tous les utilisateurs sont affichés ; le filtrage se fait par nom/prénom, département, profil, statut */
  get usersFiltres() {
    const nomFilter = (this.filtre.nom || '').trim().toLowerCase();
    return this.users.filter(u => {
      const matchNom = !nomFilter || u.nom.toLowerCase().includes(nomFilter);
      const matchDept = !this.filtre.departement || u.dept === this.filtre.departement;
      const matchProfil = !this.filtre.profil || u.profil === this.filtre.profil;
      const matchStatut = !this.filtre.statut || u.statut === this.filtre.statut;
      return matchNom && matchDept && matchProfil && matchStatut;
    });
  }

  get countTotal(): number { return this.users.length; }
  get countSuperviseur(): number { return this.users.filter(u => u.profil === 'superviseur').length; }
  get countAdministrateur(): number { return this.users.filter(u => u.profil === 'administrateur' || u.profil === 'admin').length; }
  get countActif(): number { return this.users.filter(u => u.statut === 'actif').length; }
  get countInactif(): number { return this.users.filter(u => u.statut === 'inactif').length; }
  get countSuspendu(): number { return this.users.filter(u => u.statut === 'suspendu').length; }

  setProfil(value: string): void {
    this.filtre.profil = value;
  }

  setStatut(value: string): void {
    this.filtre.statut = value;
  }

  badgeProfil(p: string) {
    return { lecteur: 'badge--gray', operateur: 'badge--navy', superviseur: 'badge--orange', administrateur: 'badge--red' }[p] || 'badge--gray';
  }
  labelProfil(p: string) {
    return { lecteur: 'Lecteur', operateur: 'Opérateur', superviseur: 'Superviseur', administrateur: 'Administrateur', admin: 'Administrateur' }[p] || (p ? p.charAt(0).toUpperCase() + p.slice(1) : '—');
  }
  badgeStatut(s: string) {
    return { actif: 'badge--green', inactif: 'badge--gray', suspendu: 'badge--orange' }[s] || 'badge--gray';
  }
  avatarColors = ['#1B3A6B', '#00B4D8', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
  avatarColor(i: number) { return this.avatarColors[i % this.avatarColors.length]; }

  openUserDetails(u: UserRow): void {
    this.router.navigate(['/administration/droits', u.id]);
  }

  supprimerUtilisateur(u: UserRow): void {
    const ok = window.confirm(`Confirmer la suppression de l'utilisateur ${u.nom} ?`);
    if (!ok) return;

    this.error = '';
    this.success = '';
    this.deletingId = u.id;

    this.utilisateurService.delete(u.id, u.idRoleRole).subscribe({
      next: () => {
        this.users = this.users.filter(x => x.id !== u.id);
        this.success = 'Utilisateur supprimé avec succès.';
        this.deletingId = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Suppression impossible.';
        this.deletingId = null;
        this.cdr.detectChanges();
      }
    });
  }

  goToCreateUtilisateur(): void {
    this.router.navigate(['/administration/creer-utilisateur']);
  }
}

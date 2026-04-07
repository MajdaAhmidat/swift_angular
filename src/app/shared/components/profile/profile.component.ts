import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile: {
    idUser?: number;
    email: string;
    roleCode: string;
    nom: string;
    prenom: string;
    telephone?: string;
    departement?: string;
    poste?: string;
    statut?: string;
    actif?: boolean;
    createdAt?: string | null;
  } | null = null;
  nom = '';
  prenom = '';
  email = '';
  telephone = '';
  departement = '';
  poste = '';
  statut = 'actif';
  actif = true;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  message = '';
  messageError = '';
  messageProfile = '';
  messageErrorProfile = '';
  loading = false;
  loadingProfile = true;
  savingProfile = false;
  editMode = false;
  editPasswordMode = false;

  constructor(public auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.auth.getProfile().subscribe({
      next: (res) => {
        this.applyProfileState(res);
        this.loadingProfile = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingProfile = false;
        this.cdr.detectChanges();
      }
    });
  }

  get user() {
    return this.auth.currentUser();
  }

  get roleLabel(): string {
    const r = this.profile?.roleCode || this.auth.currentUser()?.role;
    return r === 'ADMIN' ? 'Administrateur' : r === 'SUPERVISEUR' ? 'Superviseur' : r || '';
  }

  get actifLabel(): string {
    return this.profile?.actif === true ? 'Actif' : 'Inactif';
  }

  get createdAtFormatted(): string {
    const raw = this.profile?.createdAt;
    if (!raw) return '—';
    try {
      const d = new Date(raw);
      return isNaN(d.getTime()) ? raw : d.toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return raw;
    }
  }

  startEdit(): void {
    this.editMode = true;
    this.editPasswordMode = true;
    this.nom = this.profile?.nom ?? '';
    this.prenom = this.profile?.prenom ?? '';
    this.email = this.profile?.email ?? '';
    this.telephone = this.profile?.telephone ?? '';
    this.departement = this.profile?.departement ?? '';
    this.poste = this.profile?.poste ?? '';
    this.statut = this.profile?.statut ?? (this.profile?.actif === false ? 'inactif' : 'actif');
    this.actif = this.profile?.actif !== false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.message = '';
    this.messageError = '';
    this.messageProfile = '';
    this.messageErrorProfile = '';
  }

  cancelEdit(): void {
    this.editMode = false;
    this.editPasswordMode = false;
    this.nom = this.profile?.nom ?? '';
    this.prenom = this.profile?.prenom ?? '';
    this.email = this.profile?.email ?? '';
    this.telephone = this.profile?.telephone ?? '';
    this.departement = this.profile?.departement ?? '';
    this.poste = this.profile?.poste ?? '';
    this.statut = this.profile?.statut ?? (this.profile?.actif === false ? 'inactif' : 'actif');
    this.actif = this.profile?.actif !== false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.message = '';
    this.messageError = '';
    this.messageProfile = '';
    this.messageErrorProfile = '';
  }

  saveProfile(): void {
    this.messageProfile = '';
    this.messageErrorProfile = '';
    this.savingProfile = true;
    this.statut = this.actif ? 'actif' : 'inactif';
    this.auth.updateProfile({
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      telephone: this.telephone,
      departement: this.departement,
      poste: this.poste,
      statut: this.statut,
      actif: this.actif
    }).subscribe({
      next: () => {
        this.savingProfile = false;
        this.editMode = false;
        this.messageProfile = 'Informations enregistrées.';
        this.profile = {
          ...(this.profile ?? {
            idUser: undefined,
            roleCode: '',
            createdAt: null
          }),
          email: this.email,
          nom: this.nom,
          prenom: this.prenom,
          telephone: this.telephone,
          departement: this.departement,
          poste: this.poste,
          statut: this.statut,
          actif: this.actif
        };
        this.auth.setProfileNames(this.nom, this.prenom);
        this.cdr.detectChanges();
      },
      error: () => {
        this.savingProfile = false;
        this.messageErrorProfile = 'Erreur lors de l\'enregistrement.';
        this.cdr.detectChanges();
      }
    });
  }

  onActifChange(value: boolean): void {
    this.actif = value;
    this.statut = value ? 'actif' : 'inactif';
  }

  onStatutChange(value: string): void {
    this.statut = value;
    this.actif = value === 'actif';
  }

  private applyProfileState(res: {
    idUser?: number;
    email?: string;
    roleCode?: string;
    nom?: string;
    prenom?: string;
    telephone?: string;
    departement?: string;
    poste?: string;
    statut?: string;
    actif?: boolean;
    createdAt?: string | null;
  }): void {
    this.profile = {
      idUser: res.idUser,
      email: res.email || '',
      roleCode: res.roleCode || '',
      nom: res.nom || '',
      prenom: res.prenom || '',
      telephone: res.telephone || '',
      departement: res.departement || '',
      poste: res.poste || '',
      statut: res.statut || 'actif',
      actif: res.actif,
      createdAt: res.createdAt ?? null
    };
    this.nom = this.profile.nom;
    this.prenom = this.profile.prenom;
    this.email = this.profile.email;
    this.telephone = this.profile.telephone || '';
    this.departement = this.profile.departement || '';
    this.poste = this.profile.poste || '';
    this.statut = this.profile.statut || (this.profile.actif === false ? 'inactif' : 'actif');
    this.actif = this.profile.actif !== false;
  }

  startEditPassword(): void {
    this.editPasswordMode = true;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.message = '';
    this.messageError = '';
  }

  cancelEditPassword(): void {
    this.editPasswordMode = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.message = '';
    this.messageError = '';
  }

  changePassword(): void {
    this.message = '';
    this.messageError = '';
    if (!this.newPassword || this.newPassword.length < 4) {
      this.messageError = 'Le nouveau mot de passe doit contenir au moins 4 caractères.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.messageError = 'Les deux mots de passe ne correspondent pas.';
      return;
    }
    this.loading = true;
    this.auth.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.editPasswordMode = false;
        this.message = 'Mot de passe modifié avec succès.';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        if (err?.status === 403) {
          this.messageError = 'Mot de passe actuel incorrect.';
        } else {
          this.messageError = 'Une erreur est survenue. Réessayez.';
        }
        this.cdr.detectChanges();
      }
    });
  }
}

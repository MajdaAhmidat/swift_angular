import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { UtilisateurService, RoleApi, PermissionMatrixApi } from '../../../shared/services/utilisateur.service';

interface ModuleDroit {
  key: string;
  label: string;
  lire: boolean;
  creer: boolean;
  modifier: boolean;
  supprimer: boolean;
  valider: boolean;
}

@Component({
  selector: 'app-creer-utilisateur',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TopbarComponent],
  templateUrl: './creer-utilisateur.component.html',
  styleUrls: ['./creer-utilisateur.component.scss']
})
export class CreerUtilisateurComponent implements OnInit {
  user = {
    prenom: '',
    nom: '',
    email: '',
    motdepasse: '',
    telephone: '',
    departement: '',
    poste: '',
    statut: 'actif',
    roleId: 0,
    actif: true
  };
  roles: RoleApi[] = [];
  modules: ModuleDroit[] = [
    { key: 'virements', label: 'Virements', lire: true, creer: false, modifier: false, supprimer: false, valider: true },
    { key: 'messages_mx', label: 'Messages MX', lire: true, creer: false, modifier: false, supprimer: false, valider: false },
    { key: 'rapprochement', label: 'Rapprochement', lire: true, creer: false, modifier: false, supprimer: false, valider: true },
    { key: 'tableaux_bord', label: 'Tableaux de bord', lire: true, creer: false, modifier: false, supprimer: false, valider: false },
    { key: 'administration', label: 'Administration', lire: false, creer: false, modifier: false, supprimer: false, valider: false }
  ];
  departements = ['Règlements', 'Trésorerie', 'Contrôle', 'Informatique', 'Direction'];
  loading = false;
  error = '';
  messageSuccess = '';

  constructor(
    private utilisateurService: UtilisateurService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.utilisateurService.getRoles().subscribe({
      next: (list) => {
        this.roles = list;
        if (list.length && !this.user.roleId) {
          this.user.roleId = list[0].idRole;
        }
        this.onRoleSelectionChanged(this.user.roleId);
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Impossible de charger les rôles.';
        this.cdr.detectChanges();
      }
    });
  }

  get initiales() {
    const p = this.user.prenom?.[0] || '';
    const n = this.user.nom?.[0] || '';
    return (p + n).toUpperCase() || 'NV';
  }

  get nomComplet() {
    return (this.user.prenom + ' ' + this.user.nom).trim() || 'Nouvel utilisateur';
  }

  get roleLabel() {
    const r = this.roles.find(x => x.idRole === this.user.roleId);
    return r ? r.label : '—';
  }

  reset() {
    this.user = {
      prenom: '',
      nom: '',
      email: '',
      motdepasse: '',
      telephone: '',
      departement: '',
      poste: '',
      statut: 'actif',
      roleId: this.roles.length ? this.roles[0].idRole : 0,
      actif: true
    };
    this.error = '';
    this.messageSuccess = '';
    this.onRoleSelectionChanged(this.user.roleId);
  }

  onActifChange(value: boolean): void {
    this.user.actif = !!value;
    this.user.statut = this.user.actif ? 'actif' : 'inactif';
  }

  onStatutChange(value: string): void {
    const normalized = (value || '').toLowerCase();
    this.user.statut = normalized === 'actif' ? 'actif' : 'inactif';
    this.user.actif = this.user.statut === 'actif';
  }

  get selectedRoleCode(): string {
    const selected = this.roles.find(r => r.idRole === this.user.roleId);
    return (selected?.code || '').toLowerCase();
  }

  isSuperviseurSelected(): boolean {
    return this.selectedRoleCode === 'superviseur';
  }

  onRoleSelectionChanged(roleId: number): void {
    const selected = this.roles.find(r => r.idRole === roleId);
    const code = (selected?.code || '').toLowerCase();
    this.appliquerProfil(code === 'admin' ? 'administrateur' : code === 'superviseur' ? 'superviseur' : 'superviseur');
  }

  private appliquerProfil(profil: string): void {
    this.modules.forEach(m => {
      if (profil === 'superviseur') {
        m.lire = true;
        m.creer = false;
        m.modifier = false;
        m.supprimer = false;
        m.valider = (m.key === 'virements' || m.key === 'rapprochement');
        if (m.key === 'administration') {
          m.lire = false;
          m.valider = false;
        }
      } else {
        m.lire = true;
        m.creer = true;
        m.modifier = true;
        m.supprimer = true;
        m.valider = true;
      }
    });
  }

  submit() {
    this.error = '';
    this.messageSuccess = '';
    if (!this.user.prenom?.trim()) {
      this.error = 'Le prénom est obligatoire.';
      return;
    }
    if (!this.user.nom?.trim()) {
      this.error = 'Le nom est obligatoire.';
      return;
    }
    if (!this.user.email?.trim()) {
      this.error = 'L\'email (login) est obligatoire.';
      return;
    }
    if (!this.user.motdepasse || this.user.motdepasse.length < 4) {
      this.error = 'Le mot de passe doit contenir au moins 4 caractères.';
      return;
    }
    if (!this.user.departement?.trim()) {
      this.error = 'Le département est obligatoire.';
      return;
    }
    if (!this.user.roleId) {
      this.error = 'Veuillez choisir un rôle.';
      return;
    }
    this.loading = true;
    const selectedRoleId = this.user.roleId;
    const matrixPayload: PermissionMatrixApi[] = this.modules.map(m => ({
      module: m.key,
      lire: m.lire,
      creer: m.creer,
      modifier: m.modifier,
      supprimer: m.supprimer,
      valider: m.valider
    }));
    this.utilisateurService.create({
      login: this.user.email.trim(),
      motdepasse: this.user.motdepasse,
      nom: this.user.nom?.trim() || '',
      prenom: this.user.prenom?.trim() || '',
      telephone: this.user.telephone?.trim() || '',
      departement: this.user.departement?.trim() || '',
      poste: this.user.poste?.trim() || '',
      statut: this.user.statut?.trim() || 'actif',
      roleId: this.user.roleId,
      actif: this.user.actif
    }).subscribe({
      next: (createdUser) => {
        if (!selectedRoleId || !this.isSuperviseurSelected()) {
          this.loading = false;
          this.messageSuccess = 'Compte créé avec succès.';
          this.cdr.detectChanges();
          this.router.navigate(['/administration/rechercher']);
          return;
        }

        const createdUserId = createdUser?.idUser ?? 0;
        if (!createdUserId) {
          this.loading = false;
          this.error = 'Compte créé, mais id utilisateur introuvable pour sauvegarder les permissions.';
          this.cdr.detectChanges();
          return;
        }

        this.utilisateurService.saveUserPermissions(createdUserId, matrixPayload).subscribe({
          next: () => {
            this.loading = false;
            this.messageSuccess = 'Compte créé avec succès.';
            this.cdr.detectChanges();
            this.router.navigate(['/administration/rechercher']);
          },
          error: () => {
            this.loading = false;
            this.error = 'Compte créé, mais erreur lors de la sauvegarde des permissions utilisateur.';
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        this.loading = false;
        if (err?.status === 409) {
          this.error = 'Login/email déjà utilisé.';
        } else {
          this.error = err?.error?.message || 'Erreur lors de la création.';
        }
        this.cdr.detectChanges();
      }
    });
  }
}

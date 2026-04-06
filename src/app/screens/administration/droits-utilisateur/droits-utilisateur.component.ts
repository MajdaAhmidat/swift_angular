import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { UtilisateurService, UtilisateurApi, RoleApi, PermissionMatrixApi } from '../../../shared/services/utilisateur.service';

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
  selector: 'app-droits-utilisateur',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TopbarComponent],
  templateUrl: './droits-utilisateur.component.html',
  styleUrls: ['./droits-utilisateur.component.scss']
})
export class DroitsUtilisateurComponent implements OnInit {
  userId: number | null = null;
  user: UtilisateurApi | null = null;
  roles: RoleApi[] = [];
  loading = true;
  saving = false;
  error = '';
  messageSuccess = '';

  modules: ModuleDroit[] = [
    { key: 'virements', label: 'Virements', lire: true, creer: false, modifier: false, supprimer: false, valider: false },
    { key: 'messages-mx', label: 'Messages MX', lire: true, creer: false, modifier: false, supprimer: false, valider: false },
    { key: 'rapprochement', label: 'Rapprochement', lire: true, creer: false, modifier: false, supprimer: false, valider: false },
    { key: 'tableaux-bord', label: 'Tableaux de bord', lire: true, creer: false, modifier: false, supprimer: false, valider: false },
    { key: 'administration', label: 'Administration', lire: false, creer: false, modifier: false, supprimer: false, valider: false },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private utilisateurService: UtilisateurService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      this.error = 'Identifiant utilisateur manquant.';
      return;
    }
    this.userId = +id;
    if (isNaN(this.userId)) {
      this.loading = false;
      this.error = 'Identifiant invalide.';
      return;
    }
    this.utilisateurService.getRoles().subscribe({
      next: (list) => {
        this.roles = list;
        this.cdr.detectChanges();
      }
    });
    this.loadUser();
  }

  loadUser(): void {
    if (this.userId == null) return;
    this.utilisateurService.getById(this.userId).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (u) => {
        this.user = {
          ...u,
          roleId: u.roleId ?? u.idRoleRole,
          actif: u.actif !== false
        };
        this.appliquerProfilFromRole(u.roleCode);
        this.loadPermissionsForUser(this.user.idUser ?? this.userId ?? 0);
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Utilisateur introuvable. Vérifiez que le backend est démarré et que l\'utilisateur existe.';
        this.cdr.detectChanges();
      }
    });
  }

  appliquerProfilFromRole(roleCode: string | undefined): void {
    const p = (roleCode || '').toLowerCase();
    this.appliquerProfil(p === 'admin' ? 'administrateur' : p === 'superviseur' ? 'superviseur' : 'superviseur');
  }

  onRoleChange(roleId: number): void {
    if (!this.user) return;
    const selectedRole = this.roles.find(r => r.idRole === roleId);
    this.appliquerProfilFromRole(selectedRole?.code);
  }

  appliquerProfil(profil: string): void {
    this.modules.forEach(m => {
      if (profil === 'superviseur') {
        m.lire = true;
        m.creer = false;
        m.modifier = false;
        m.supprimer = false;
        // Matrice métier: validation autorisée uniquement sur virements et rapprochement
        m.valider = (m.key === 'virements' || m.key === 'rapprochement');
        if (m.key === 'administration') {
          m.lire = false;
        }
      } else {
        // Administrateur: accès complet
        m.lire = true; m.creer = true; m.modifier = true; m.supprimer = true; m.valider = true;
      }
    });
  }

  private get selectedRoleCode(): string {
    const selectedRole = this.roles.find(r => r.idRole === this.roleId);
    return (selectedRole?.code || '').toLowerCase();
  }

  isSuperviseurSelected(): boolean {
    return this.selectedRoleCode === 'superviseur';
  }

  isAdministrateurSelected(): boolean {
    const code = this.selectedRoleCode;
    return code === 'admin' || code === 'administrateur';
  }

  canEditPermission(module: ModuleDroit, permission: keyof Pick<ModuleDroit, 'lire' | 'creer' | 'modifier' | 'supprimer' | 'valider'>): boolean {
    // Édition manuelle complète des droits depuis l'écran.
    return true;
  }

  onPermissionChange(module: ModuleDroit, permission: keyof Pick<ModuleDroit, 'lire' | 'creer' | 'modifier' | 'supprimer' | 'valider'>): void {
    if (!this.canEditPermission(module, permission)) {
      if (permission === 'lire') module.lire = true;
      if (permission === 'creer') module.creer = false;
      if (permission === 'modifier') module.modifier = false;
      if (permission === 'supprimer') module.supprimer = false;
      if (permission === 'valider') module.valider = false;
      return;
    }
    // Cohérence minimale: un droit d'action implique le droit de lecture.
    if (module.creer || module.modifier || module.supprimer || module.valider) {
      module.lire = true;
    }
  }

  get roleId(): number {
    return this.user?.roleId ?? this.user?.idRoleRole ?? 0;
  }
  set roleId(v: number) {
    if (!this.user) return;
    this.user.roleId = v;
    this.onRoleChange(v);
  }

  get actif(): boolean {
    return this.user?.actif !== false;
  }
  set actif(v: boolean) {
    if (this.user) this.user.actif = v;
  }

  save(): void {
    if (!this.user || this.userId == null) return;
    this.error = '';
    this.messageSuccess = '';
    this.saving = true;
    const roleIdToSave = this.user.roleId ?? this.user.idRoleRole ?? 0;
    const idUserToSave = this.user.idUser ?? this.userId ?? 0;
    const matrix = this.modules.map(m => ({
      module: m.key,
      lire: m.lire,
      creer: m.creer,
      modifier: m.modifier,
      supprimer: m.supprimer,
      valider: m.valider
    }));

    this.utilisateurService.update({
      idUser: this.user.idUser,
      idRoleRole: this.user.idRoleRole,
      login: this.user.login,
      nom: this.user.nom,
      prenom: this.user.prenom,
      roleId: roleIdToSave,
      actif: this.user.actif
    }).subscribe({
      next: () => {
        if (!idUserToSave) {
          this.saving = false;
          this.messageSuccess = 'Droits enregistrés.';
          this.cdr.detectChanges();
          return;
        }
        this.utilisateurService.saveUserPermissions(idUserToSave, matrix).subscribe({
          next: () => {
            this.saving = false;
            this.messageSuccess = 'Droits enregistrés.';
            this.cdr.detectChanges();
          },
          error: () => {
            this.saving = false;
            this.error = 'Utilisateur sauvegardé, mais échec de la sauvegarde des permissions utilisateur.';
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.saving = false;
        this.error = 'Erreur lors de l\'enregistrement.';
        this.cdr.detectChanges();
      }
    });
  }

  private loadPermissionsForUser(idUser: number): void {
    if (!idUser) {
      return;
    }
    this.utilisateurService.getUserPermissions(idUser).subscribe({
      next: (rows) => {
        if (rows && rows.length) {
          this.applyMatrix(rows);
        }
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });
  }

  private applyMatrix(rows: PermissionMatrixApi[]): void {
    const byModule = new Map<string, PermissionMatrixApi>();
    rows.forEach((r) => {
      const key = this.normalizeModule(r.module);
      if (key) byModule.set(key, r);
    });

    this.modules.forEach((m) => {
      const api = byModule.get(this.normalizeModule(m.key));
      if (!api) return;
      m.lire = !!api.lire;
      m.creer = !!api.creer;
      m.modifier = !!api.modifier;
      m.supprimer = !!api.supprimer;
      m.valider = !!api.valider;
    });
  }

  private normalizeModule(module: string): string {
    return (module || '').trim().toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_');
  }
}

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { UtilisateurService, UtilisateurApi, RoleApi } from '../../../shared/services/utilisateur.service';

@Component({
  selector: 'app-modifier-utilisateur',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TopbarComponent],
  templateUrl: './modifier-utilisateur.component.html',
  styleUrls: ['./modifier-utilisateur.component.scss']
})
export class ModifierUtilisateurComponent implements OnInit {
  userId: number | null = null;
  user: UtilisateurApi & { motdepasse?: string } = {
    login: '',
    nom: '',
    prenom: '',
    roleId: 0,
    actif: true
  };
  roles: RoleApi[] = [];
  loading = true;
  saving = false;
  error = '';
  messageSuccess = '';

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
          idUser: u.idUser,
          idRoleRole: u.idRoleRole,
          login: u.login,
          nom: u.nom ?? '',
          prenom: u.prenom ?? '',
          telephone: u.telephone,
          departement: u.departement,
          poste: u.poste,
          statut: u.statut,
          roleId: u.roleId ?? u.idRoleRole,
          roleCode: u.roleCode,
          actif: u.actif !== false
        };
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Utilisateur introuvable. Vérifiez que le backend est démarré et que l\'utilisateur existe.';
        this.cdr.detectChanges();
      }
    });
  }

  get initiales() {
    const p = (this.user.prenom || '')[0] || '';
    const n = (this.user.nom || '')[0] || '';
    return (p + n).toUpperCase() || '?';
  }

  submit(): void {
    if (!this.user.idUser || !this.user.idRoleRole) return;
    this.error = '';
    this.messageSuccess = '';
    this.saving = true;
    this.utilisateurService.update(this.user).subscribe({
      next: () => {
        this.saving = false;
        this.messageSuccess = 'Modifications enregistrées.';
        this.cdr.detectChanges();
      },
      error: () => {
        this.saving = false;
        this.error = 'Erreur lors de l\'enregistrement.';
        this.cdr.detectChanges();
      }
    });
  }
}

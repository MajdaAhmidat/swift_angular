import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
  permission?: { module: string; action?: 'lire' | 'creer' | 'modifier' | 'supprimer' | 'valider' };
}

interface NavSection {
  label: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  navSections: NavSection[] = [];
  profileOpen = false;

  constructor(public auth: AuthService, private router: Router) {
    this.buildNavSections();
    this.auth.ensurePermissionsLoaded(true).subscribe(() => this.buildNavSections());
  }

  private buildNavSections(): void {
    const common: NavSection[] = [
      {
        label: 'Tableaux de bord',
        items: [
          {
            label: 'Accueil',
            route: '/dashboard/grafana',
            icon: 'home',
            permission: { module: 'tableaux_bord', action: 'lire' }
          }
        ]
      },
      {
        label: 'Virements',
        items: [
          {
            label: 'Recherche des virements',
            route: '/virements/recherche',
            icon: 'search',
            permission: { module: 'virements', action: 'lire' }
          }
        ]
      }
    ];

    const adminSection: NavSection = {
      label: 'Administration',
      items: [
        { label: 'Rechercher utilisateur', route: '/administration/rechercher', icon: 'users' }
      ]
    };

    const filteredCommon: NavSection[] = common
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => this.canAccessItem(item))
      }))
      .filter((section) => section.items.length > 0);

    this.navSections = [...filteredCommon];
    if (this.auth.isAdmin()) this.navSections.push(adminSection);
  }

  private canAccessItem(item: NavItem): boolean {
    if (this.auth.isAdmin()) return true;
    if (item.permission) {
      return this.auth.hasPermission(item.permission.module, item.permission.action || 'lire');
    }
    return true;
  }

  get initials(): string {
    const u = this.auth.currentUser();
    if (!u) return '?';
    const prenom = (u.prenom || '').trim();
    const nom = (u.nom || '').trim();
    if (prenom && nom) return (prenom[0] + nom[0]).toUpperCase();
    if (prenom) return prenom.slice(0, 2).toUpperCase();
    if (nom) return nom.slice(0, 2).toUpperCase();
    const email = u.email;
    if (!email) return '?';
    const parts = email.split('@')[0].replace(/[^a-zA-Z]/g, '');
    if (parts.length >= 2) return (parts[0] + parts[1]).toUpperCase().slice(0, 2);
    return (parts[0] || '?').toUpperCase().slice(0, 2);
  }

  toggleProfileMenu(): void {
    this.profileOpen = !this.profileOpen;
  }

  logout(): void {
    this.profileOpen = false;
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

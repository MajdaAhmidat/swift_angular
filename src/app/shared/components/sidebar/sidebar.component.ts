import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
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
    const common: NavSection[] = [
      {
        label: 'Tableaux de bord',
        items: [
          { label: 'Accueil', route: '/dashboard/grafana', icon: 'home' },
        ]
      },
      {
        label: 'Virements',
        items: [
          { label: 'Recherche des virements', route: '/virements/recherche',       icon: 'search'    },
          { label: 'Consulter un virement',   route: '/virements/consulter/1',     icon: 'file-text' },
          { label: 'Messages MX',             route: '/virements/message-mx/1',    icon: 'mail'      },
          { label: 'Non rapprochés',          route: '/virements/non-rapproches',  icon: 'clock',    badge: 24 },
        ]
      }
    ];

    const adminSection: NavSection = {
      label: 'Administration',
      items: [
        { label: 'Créer utilisateur',       route: '/administration/creer-utilisateur', icon: 'user-plus'   },
        { label: 'Droits utilisateurs',     route: '/administration/droits/1',           icon: 'lock'        },
        { label: 'Rechercher utilisateur',  route: '/administration/rechercher',         icon: 'users'       },
        { label: 'Modifier utilisateur',    route: '/administration/modifier/1',         icon: 'user-edit'   },
      ]
    };

    this.navSections = [...common];
    if (this.auth.isAdmin()) {
      this.navSections.push(adminSection);
    }
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

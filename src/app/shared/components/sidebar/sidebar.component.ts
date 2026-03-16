import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';

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
  navSections: NavSection[] = [
    {
      label: 'Tableaux de bord',
      items: [
        { label: 'Accueil',             route: '/dashboard/grafana',        icon: 'home' },
        { label: 'Non rapprochés / SOP', route: '/dashboard/non-rapproches', icon: 'bar-chart' },
        { label: 'Rapprochés / SOP',     route: '/dashboard/rapproches',     icon: 'trending-up' },
      ]
    },
    {
      label: 'Virements',
      items: [
        { label: 'Recherche des virements', route: '/virements/recherche',    icon: 'search'    },
        { label: 'Consulter un virement',   route: '/virements/consulter/1',  icon: 'file-text' },
        { label: 'Messages MX',             route: '/virements/message-mx/1', icon: 'mail'      },
        { label: 'Non rapprochés',          route: '/virements/non-rapproches', icon: 'clock',  badge: 24 },
      ]
    },
    {
      label: 'Administration',
      items: [
        { label: 'Créer utilisateur',       route: '/administration/creer-utilisateur', icon: 'user-plus'   },
        { label: 'Droits utilisateurs',     route: '/administration/droits/1',           icon: 'lock'        },
        { label: 'Rechercher utilisateur',  route: '/administration/rechercher',         icon: 'users'       },
        { label: 'Modifier utilisateur',    route: '/administration/modifier/1',         icon: 'user-edit'   },
      ]
    }
  ];
}

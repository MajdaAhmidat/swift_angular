import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'virements/recherche',
    pathMatch: 'full'
  },
  {
    path: 'virements',
    children: [
      {
        path: 'recherche',
        loadComponent: () =>
          import('./screens/virements/recherche-virements/recherche-virements.component')
            .then(m => m.RechercheVirementsComponent),
        title: 'Recherche des virements — BMCE'
      },
      {
        path: 'consulter/:id',
        loadComponent: () =>
          import('./screens/virements/consulter-virement/consulter-virement.component')
            .then(m => m.ConsulterVirementComponent),
        title: 'Consulter un virement — BMCE'
      },
      {
        path: 'message-mx/:id',
        loadComponent: () =>
          import('./screens/virements/message-mx/message-mx.component')
            .then(m => m.MessageMxComponent),
        title: 'Message MX — BMCE'
      },
      {
        path: 'non-rapproches',
        loadComponent: () =>
          import('./screens/virements/non-rapproches/non-rapproches.component')
            .then(m => m.NonRaprochesComponent),
        title: 'Non rapprochés — BMCE'
      }
    ]
  },
  {
    path: 'dashboard',
    children: [
      {
        path: 'non-rapproches',
        loadComponent: () =>
          import('./screens/dashboard/dashboard-non-rapproches/dashboard-non-rapproches.component')
            .then(m => m.DashboardNonRaprochesComponent),
        title: 'Dashboard Non rapprochés — BMCE'
      },
      {
        path: 'rapproches',
        loadComponent: () =>
          import('./screens/dashboard/dashboard-rapproches/dashboard-rapproches.component')
            .then(m => m.DashboardRaprochesComponent),
        title: 'Dashboard Rapprochés — BMCE'
      }
    ]
  },
  {
    path: 'administration',
    children: [
      {
        path: 'creer-utilisateur',
        loadComponent: () =>
          import('./screens/administration/creer-utilisateur/creer-utilisateur.component')
            .then(m => m.CreerUtilisateurComponent),
        title: 'Créer utilisateur — BMCE'
      },
      {
        path: 'droits/:id',
        loadComponent: () =>
          import('./screens/administration/droits-utilisateur/droits-utilisateur.component')
            .then(m => m.DroitsUtilisateurComponent),
        title: 'Droits utilisateur — BMCE'
      },
      {
        path: 'rechercher',
        loadComponent: () =>
          import('./screens/administration/rechercher-utilisateur/rechercher-utilisateur.component')
            .then(m => m.RechercherUtilisateurComponent),
        title: 'Rechercher utilisateur — BMCE'
      },
      {
        path: 'modifier/:id',
        loadComponent: () =>
          import('./screens/administration/modifier-utilisateur/modifier-utilisateur.component')
            .then(m => m.ModifierUtilisateurComponent),
        title: 'Modifier utilisateur — BMCE'
      }
    ]
  },
  { path: '**', redirectTo: 'virements/recherche' }
];

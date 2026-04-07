import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { permissionGuard } from './shared/guards/permission.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./shared/components/login/login.component')
        .then(m => m.LoginComponent),
    title: 'Connexion — BMCE'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./shared/components/login/login.component')
        .then(m => m.LoginComponent),
    title: 'Connexion — BMCE'
  },
  {
    path: 'profil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/profile/profile.component')
        .then(m => m.ProfileComponent),
    title: 'Mon profil — BMCE'
  },
  {
    path: 'virements',
    canActivate: [authGuard],
    children: [
      {
        path: 'recherche',
        canActivate: [permissionGuard],
        data: { permission: { module: 'virements', action: 'lire' } },
        loadComponent: () =>
          import('./screens/virements/recherche-virements/recherche-virements.component')
            .then(m => m.RechercheVirementsComponent),
        title: 'Recherche des virements — BMCE'
      },
      {
        path: 'consulter',
        canActivate: [permissionGuard],
        data: { permission: { module: 'virements', action: 'lire' } },
        loadComponent: () =>
          import('./screens/virements/consulter-virement/consulter-virement.component')
            .then(m => m.ConsulterVirementComponent),
        title: 'Consulter un virement — BMCE'
      },
      {
        path: 'consulter/:id',
        canActivate: [permissionGuard],
        data: { permission: { module: 'virements', action: 'lire' } },
        loadComponent: () =>
          import('./screens/virements/consulter-virement/consulter-virement.component')
            .then(m => m.ConsulterVirementComponent),
        title: 'Consulter un virement — BMCE'
      },
      {
        path: 'message-mx',
        canActivate: [permissionGuard],
        data: { permission: { module: 'messages_mx', action: 'lire' } },
        loadComponent: () =>
          import('./screens/virements/message-mx/message-mx.component')
            .then(m => m.MessageMxComponent),
        title: 'Message MX — BMCE'
      },
      {
        path: 'message-mx/:id',
        canActivate: [permissionGuard],
        data: { permission: { module: 'messages_mx', action: 'lire' } },
        loadComponent: () =>
          import('./screens/virements/message-mx/message-mx.component')
            .then(m => m.MessageMxComponent),
        title: 'Message MX — BMCE'
      }
    ]
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    children: [
      {
        path: 'grafana',
        canActivate: [permissionGuard],
        data: { permission: { module: 'tableaux_bord', action: 'lire' } },
        loadComponent: () =>
          import('./screens/dashboard/dashboard-grafana/dashboard-grafana.component')
            .then(m => m.DashboardGrafanaComponent),
        title: 'Accueil — BMCE'
      },
      {
        path: '',
        redirectTo: 'grafana',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'administration',
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
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
  { path: '**', redirectTo: 'login' }
];

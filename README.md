# AGGMA — Bank of Africa · BMCE Group
## Système de Gestion des Virements SWIFT

---

## Structure du projet

```
src/app/
│
├── screens/                          ← Toutes les pages de l'application
│   │
│   ├── virements/                    ← Module Virements
│   │   ├── recherche-virements/      ← Recherche + filtre Émis/Reçus/Tous + n° compte
│   │   ├── consulter-virement/       ← Détail d'un virement
│   │   ├── message-mx/               ← Viewer XML ISO 20022 (pacs.008)
│   │   └── non-rapproches/           ← Liste virements non rapprochés
│   │
│   ├── dashboard/                    ← Module Tableaux de bord
│   │   ├── dashboard-non-rapproches/ ← Stats non rapprochés par SOP/période
│   │   └── dashboard-rapproches/     ← Stats rapprochés par SOP/période
│   │
│   └── administration/               ← Module Administration
│       ├── creer-utilisateur/        ← Formulaire création compte
│       ├── droits-utilisateur/       ← Gestion permissions par module
│       ├── rechercher-utilisateur/   ← Recherche et liste utilisateurs
│       └── modifier-utilisateur/     ← Modification données + droits
│
├── shared/
│   ├── components/
│   │   ├── sidebar/                  ← Navigation latérale + logo BMCE
│   │   ├── topbar/                   ← Barre supérieure sticky
│   │   ├── badge/                    ← Badges de statut réutilisables
│   │   ├── stat-card/                ← Cartes statistiques
│   │   ├── data-table/               ← Tableau générique
│   │   ├── alert/                    ← Alertes info/success/warning/danger
│   │   └── modal/                    ← Modale générique
│   │
│   ├── models/
│   │   ├── virement.model.ts         ← Interfaces Virement, Filtre, MX
│   │   └── utilisateur.model.ts      ← Interfaces User, Droits, Activité
│   │
│   └── services/                     ← Services HTTP (à implémenter)
│
└── core/
    ├── guards/                       ← Auth guards
    ├── interceptors/                 ← HTTP interceptors (token JWT)
    └── constants/
        └── app.constants.ts          ← Constantes, labels, mapping badges
```

---

## Design System — Bank of Africa BMCE

### Couleurs principales
| Variable CSS | Valeur | Usage |
|---|---|---|
| `--bmce-navy` | `#1B3A6B` | Bleu marine BMCE — couleur primaire |
| `--bmce-teal` | `#00B4D8` | Turquoise BMCE — couleur secondaire |
| `--bmce-navy-light` | `#E8EFF8` | Fond actif sidebar, hover lignes |
| `--success` | `#10B981` | Rapproché, reçu, actif |
| `--danger` | `#EF4444` | Non rapproché, erreur |
| `--warning` | `#F59E0B` | En attente, suspendu |

### Typographie
- **Sora** — Titres, valeurs, références (font-weight 600-800)
- **IBM Plex Sans** — Corps de texte, formulaires, boutons

### Classes utilitaires clés
```scss
// Boutons
.btn.btn--primary    // Bleu marine BMCE
.btn.btn--teal       // Turquoise BMCE
.btn.btn--secondary  // Contour bleu
.btn.btn--ghost      // Contour gris
.btn.btn--danger     // Rouge
.btn.btn--success    // Vert
.btn.btn--sm         // Taille réduite

// Badges statut
.badge.badge--green  // Rapproché
.badge.badge--red    // Non rapproché
.badge.badge--orange // En attente
.badge.badge--navy   // SOP, Info
.badge.badge--teal   // Secondaire

// Direction virements
.dir-icon.dir-icon--emis   // Carré bleu → émis
.dir-icon.dir-icon--recus  // Carré vert ← reçus
.amount.amount--emis        // Montant bleu (−)
.amount.amount--recus       // Montant vert (+)

// Layout
.stats-grid.stats-grid--4  // 4 colonnes
.form-grid.form-grid--2    // 2 colonnes formulaire
.bmce-card                 // Card standard
.bmce-table-wrap           // Wrapper tableau
```

---

## Routes

| URL | Screen | Description |
|---|---|---|
| `/virements/recherche` | RechercheVirementsComponent | Page principale |
| `/virements/consulter/:id` | ConsulterVirementComponent | Détail virement |
| `/virements/message-mx/:id` | MessageMxComponent | XML MX viewer |
| `/virements/non-rapproches` | NonRaprochesComponent | File d'attente |
| `/dashboard/non-rapproches` | DashboardNonRaprochesComponent | Stats |
| `/dashboard/rapproches` | DashboardRaprochesComponent | Stats |
| `/administration/creer-utilisateur` | CreerUtilisateurComponent | Création |
| `/administration/droits/:id` | DroitsUtilisateurComponent | Permissions |
| `/administration/rechercher` | RechercherUtilisateurComponent | Liste users |
| `/administration/modifier/:id` | ModifierUtilisateurComponent | Édition |

---

## Installation

```bash
npm install
ng serve
# → http://localhost:4200
```

## Build production
```bash
ng build --configuration=production
```

import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const PERMISSIONS_KEY = 'user_permissions';

interface LoginResponse {
  token: string;
  email: string;
  roleCode: 'ADMIN' | 'SUPERVISEUR';
  nom?: string;
  prenom?: string;
}

export interface UserAuth {
  email: string;
  role: 'ADMIN' | 'SUPERVISEUR';
  nom?: string;
  prenom?: string;
}

type PermissionAction = 'lire' | 'creer' | 'modifier' | 'supprimer' | 'valider';
type PermissionMatrixApi = {
  module: string;
  lire: boolean;
  creer: boolean;
  modifier: boolean;
  supprimer: boolean;
  valider: boolean;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSig = signal<UserAuth | null>(this.loadStoredUser());
  private permissionsSig = signal<Record<string, PermissionMatrixApi>>(this.loadStoredPermissions());
  private permissionsLoadedSig = signal<boolean>(false);

  constructor(private http: HttpClient) {
    this.restoreFromStorage();
    if (this.getToken() && this.currentUser()) {
      this.ensurePermissionsLoaded().subscribe();
    }
  }

  private loadStoredUser(): UserAuth | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) {
        const u = JSON.parse(raw) as UserAuth;
        if (u?.email && u?.role) return { ...u, nom: u.nom ?? '', prenom: u.prenom ?? '' };
      }
    } catch {}
    return null;
  }

  /** Nom affiché dans la sidebar : Prénom Nom, ou email si pas de nom/prénom */
  displayName(): string {
    const u = this.userSig();
    if (!u) return '';
    const prenom = (u.prenom || '').trim();
    const nom = (u.nom || '').trim();
    if (prenom || nom) return [prenom, nom].filter(Boolean).join(' ');
    return u.email || 'Utilisateur';
  }

  /** Met à jour le nom/prénom affiché (après modification du profil) */
  setProfileNames(nom: string, prenom: string): void {
    const u = this.userSig();
    if (u) {
      const updated = { ...u, nom: nom || '', prenom: prenom || '' };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      this.userSig.set(updated);
    }
  }

  private restoreFromStorage(): void {
    if (localStorage.getItem(TOKEN_KEY) && !this.userSig()) {
      this.userSig.set(this.loadStoredUser());
    }
    if (localStorage.getItem(PERMISSIONS_KEY)) {
      this.permissionsLoadedSig.set(true);
    }
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>('/api/auth/login', { email, password })
      .pipe(tap(res => {
        localStorage.setItem(TOKEN_KEY, res.token);
        const user: UserAuth = {
          email: res.email,
          role: res.roleCode,
          nom: res.nom ?? '',
          prenom: res.prenom ?? ''
        };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.userSig.set(user);
        this.permissionsSig.set({});
        this.permissionsLoadedSig.set(false);
        localStorage.removeItem(PERMISSIONS_KEY);
        this.ensurePermissionsLoaded().subscribe();
      }));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PERMISSIONS_KEY);
    this.userSig.set(null);
    this.permissionsSig.set({});
    this.permissionsLoadedSig.set(false);
  }

  getToken(): string | null {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) {
      return null;
    }
    const normalized = raw.replace(/^Bearer\s+/i, '').trim();
    return normalized || null;
  }

  currentUser() {
    return this.userSig();
  }

  roleLabel(): string {
    const r = this.userSig()?.role;
    return r === 'ADMIN' ? 'Administrateur' : r === 'SUPERVISEUR' ? 'Superviseur' : '';
  }

  isAdmin(): boolean {
    return this.userSig()?.role === 'ADMIN';
  }

  hasPermission(module: string, action: PermissionAction = 'lire'): boolean {
    if (this.isAdmin()) return true;
    const key = this.normalizeModule(module);
    const p = this.permissionsSig()[key];
    return !!p?.[action];
  }

  ensurePermissionsLoaded(forceRefresh = false): Observable<boolean> {
    if (!this.getToken() || !this.currentUser()) return of(false);
    if (this.isAdmin()) {
      this.permissionsLoadedSig.set(true);
      return of(true);
    }
    if (this.permissionsLoadedSig() && !forceRefresh) return of(true);
    const token = this.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
    return this.http.get<PermissionMatrixApi[]>('/api/auth/me/permissions', { headers }).pipe(
      tap((rows) => this.storePermissions(rows || [])),
      map(() => true),
      catchError(() => {
        // Do not wipe previously loaded permissions on transient API failure.
        // Keep the last known state to avoid hiding the entire UI unexpectedly.
        if (!this.permissionsLoadedSig()) {
          this.permissionsLoadedSig.set(true);
        }
        return of(true);
      })
    );
  }

  private loadStoredPermissions(): Record<string, PermissionMatrixApi> {
    try {
      const raw = localStorage.getItem(PERMISSIONS_KEY);
      if (!raw) return {};
      const rows = JSON.parse(raw) as PermissionMatrixApi[];
      return this.buildPermissionMap(rows || []);
    } catch {
      return {};
    }
  }

  private storePermissions(rows: PermissionMatrixApi[]): void {
    const normalized = (rows || []).map((r) => ({
      module: this.normalizeModule(r.module),
      lire: !!r.lire,
      creer: !!r.creer,
      modifier: !!r.modifier,
      supprimer: !!r.supprimer,
      valider: !!r.valider
    }));
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(normalized));
    this.permissionsSig.set(this.buildPermissionMap(normalized));
    this.permissionsLoadedSig.set(true);
  }

  private buildPermissionMap(rows: PermissionMatrixApi[]): Record<string, PermissionMatrixApi> {
    const map: Record<string, PermissionMatrixApi> = {};
    (rows || []).forEach((r) => {
      const key = this.normalizeModule(r.module);
      if (!key) return;
      map[key] = {
        module: key,
        lire: !!r.lire,
        creer: !!r.creer,
        modifier: !!r.modifier,
        supprimer: !!r.supprimer,
        valider: !!r.valider
      };
    });
    return map;
  }

  private normalizeModule(module: string): string {
    return (module || '').trim().toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_');
  }

  getProfile() {
    return this.http.get<{
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
    }>('/api/auth/me', {
      headers: { Authorization: `Bearer ${this.getToken()}` }
    });
  }

  updateProfile(payload: {
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    departement?: string;
    poste?: string;
    statut?: string;
    actif: boolean;
  }) {
    return this.http.patch('/api/auth/me', payload, {
      headers: { Authorization: `Bearer ${this.getToken()}` }
    });
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.http.patch('/api/auth/me', { currentPassword, newPassword }, {
      headers: { Authorization: `Bearer ${this.getToken()}` }
    });
  }
}


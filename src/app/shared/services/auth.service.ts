import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSig = signal<UserAuth | null>(this.loadStoredUser());

  constructor(private http: HttpClient) {
    this.restoreFromStorage();
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
      }));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSig.set(null);
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

  getProfile() {
    return this.http.get<{
      idUser?: number;
      email: string;
      roleCode: string;
      nom: string;
      prenom: string;
      actif?: boolean;
      createdAt?: string | null;
    }>('/api/auth/me', {
      headers: { Authorization: `Bearer ${this.getToken()}` }
    });
  }

  updateProfile(nom: string, prenom: string) {
    return this.http.patch('/api/auth/me', { nom, prenom }, {
      headers: { Authorization: `Bearer ${this.getToken()}` }
    });
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.http.patch('/api/auth/me', { currentPassword, newPassword }, {
      headers: { Authorization: `Bearer ${this.getToken()}` }
    });
  }
}


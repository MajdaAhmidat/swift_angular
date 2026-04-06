import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface UtilisateurApi {
  idUser?: number;
  idRoleRole?: number;
  login: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  departement?: string;
  poste?: string;
  statut?: string;
  roleCode?: string;
  roleId?: number;
  actif?: boolean;
  createdAt?: string | null;
}

export interface RoleApi {
  idRole: number;
  code: string;
  label: string;
}

export interface PermissionMatrixApi {
  idPermission?: number;
  module: string;
  lire: boolean;
  creer: boolean;
  modifier: boolean;
  supprimer: boolean;
  valider: boolean;
}

@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  private base = '/api/utilisateurs';
  private rolesBase = '/api/roles';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private getOptions(): { headers: HttpHeaders } {
    const token = this.auth.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
    return { headers };
  }

  getList(): Observable<UtilisateurApi[]> {
    return this.http.get<UtilisateurApi[]>(this.base, this.getOptions());
  }

  getById(idUser: number): Observable<UtilisateurApi> {
    return this.http.get<UtilisateurApi>(`${this.base}/${idUser}`, this.getOptions());
  }

  create(user: {
    login: string;
    motdepasse: string;
    nom?: string;
    prenom?: string;
    telephone?: string;
    departement?: string;
    poste?: string;
    statut?: string;
    roleId: number;
    actif?: boolean;
  }): Observable<UtilisateurApi> {
    return this.http.post<UtilisateurApi>(this.base, {
      login: user.login,
      motdepasse: user.motdepasse,
      nom: user.nom || '',
      prenom: user.prenom || '',
      telephone: user.telephone || '',
      departement: user.departement || '',
      poste: user.poste || '',
      statut: user.statut || '',
      roleId: user.roleId,
      actif: user.actif !== false
    }, this.getOptions());
  }

  update(user: UtilisateurApi & { motdepasse?: string }): Observable<UtilisateurApi> {
    return this.http.put<UtilisateurApi>(this.base, {
      idUser: user.idUser,
      idRoleRole: user.idRoleRole,
      login: user.login,
      nom: user.nom,
      prenom: user.prenom,
      telephone: user.telephone,
      departement: user.departement,
      poste: user.poste,
      statut: user.statut,
      roleId: user.roleId,
      actif: user.actif,
      motdepasse: user.motdepasse || undefined
    }, this.getOptions());
  }

  delete(idUser: number, idRoleRole: number): Observable<void> {
    return this.http.delete<void>(`${this.base}?idUser=${idUser}&idRoleRole=${idRoleRole}`, this.getOptions());
  }

  getRoles(): Observable<RoleApi[]> {
    return this.http.get<RoleApi[]>(this.rolesBase, this.getOptions());
  }

  getUserPermissions(idUser: number): Observable<PermissionMatrixApi[]> {
    return this.http.get<PermissionMatrixApi[]>(`/api/permissions/user/${idUser}`, this.getOptions());
  }

  saveUserPermissions(idUser: number, matrix: PermissionMatrixApi[]): Observable<PermissionMatrixApi[]> {
    return this.http.put<PermissionMatrixApi[]>(`/api/permissions/user/${idUser}`, matrix, this.getOptions());
  }
}

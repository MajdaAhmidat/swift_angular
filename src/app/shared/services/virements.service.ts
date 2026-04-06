import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { AuthService } from './auth.service';

export interface VirementEmisApi {
  idVrtEmis: number;
  idSop: number;
  idStatutStatut?: number;
  idAdresseAdresse?: number;
  codeBicBic?: number;
  codeMsgTypeMessage?: number;
  reference: string;
  denominationBnf: string;
  numCompteBnf: string;
  numCompteOrd: string;
  denominationOrd: string;
  montant: number;
  dateValeur: string;
  renseignement?: string;
  codeDevise?: string;
  dateIntegration?: string;
  bicOrdonnateur: string;
  bicBeneficiaire: string;
  uetr?: string;
  endToEnd?: string;
  statutRappro?: string;
  statutSwift?: string;
}

export interface VirementRecuApi {
  idVrtRecu: number;
  idStatutStatut?: number;
  idAdresseAdresse?: number;
  idSop: number;
  codeBicBic?: number;
  codeMsgTypeMessage?: number;
  reference: string;
  denominationBnf: string;
  numCompteBnf: string;
  numCompteOrd: string;
  denominationOrd: string;
  montant: number;
  dateValeur: string;
  renseignement?: string;
  codeDevise?: string;
  dateIntegration?: string;
  bicOrdonnateur: string;
  bicBeneficiaire: string;
  uetr?: string;
  endToEnd?: string;
  statutRapprochement?: string;
}

export interface VirementEmisHistoApi {
  idVrtEmisHisto: number;
  idVrtEmis: number;
  idSopVirementEmis?: number;
  codeBicBicVirementEmis?: number;
  codeMsgTypeMessageVirementEmis?: number;
  dateIntegration?: string;
  dateHistorisation?: string;
}

export interface VirementRecuHistoApi {
  idVrtRecuHisto: number;
  idVrtRecuVirementRecu: number;
  idSopVirementRecu?: number;
  codeBicBicVirementRecu?: number;
  codeMsgTypeMessageVirementRecu?: number;
  dateIntegration?: string;
  dateHistorisation?: string;
}

export interface SopApi {
  id: number;
  libelleSop: string;
}

@Injectable({ providedIn: 'root' })
export class VirementsService {
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

  getVirementsEmis(): Observable<VirementEmisApi[]> {
    return this.http.get<VirementEmisApi[]>('/api/virements-emis', this.getOptions());
  }

  getVirementsRecus(): Observable<VirementRecuApi[]> {
    return this.http.get<VirementRecuApi[]>('/api/virements-recu', this.getOptions());
  }

  getSops(): Observable<SopApi[]> {
    return this.http.get<SopApi[]>('/api/sops', this.getOptions());
  }

  getRecherchePayload(): Observable<{
    emis: VirementEmisApi[];
    recus: VirementRecuApi[];
    sops: SopApi[];
  }> {
    return forkJoin({
      emis: this.getVirementsEmis(),
      recus: this.getVirementsRecus(),
      sops: this.getSops()
    });
  }

  getMessageXmlByVirementEmis(idVrtEmis: number | string): Observable<string> {
    return this.http.get(`/api/messages-xml/virement-emis/${idVrtEmis}`, {
      ...this.getOptions(),
      responseType: 'text'
    });
  }

  getMessageXmlByVirementRecu(idVrtRecu: number | string): Observable<string> {
    return this.http.get(`/api/messages-xml/virement-recu/${idVrtRecu}`, {
      ...this.getOptions(),
      responseType: 'text'
    });
  }

  getVirementsEmisHisto(): Observable<VirementEmisHistoApi[]> {
    return this.http.get<VirementEmisHistoApi[]>('/api/virements-emis-histo', this.getOptions());
  }

  getVirementsRecuHisto(): Observable<VirementRecuHistoApi[]> {
    return this.http.get<VirementRecuHistoApi[]>('/api/virements-recu-histo', this.getOptions());
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { AuthService } from './auth.service';

/** Ligne MESSAGE_EMIS (liste / clé pour XML). */
export interface MessageEmisListApi {
  idMsgEmis: number;
  idVrtEmisVirementEmis: number;
  idSopVirementEmis: number;
  idStatutStatutVirementEmis: number;
  idAdresseAdresseVirementEmis: number;
  codeBicBicVirementEmis: number;
  codeMsgTypeMessageVirementEmis: number;
  idVrtEmis: number;
  nom?: string | null;
  path?: string | null;
}

/** Ligne MESSAGE_RECU (liste / clé pour XML). */
export interface MessageRecuListApi {
  idMsgRecu: number;
  idVrtRecuVirementRecu: number;
  idStatutStatutVirementRecu: number;
  idAdresseAdresseVirementRecu: number;
  idSopVirementRecu: number;
  codeBicBicVirementRecu: number;
  codeMsgTypeMessageVirementRecu: number;
  nom?: string | null;
  path?: string | null;
}

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

  updateVirementEmis(payload: VirementEmisApi): Observable<VirementEmisApi> {
    return this.http.put<VirementEmisApi>('/api/virements-emis', payload, this.getOptions());
  }

  getVirementsRecus(): Observable<VirementRecuApi[]> {
    return this.http.get<VirementRecuApi[]>('/api/virements-recu', this.getOptions());
  }

  updateVirementRecu(payload: VirementRecuApi): Observable<VirementRecuApi> {
    return this.http.put<VirementRecuApi>('/api/virements-recu', payload, this.getOptions());
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
    return this.http.get(`/api/messages-emis/virement/${idVrtEmis}/xml`, {
      ...this.getOptions(),
      responseType: 'text'
    });
  }

  getMessagesEmisByVirement(idVrtEmis: number | string): Observable<MessageEmisListApi[]> {
    return this.http.get<MessageEmisListApi[]>(
      `/api/messages-emis/by-virement/${idVrtEmis}`,
      this.getOptions()
    );
  }

  getMessageEmisXmlByRow(row: MessageEmisListApi): Observable<string> {
    const p = new HttpParams()
      .set('idMsgEmis', row.idMsgEmis)
      .set('idVrtEmisVirementEmis', row.idVrtEmisVirementEmis)
      .set('idSopVirementEmis', row.idSopVirementEmis)
      .set('idStatutStatutVirementEmis', row.idStatutStatutVirementEmis)
      .set('idAdresseAdresseVirementEmis', row.idAdresseAdresseVirementEmis)
      .set('codeBicBicVirementEmis', row.codeBicBicVirementEmis)
      .set('codeMsgTypeMessageVirementEmis', row.codeMsgTypeMessageVirementEmis);
    return this.http.get('/api/messages-emis/xml', {
      ...this.getOptions(),
      params: p,
      responseType: 'text'
    });
  }

  getMessageXmlByVirementRecu(idVrtRecu: number | string): Observable<string> {
    return this.http.get(`/api/messages-recu/virement/${idVrtRecu}/xml`, {
      ...this.getOptions(),
      responseType: 'text'
    });
  }

  getMessagesRecuByVirement(idVrtRecu: number | string): Observable<MessageRecuListApi[]> {
    return this.http.get<MessageRecuListApi[]>(
      `/api/messages-recu/by-virement/${idVrtRecu}`,
      this.getOptions()
    );
  }

  getMessageRecuXmlByRow(row: MessageRecuListApi): Observable<string> {
    const p = new HttpParams()
      .set('idMsgRecu', row.idMsgRecu)
      .set('idVrtRecuVirementRecu', row.idVrtRecuVirementRecu)
      .set('idStatutStatutVirementRecu', row.idStatutStatutVirementRecu)
      .set('idAdresseAdresseVirementRecu', row.idAdresseAdresseVirementRecu)
      .set('idSopVirementRecu', row.idSopVirementRecu)
      .set('codeBicBicVirementRecu', row.codeBicBicVirementRecu)
      .set('codeMsgTypeMessageVirementRecu', row.codeMsgTypeMessageVirementRecu);
    return this.http.get('/api/messages-recu/xml', {
      ...this.getOptions(),
      params: p,
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

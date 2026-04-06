import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import {
  VirementsService,
  VirementEmisApi,
  VirementRecuApi,
  SopApi,
  VirementEmisHistoApi,
  VirementRecuHistoApi
} from '../../../shared/services/virements.service';
import { combineLatest, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-consulter-virement',
  standalone: true,
  imports: [CommonModule, RouterModule, TopbarComponent],
  templateUrl: './consulter-virement.component.html',
  styleUrls: ['./consulter-virement.component.scss']
})
export class ConsulterVirementComponent implements OnInit {
  virementId = '';
  direction: 'emis' | 'recus' = 'emis';
  loading = false;
  error = '';
  rawFields: Array<{ key: string; value: string }> = [];

  virement = {
    reference: '',
    statut: 'en-attente',
    direction: 'emis',
    dateCreation: '',
    heureCreation: '',
    emetteur:      { banque: '', bic: '', iban: '' },
    beneficiaire:  { banque: '', bic: '', iban: '' },
    compteDonneurOrdre: '',
    montant: 0,
    devise: 'MAD',
    dateValeur: '',
    sop: '',
    motif: '',
    historique: [] as Array<{ titre: string; date: string; statut: 'done' | 'active' | 'pending' }>,
    messageType: '',
    idStatut: '',
    idSop: '',
    bicOrdonnateur: '',
    bicBeneficiaire: '',
    updatedAt: ''
  };

  constructor(
    private route: ActivatedRoute,
    private virementsService: VirementsService
  ) {}

  ngOnInit() {
    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(([params, query]) => {
      this.virementId = params.get('id') || '';
      const qpDirection = (query.get('direction') || '').toLowerCase();
      this.direction = qpDirection === 'recus' ? 'recus' : 'emis';
      this.loadVirement();
    });
  }

  private loadVirement(): void {
    if (!this.virementId) {
      this.error = 'Identifiant du virement manquant.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.rawFields = [];

    const historyRequest = this.direction === 'recus'
      ? this.virementsService.getVirementsRecuHisto().pipe(catchError(() => of([] as VirementRecuHistoApi[])))
      : this.virementsService.getVirementsEmisHisto().pipe(catchError(() => of([] as VirementEmisHistoApi[])));

    // Le statut et les données principales doivent s'afficher même si l'historique échoue.
    forkJoin({
      payload: this.virementsService.getRecherchePayload(),
      history: historyRequest
    }).subscribe({
      next: ({ payload, history }) => {
        const { emis, recus, sops } = payload;
        if (this.direction === 'recus') {
          const row = recus.find((v) => String(v.idVrtRecu) === this.virementId);
          if (!row) {
            this.error = `Virement RECU #${this.virementId} introuvable.`;
            this.loading = false;
            return;
          }
          this.mapRecu(row, sops, history as VirementRecuHistoApi[]);
        } else {
          const row = emis.find((v) => String(v.idVrtEmis) === this.virementId);
          if (!row) {
            this.error = `Virement EMIS #${this.virementId} introuvable.`;
            this.loading = false;
            return;
          }
          this.mapEmis(row, sops, history as VirementEmisHistoApi[]);
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger le détail du virement.';
        this.loading = false;
      }
    });
  }

  private mapEmis(v: VirementEmisApi, sops: SopApi[], historyRows: VirementEmisHistoApi[]): void {
    const dateValeur = this.toDate(v.dateValeur);
    const dateIntegration = this.formatDateAny(v.dateIntegration || v.dateValeur);
    const sopLabel = this.resolveSop(v.idSop, sops);
    const latestHistoryAt = this.getLatestEmisHistoryDate(historyRows, v);
    const updatedAt = latestHistoryAt || dateIntegration;
    const history = this.buildHistoryFromEmisHisto(historyRows, v, sopLabel, this.mapEmisStatut(v.statutSwift), updatedAt);
    this.virement = {
      ...this.virement,
      reference: v.reference || `EMIS-${v.idVrtEmis}`,
      statut: this.mapEmisStatut(v.statutSwift),
      direction: 'emis',
      dateCreation: dateIntegration.split(' ')[0] || '-',
      heureCreation: dateIntegration.split(' ')[1] || '-',
      emetteur: {
        banque: v.denominationOrd || '',
        bic: v.bicOrdonnateur || '',
        iban: v.numCompteOrd || ''
      },
      beneficiaire: {
        banque: v.denominationBnf || '',
        bic: v.bicBeneficiaire || '',
        iban: v.numCompteBnf || ''
      },
      compteDonneurOrdre: v.numCompteOrd || '',
      montant: Number(v.montant || 0),
      devise: 'MAD',
      dateValeur: this.formatDateOnly(dateValeur),
      sop: sopLabel,
      motif: '',
      historique: history,
      messageType: '',
      idStatut: v.statutSwift || '',
      idSop: String(v.idSop ?? ''),
      bicOrdonnateur: v.bicOrdonnateur || '',
      bicBeneficiaire: v.bicBeneficiaire || '',
      updatedAt
    };
    this.rawFields = this.buildRawFields(v);
  }

  private mapRecu(v: VirementRecuApi, sops: SopApi[], historyRows: VirementRecuHistoApi[]): void {
    const dateValeur = this.toDate(v.dateValeur);
    const dateIntegration = this.formatDateAny(v.dateIntegration || v.dateValeur);
    const sopLabel = this.resolveSop(v.idSop, sops);
    const latestHistoryAt = this.getLatestRecuHistoryDate(historyRows, v);
    const updatedAt = latestHistoryAt || dateIntegration;
    const history = this.buildHistoryFromRecuHisto(historyRows, v, sopLabel, this.mapRecuStatut(v.statutRapprochement), updatedAt);
    this.virement = {
      ...this.virement,
      reference: v.reference || `RECU-${v.idVrtRecu}`,
      statut: this.mapRecuStatut(v.statutRapprochement),
      direction: 'recus',
      dateCreation: dateIntegration.split(' ')[0] || '-',
      heureCreation: dateIntegration.split(' ')[1] || '-',
      emetteur: {
        banque: v.denominationOrd || '',
        bic: v.bicOrdonnateur || '',
        iban: v.numCompteOrd || ''
      },
      beneficiaire: {
        banque: v.denominationBnf || '',
        bic: v.bicBeneficiaire || '',
        iban: v.numCompteBnf || ''
      },
      compteDonneurOrdre: v.numCompteOrd || '',
      montant: Number(v.montant || 0),
      devise: 'MAD',
      dateValeur: this.formatDateOnly(dateValeur),
      sop: sopLabel,
      motif: '',
      historique: history,
      messageType: '',
      idStatut: v.statutRapprochement || '',
      idSop: String(v.idSop ?? ''),
      bicOrdonnateur: v.bicOrdonnateur || '',
      bicBeneficiaire: v.bicBeneficiaire || '',
      updatedAt
    };
    this.rawFields = this.buildRawFields(v);
  }

  private buildRawFields(source: object): Array<{ key: string; value: string }> {
    return Object.entries(source as Record<string, unknown>)
      .map(([key, value]) => ({ key, value: this.safeValue(value) }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  private safeValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '-';
    }
    return String(value);
  }

  private resolveSop(idSop: number, sops: SopApi[]): string {
    const found = (sops || []).find((s) => s.id === idSop);
    return (found?.libelleSop || '').trim() || `SOP-${idSop}`;
  }

  private buildHistorique(
    statut: 'rapproche' | 'non-rapproche' | 'en-attente',
    sop: string,
    baseDate: string,
    directionLabel: 'EMIS' | 'RECU'
  ): Array<{ titre: string; date: string; statut: 'done' | 'active' | 'pending' }> {
    const detailChargement = `${baseDate} · Flux ${directionLabel}`;
    const detailValidation = `${baseDate} · Contrôle ${sop}`;
    const detailRapprochement = `${baseDate} · Appariement automatique`;
    const detailAttente = `${baseDate} · En attente de validation opérationnelle`;

    if (statut === 'rapproche') {
      return [
        { titre: 'Virement chargé', date: detailChargement, statut: 'done' },
        { titre: `Validation ${sop}`, date: detailValidation, statut: 'done' },
        { titre: 'Rapprochement effectué', date: detailRapprochement, statut: 'done' }
      ];
    }
    if (statut === 'non-rapproche') {
      return [
        { titre: 'Virement chargé', date: detailChargement, statut: 'done' },
        { titre: `Validation ${sop}`, date: detailValidation, statut: 'active' },
        { titre: 'En attente de traitement', date: detailAttente, statut: 'pending' }
      ];
    }
    return [
      { titre: 'Virement chargé', date: detailChargement, statut: 'active' },
      { titre: `Validation ${sop}`, date: detailValidation, statut: 'pending' },
      { titre: 'Rapprochement', date: detailAttente, statut: 'pending' }
    ];
  }

  private buildHistoryFromEmisHisto(
    rows: VirementEmisHistoApi[],
    current: VirementEmisApi,
    sop: string,
    statut: 'rapproche' | 'non-rapproche' | 'en-attente',
    fallbackDate: string
  ): Array<{ titre: string; date: string; statut: 'done' | 'active' | 'pending' }> {
    const filtered = (rows || [])
      .filter((r) => this.sameEmisHistoryRow(r, current))
      .sort((a, b) => this.getHistoryDateValue(a.dateHistorisation || a.dateIntegration) - this.getHistoryDateValue(b.dateHistorisation || b.dateIntegration));

    if (!filtered.length) {
      return this.buildHistorique(statut, sop, fallbackDate || '-', 'EMIS');
    }

    const first = this.formatDateAny(filtered[0].dateHistorisation || filtered[0].dateIntegration);
    const last = this.formatDateAny(filtered[filtered.length - 1].dateHistorisation || filtered[filtered.length - 1].dateIntegration);

    if (statut === 'rapproche') {
      return [
        { titre: 'Virement chargé', date: `${first} · Flux EMIS`, statut: 'done' },
        { titre: `Validation ${sop}`, date: `${last} · Contrôle ${sop}`, statut: 'done' },
        { titre: 'Rapprochement effectué', date: `${last} · Appariement automatique`, statut: 'done' }
      ];
    }
    if (statut === 'non-rapproche') {
      return [
        { titre: 'Virement chargé', date: `${first} · Flux EMIS`, statut: 'done' },
        { titre: `Validation ${sop}`, date: `${last} · Contrôle ${sop}`, statut: 'active' },
        { titre: 'En attente de traitement', date: `${last} · Revue opérationnelle requise`, statut: 'pending' }
      ];
    }
    return [
      { titre: 'Virement chargé', date: `${first} · Flux EMIS`, statut: 'active' },
      { titre: `Validation ${sop}`, date: `${last} · Contrôle ${sop}`, statut: 'pending' },
      { titre: 'Rapprochement', date: `${last} · En attente`, statut: 'pending' }
    ];
  }

  private buildHistoryFromRecuHisto(
    rows: VirementRecuHistoApi[],
    current: VirementRecuApi,
    sop: string,
    statut: 'rapproche' | 'non-rapproche' | 'en-attente',
    fallbackDate: string
  ): Array<{ titre: string; date: string; statut: 'done' | 'active' | 'pending' }> {
    const filtered = (rows || [])
      .filter((r) => this.sameRecuHistoryRow(r, current))
      .sort((a, b) => this.getHistoryDateValue(a.dateHistorisation || a.dateIntegration) - this.getHistoryDateValue(b.dateHistorisation || b.dateIntegration));

    if (!filtered.length) {
      return this.buildHistorique(statut, sop, fallbackDate || '-', 'RECU');
    }

    const first = this.formatDateAny(filtered[0].dateHistorisation || filtered[0].dateIntegration);
    const last = this.formatDateAny(filtered[filtered.length - 1].dateHistorisation || filtered[filtered.length - 1].dateIntegration);

    if (statut === 'rapproche') {
      return [
        { titre: 'Virement chargé', date: `${first} · Flux RECU`, statut: 'done' },
        { titre: `Validation ${sop}`, date: `${last} · Contrôle ${sop}`, statut: 'done' },
        { titre: 'Rapprochement effectué', date: `${last} · Appariement automatique`, statut: 'done' }
      ];
    }
    if (statut === 'non-rapproche') {
      return [
        { titre: 'Virement chargé', date: `${first} · Flux RECU`, statut: 'done' },
        { titre: `Validation ${sop}`, date: `${last} · Contrôle ${sop}`, statut: 'active' },
        { titre: 'En attente de traitement', date: `${last} · Revue opérationnelle requise`, statut: 'pending' }
      ];
    }
    return [
      { titre: 'Virement chargé', date: `${first} · Flux RECU`, statut: 'active' },
      { titre: `Validation ${sop}`, date: `${last} · Contrôle ${sop}`, statut: 'pending' },
      { titre: 'Rapprochement', date: `${last} · En attente`, statut: 'pending' }
    ];
  }

  get badgeClass() {
    return this.virement.statut === 'rapproche' ? 'badge--green'
         : this.virement.statut === 'non-rapproche' ? 'badge--red' : 'badge--orange';
  }

  get badgeLabel() {
    return this.virement.statut === 'rapproche' ? 'Rapproché'
         : this.virement.statut === 'non-rapproche' ? 'Non rapproché' : 'En attente';
  }

  private mapEmisStatut(statutSwift?: string): 'rapproche' | 'non-rapproche' | 'en-attente' {
    const s = (statutSwift || '').trim().toUpperCase();
    if (s === 'ACK') return 'rapproche';
    if (s === 'NACK') return 'non-rapproche';
    return 'en-attente';
  }

  private mapRecuStatut(statutRapprochement?: string): 'rapproche' | 'non-rapproche' | 'en-attente' {
    const s = (statutRapprochement || '').trim().toUpperCase();
    if (s === 'RAPPROCHE') return 'rapproche';
    if (s === 'NON_RAPPROCHE') return 'non-rapproche';
    return 'en-attente';
  }

  private toDate(value?: string): Date {
    if (!value) return new Date(0);
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? new Date(0) : d;
  }

  private formatDateAny(value?: string): string {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      const local = new Date(`${value}T00:00:00`);
      if (Number.isNaN(local.getTime())) return '-';
      return `${local.toLocaleDateString('fr-FR')} ${local.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `${d.toLocaleDateString('fr-FR')} ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  }

  private getHistoryDateValue(value?: string): number {
    if (!value) return 0;
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.getTime();
    const local = new Date(`${value}T00:00:00`);
    return Number.isNaN(local.getTime()) ? 0 : local.getTime();
  }

  private getLatestEmisHistoryDate(rows: VirementEmisHistoApi[], current: VirementEmisApi): string {
    const filtered = (rows || [])
      .filter((r) => this.sameEmisHistoryRow(r, current))
      .sort((a, b) => this.getHistoryDateValue(b.dateHistorisation || b.dateIntegration) - this.getHistoryDateValue(a.dateHistorisation || a.dateIntegration));
    if (!filtered.length) return '';
    return this.formatDateAny(filtered[0].dateHistorisation || filtered[0].dateIntegration);
  }

  private getLatestRecuHistoryDate(rows: VirementRecuHistoApi[], current: VirementRecuApi): string {
    const filtered = (rows || [])
      .filter((r) => this.sameRecuHistoryRow(r, current))
      .sort((a, b) => this.getHistoryDateValue(b.dateHistorisation || b.dateIntegration) - this.getHistoryDateValue(a.dateHistorisation || a.dateIntegration));
    if (!filtered.length) return '';
    return this.formatDateAny(filtered[0].dateHistorisation || filtered[0].dateIntegration);
  }

  private sameEmisHistoryRow(row: VirementEmisHistoApi, current: VirementEmisApi): boolean {
    if (Number(row.idVrtEmis) !== Number(current.idVrtEmis)) return false;
    if (!this.optNumberEquals(row.idSopVirementEmis, current.idSop)) return false;
    if (!this.optNumberEquals(row.codeMsgTypeMessageVirementEmis, current.codeMsgTypeMessage)) return false;
    if (!this.optNumberEquals(row.codeBicBicVirementEmis, current.codeBicBic)) return false;
    return true;
  }

  private sameRecuHistoryRow(row: VirementRecuHistoApi, current: VirementRecuApi): boolean {
    if (Number(row.idVrtRecuVirementRecu) !== Number(current.idVrtRecu)) return false;
    if (!this.optNumberEquals(row.idSopVirementRecu, current.idSop)) return false;
    if (!this.optNumberEquals(row.codeMsgTypeMessageVirementRecu, current.codeMsgTypeMessage)) return false;
    if (!this.optNumberEquals(row.codeBicBicVirementRecu, current.codeBicBic)) return false;
    return true;
  }

  private optNumberEquals(a?: number, b?: number): boolean {
    if (a == null || b == null) return true;
    return Number(a) === Number(b);
  }

  private formatDateOnly(value: Date): string {
    if (value.getTime() === 0) return '-';
    return value.toLocaleDateString('fr-FR');
  }

  private formatDateTime(value: Date): { date: string; time: string; full: string } {
    if (value.getTime() === 0) return { date: '-', time: '-', full: '-' };
    const date = value.toLocaleDateString('fr-FR');
    const time = value.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return { date, time, full: `${date} ${time}` };
  }
}

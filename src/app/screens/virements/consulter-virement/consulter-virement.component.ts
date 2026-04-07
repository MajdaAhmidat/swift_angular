import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
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
import { AuthService } from '../../../shared/services/auth.service';
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
  readonly auth = inject(AuthService);
  virementId = '';
  direction: 'emis' | 'recus' = 'emis';
  loading = false;
  error = '';
  selectionRequired = false;

  virement = {
    reference: '',
    statut: 'en-attente',
    direction: 'emis',
    dateCreation: '',
    heureCreation: '',
    emetteur: { banque: '', bic: '', iban: '' },
    beneficiaire: { banque: '', bic: '', iban: '' },
    montant: 0,
    devise: 'MAD',
    dateValeur: '',
    sop: '',
    motif: '',
    historique: [] as Array<{ titre: string; date: string; statut: 'done' | 'active' | 'pending' }>,
    updatedAt: ''
  };

  constructor(
    private route: ActivatedRoute,
    private virementsService: VirementsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(([params, query]) => {
      this.virementId = params.get('id') || '';
      const qpDirection = (query.get('direction') || '').toLowerCase();
      this.direction = qpDirection === 'recus' ? 'recus' : 'emis';
      this.loadVirement();
    });
  }

  private loadVirement(): void {
    if (!this.virementId) {
      this.loading = false;
      this.error = '';
      this.selectionRequired = true;
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.error = '';
    this.selectionRequired = false;

    const historyRequest = this.direction === 'recus'
      ? this.virementsService.getVirementsRecuHisto().pipe(catchError(() => of([] as VirementRecuHistoApi[])))
      : this.virementsService.getVirementsEmisHisto().pipe(catchError(() => of([] as VirementEmisHistoApi[])));

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
            this.cdr.detectChanges();
            return;
          }
          this.mapRecu(row, sops, history as VirementRecuHistoApi[]);
        } else {
          const row = emis.find((v) => String(v.idVrtEmis) === this.virementId);
          if (!row) {
            this.error = `Virement EMIS #${this.virementId} introuvable.`;
            this.loading = false;
            this.cdr.detectChanges();
            return;
          }
          this.mapEmis(row, sops, history as VirementEmisHistoApi[]);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Impossible de charger le détail du virement.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private mapEmis(v: VirementEmisApi, sops: SopApi[], historyRows: VirementEmisHistoApi[]): void {
    const sopLabel = this.resolveSop(v.idSop, sops);
    const statut = (v.statutSwift || '').toUpperCase() === 'ACK' ? 'rapproche' : ((v.statutSwift || '').toUpperCase() === 'NACK' ? 'non-rapproche' : 'en-attente');
    const dateIntegration = this.formatDateAny(v.dateIntegration || v.dateValeur);
    this.virement = {
      ...this.virement,
      reference: v.reference || `EMIS-${v.idVrtEmis}`,
      statut,
      direction: 'emis',
      dateCreation: dateIntegration.split(' ')[0] || '-',
      heureCreation: dateIntegration.split(' ')[1] || '-',
      emetteur: { banque: v.denominationOrd || '', bic: v.bicOrdonnateur || '', iban: v.numCompteOrd || '' },
      beneficiaire: { banque: v.denominationBnf || '', bic: v.bicBeneficiaire || '', iban: v.numCompteBnf || '' },
      montant: Number(v.montant || 0),
      devise: 'MAD',
      dateValeur: this.formatDateOnly(v.dateValeur),
      sop: sopLabel,
      motif: '',
      historique: this.buildHistoryFromEmisHisto(historyRows, v, sopLabel, statut, dateIntegration),
      updatedAt: dateIntegration
    };
  }

  private mapRecu(v: VirementRecuApi, sops: SopApi[], historyRows: VirementRecuHistoApi[]): void {
    const sopLabel = this.resolveSop(v.idSop, sops);
    const statut = (v.statutRapprochement || '').toUpperCase() === 'RAPPROCHE' ? 'rapproche' : ((v.statutRapprochement || '').toUpperCase() === 'NON_RAPPROCHE' ? 'non-rapproche' : 'en-attente');
    const dateIntegration = this.formatDateAny(v.dateIntegration || v.dateValeur);
    this.virement = {
      ...this.virement,
      reference: v.reference || `RECU-${v.idVrtRecu}`,
      statut,
      direction: 'recus',
      dateCreation: dateIntegration.split(' ')[0] || '-',
      heureCreation: dateIntegration.split(' ')[1] || '-',
      emetteur: { banque: v.denominationOrd || '', bic: v.bicOrdonnateur || '', iban: v.numCompteOrd || '' },
      beneficiaire: { banque: v.denominationBnf || '', bic: v.bicBeneficiaire || '', iban: v.numCompteBnf || '' },
      montant: Number(v.montant || 0),
      devise: 'MAD',
      dateValeur: this.formatDateOnly(v.dateValeur),
      sop: sopLabel,
      motif: '',
      historique: this.buildHistoryFromRecuHisto(historyRows, v, sopLabel, statut, dateIntegration),
      updatedAt: dateIntegration
    };
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
    if (statut === 'rapproche') {
      return [
        { titre: 'Virement chargé', date: `${baseDate} · Flux ${directionLabel}`, statut: 'done' },
        { titre: `Validation ${sop}`, date: `${baseDate} · Contrôle ${sop}`, statut: 'done' },
        { titre: 'Rapprochement effectué', date: `${baseDate} · Appariement automatique`, statut: 'done' }
      ];
    }
    if (statut === 'non-rapproche') {
      return [
        { titre: 'Virement chargé', date: `${baseDate} · Flux ${directionLabel}`, statut: 'done' },
        { titre: `Validation ${sop}`, date: `${baseDate} · Contrôle ${sop}`, statut: 'active' },
        { titre: 'En attente de traitement', date: `${baseDate} · Revue opérationnelle requise`, statut: 'pending' }
      ];
    }
    return [
      { titre: 'Virement chargé', date: `${baseDate} · Flux ${directionLabel}`, statut: 'active' },
      { titre: `Validation ${sop}`, date: `${baseDate} · Contrôle ${sop}`, statut: 'pending' },
      { titre: 'Rapprochement', date: `${baseDate} · En attente`, statut: 'pending' }
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
      .filter((r) => String(r.idVrtEmis) === String(current.idVrtEmis))
      .sort((a, b) => this.getHistoryDateValue(a.dateHistorisation || a.dateIntegration) - this.getHistoryDateValue(b.dateHistorisation || b.dateIntegration));

    if (!filtered.length) return this.buildHistorique(statut, sop, fallbackDate, 'EMIS');

    const first = this.formatDateAny(filtered[0].dateHistorisation || filtered[0].dateIntegration);
    const last = this.formatDateAny(filtered[filtered.length - 1].dateHistorisation || filtered[filtered.length - 1].dateIntegration);
    return this.buildHistorique(statut, sop, last, 'EMIS').map((step, idx) => {
      if (idx === 0) return { ...step, date: `${first} · Flux EMIS` };
      if (idx === 1) return { ...step, date: `${last} · Validation ${sop}` };
      return { ...step, date: `${last} · Suivi final` };
    });
  }

  private buildHistoryFromRecuHisto(
    rows: VirementRecuHistoApi[],
    current: VirementRecuApi,
    sop: string,
    statut: 'rapproche' | 'non-rapproche' | 'en-attente',
    fallbackDate: string
  ): Array<{ titre: string; date: string; statut: 'done' | 'active' | 'pending' }> {
    const filtered = (rows || [])
      .filter((r) => String(r.idVrtRecuVirementRecu) === String(current.idVrtRecu))
      .sort((a, b) => this.getHistoryDateValue(a.dateHistorisation || a.dateIntegration) - this.getHistoryDateValue(b.dateHistorisation || b.dateIntegration));

    if (!filtered.length) return this.buildHistorique(statut, sop, fallbackDate, 'RECU');

    const first = this.formatDateAny(filtered[0].dateHistorisation || filtered[0].dateIntegration);
    const last = this.formatDateAny(filtered[filtered.length - 1].dateHistorisation || filtered[filtered.length - 1].dateIntegration);
    return this.buildHistorique(statut, sop, last, 'RECU').map((step, idx) => {
      if (idx === 0) return { ...step, date: `${first} · Flux RECU` };
      if (idx === 1) return { ...step, date: `${last} · Validation ${sop}` };
      return { ...step, date: `${last} · Suivi final` };
    });
  }

  get badgeClass(): string {
    return this.virement.statut === 'rapproche' ? 'badge--green'
      : this.virement.statut === 'non-rapproche' ? 'badge--red' : 'badge--orange';
  }

  get badgeLabel(): string {
    return this.virement.statut === 'rapproche' ? 'Rapproché'
      : this.virement.statut === 'non-rapproche' ? 'Non rapproché' : 'En attente';
  }

  private formatDateOnly(value?: string): string {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('fr-FR');
  }

  private formatDateAny(value?: string): string {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return `${d.toLocaleDateString('fr-FR')} ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  }

  private getHistoryDateValue(value?: string): number {
    if (!value) return 0;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? 0 : d.getTime();
  }
}

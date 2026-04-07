import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { SafeResourceUrlPipe } from '../../../shared/pipes/safe-resource-url.pipe';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-dashboard-grafana',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    TopbarComponent,
    SafeResourceUrlPipe
  ],
  templateUrl: './dashboard-grafana.component.html',
  styleUrls: ['./dashboard-grafana.component.scss']
})
export class DashboardGrafanaComponent implements OnInit {
  readonly messageTypeOptions = [
    { value: '__all', label: 'Tous les messages' },
    { value: 'Emis ACK', label: 'EMIS ACK' },
    { value: 'Emis NACK', label: 'EMIS NACK' },
    { value: 'Recu Rapproche', label: 'RECU rapproché' },
    { value: 'Recu Non rapproche', label: 'RECU non rapproché' }
  ];

  sops: any[] = [];
  selectedSopId: string = ''; // Vide par défaut pour masquer le graphe au début
  selectedDateFrom: string = '';
  selectedDateTo: string = '';
  selectedPacsType: string = '__all';
  selectedMessageType: string = '__all';
  private refreshNonce = 0;
  loading = false;
  error = '';
  panels = [
    { id: 'panel-4' },
    { id: 'panel-2' },
    { id: 'panel-3' }
  ];

 
  private grafanaDashboard = {
    uid: 'adhdd8k',
    slug: 'virement-recu',
    panelId: 'panel-1'
  };

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchSops();
  }

  fetchSops() {
    this.loading = true;
    this.error = '';
    const token = this.auth.getToken();
    if (!token) {
      this.sops = [];
      this.loading = false;
      this.error = 'Session expirée: token absent.';
      this.cdr.detectChanges();
      console.error('Aucun token JWT trouvé: impossible de charger les SOP.');
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    // Utilise le proxy Angular (/api -> localhost:8080) pour éviter le CORS et rester cohérent avec l'app
    this.http.get<any[]>('/api/sops', { headers }).subscribe({
      next: (data) => {
        console.log('SOPs chargés :', data);
        this.sops = data || [];
        if (this.sops.length) {
          const latest = [...this.sops].sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))[0];
          if (latest?.id != null) {
            this.selectedSopId = String(latest.id);
            this.refreshNonce++;
          }
        } else {
          this.selectedSopId = '';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Erreur lors de la récupération des SOP.';
        this.cdr.detectChanges();
        console.error('Erreur lors de la récupération des SOP', err);
      }
    });
  }

  onSopChange(value: string): void {
    this.selectedSopId = value;
    this.refreshNonce++;
    this.cdr.detectChanges();
  }

  onMessageTypeChange(value: string): void {
    this.selectedMessageType = value;
    this.refreshNonce++;
    this.cdr.detectChanges();
  }

  onPacsTypeChange(value: string): void {
    this.selectedPacsType = value;
    this.refreshNonce++;
    this.cdr.detectChanges();
  }

  onDateRangeChange(): void {
    this.refreshNonce++;
    this.cdr.detectChanges();
  }

  private resolveGrafanaFrom(range: { from: string; to: string }): string {
    if (range.from) {
      return `${range.from}T00:00:00`;
    }
    return 'now-30d';
  }

  private resolveGrafanaTo(range: { from: string; to: string }): string {
    if (range.to) {
      return `${range.to}T23:59:59`;
    }
    return 'now';
  }

  private normalizedDateRange(): { from: string; to: string } {
    let from = this.selectedDateFrom || '';
    let to = this.selectedDateTo || '';
    if (from && to && from > to) {
      const tmp = from;
      from = to;
      to = tmp;
    }
    return { from, to };
  }

  getPanelUrl(panelId: string): string {
    if (!this.selectedSopId) return '';
    const host = 'http://localhost:3000';
    const range = this.normalizedDateRange();
    const from = this.resolveGrafanaFrom(range);
    const to = this.resolveGrafanaTo(range);
    const messageVar = this.selectedMessageType === '__all'
      ? 'All'
      : this.selectedMessageType;
    const pacsVar = this.selectedPacsType === '__all'
      ? 'All'
      : this.selectedPacsType;
    return `${host}/d-solo/${this.grafanaDashboard.uid}/${this.grafanaDashboard.slug}?orgId=1&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&timezone=browser&panelId=${panelId}&var-id_sop=${this.selectedSopId}&var-message_type=${encodeURIComponent(messageVar)}&var-type_message=${encodeURIComponent(messageVar)}&var-pacs_type=${encodeURIComponent(pacsVar)}&var-pacs=${encodeURIComponent(pacsVar)}&theme=light&kiosk=tv&_ts=${this.refreshNonce}`;
  }
}

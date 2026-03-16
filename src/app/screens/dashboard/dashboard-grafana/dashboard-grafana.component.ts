import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { SafeResourceUrlPipe } from '../../../shared/pipes/safe-resource-url.pipe';
import {
  GRAFANA_BASE_URL,
  GRAFANA_DASHBOARD_UID,
  GRAFANA_REFRESH_INTERVAL
} from '../../../core/constants/app.constants';

@Component({
  selector: 'app-dashboard-grafana',
  standalone: true,
  imports: [CommonModule, TopbarComponent, SafeResourceUrlPipe],
  templateUrl: './dashboard-grafana.component.html',
  styleUrls: ['./dashboard-grafana.component.scss']
})
export class DashboardGrafanaComponent {
  refreshLabel = GRAFANA_REFRESH_INTERVAL;

  /** URL complète du dashboard Grafana (iframe), avec rafraîchissement automatique (temps réel). */
  grafanaUrl = computed(() => {
    const base = GRAFANA_BASE_URL.replace(/\/$/, '');
    const path = GRAFANA_DASHBOARD_UID
      ? `/d/${GRAFANA_DASHBOARD_UID}`
      : '/dashboard/new';
    const params = new URLSearchParams();
    params.set('refresh', GRAFANA_REFRESH_INTERVAL);
    params.set('kiosk', '');
    return `${base}${path}?${params.toString()}`;
  });
}

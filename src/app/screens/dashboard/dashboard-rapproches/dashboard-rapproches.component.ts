import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-dashboard-rapproches',
  standalone: true,
  imports: [CommonModule, TopbarComponent],
  templateUrl: './dashboard-rapproches.component.html',
  styleUrls: ['./dashboard-rapproches.component.scss']
})
export class DashboardRaprochesComponent {
  sopPerf = [
    { sop:'SOP-001', rapproches:2640, montant:'124.5M', delai:'2.1h', taux:99.2, bars:[120,140,110,155,130,160,90] },
    { sop:'SOP-002', rapproches:1480, montant:'98.2M',  delai:'3.4h', taux:97.8, bars:[80,95,72,110,88,102,60] },
    { sop:'SOP-003', rapproches:677,  montant:'59.8M',  delai:'4.8h', taux:95.5, bars:[50,62,44,70,55,68,38] },
  ];

  get totalRap()    { return this.sopPerf.reduce((s, x) => s + x.rapproches, 0); }
}

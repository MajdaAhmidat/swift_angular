import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-dashboard-non-rapproches',
  standalone: true,
  imports: [CommonModule, TopbarComponent],
  templateUrl: './dashboard-non-rapproches.component.html',
  styleUrls: ['./dashboard-non-rapproches.component.scss']
})
export class DashboardNonRaprochesComponent {
  periode = 'mois';
  maxVal = 320;

  sopStats = [
    { sop:'SOP-001', total:320, resolus:296, taux:92.5, barH:160, bars:[
      { j:'Lun', nr:12, r:88 }, { j:'Mar', nr:8, r:92 }, { j:'Mer', nr:15, r:85 },
      { j:'Jeu', nr:6, r:94 },  { j:'Ven', nr:18, r:78 }, { j:'Sam', nr:3, r:42 }, { j:'Dim', nr:1, r:20 }
    ]},
    { sop:'SOP-002', total:280, resolus:241, taux:86.1, barH:140, bars:[
      { j:'Lun', nr:20, r:60 }, { j:'Mar', nr:14, r:66 }, { j:'Mer', nr:22, r:55 },
      { j:'Jeu', nr:11, r:70 }, { j:'Ven', nr:25, r:48 }, { j:'Sam', nr:5, r:32 }, { j:'Dim', nr:2, r:15 }
    ]},
    { sop:'SOP-003', total:221, resolus:185, taux:83.7, barH:110, bars:[
      { j:'Lun', nr:15, r:50 }, { j:'Mar', nr:10, r:55 }, { j:'Mer', nr:18, r:44 },
      { j:'Jeu', nr:8, r:62 },  { j:'Ven', nr:22, r:40 }, { j:'Sam', nr:4, r:25 }, { j:'Dim', nr:1, r:12 }
    ]},
  ];

  get totalNonRap() { return this.sopStats.reduce((s, x) => s + x.total, 0); }
  get totalResolus() { return this.sopStats.reduce((s, x) => s + x.resolus, 0); }
  get tauxGlobal() { return ((this.totalResolus / this.totalNonRap) * 100).toFixed(1); }
}

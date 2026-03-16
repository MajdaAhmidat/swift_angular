import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';

interface ModuleDroit {
  key: string;
  label: string;
  lire: boolean; creer: boolean; modifier: boolean; supprimer: boolean; valider: boolean;
}

@Component({
  selector: 'app-droits-utilisateur',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TopbarComponent],
  templateUrl: './droits-utilisateur.component.html',
  styleUrls: ['./droits-utilisateur.component.scss']
})
export class DroitsUtilisateurComponent implements OnInit {
  userId = '';
  modules: ModuleDroit[] = [
    { key:'virements',      label:'Virements',       lire:true,  creer:false, modifier:false, supprimer:false, valider:false },
    { key:'messages-mx',    label:'Messages MX',     lire:true,  creer:false, modifier:false, supprimer:false, valider:false },
    { key:'rapprochement',  label:'Rapprochement',   lire:true,  creer:false, modifier:false, supprimer:false, valider:false },
    { key:'tableaux-bord',  label:'Tableaux de bord',lire:true,  creer:false, modifier:false, supprimer:false, valider:false },
    { key:'administration', label:'Administration',   lire:false, creer:false, modifier:false, supprimer:false, valider:false },
  ];

  constructor(private route: ActivatedRoute) {}
  ngOnInit() { this.userId = this.route.snapshot.paramMap.get('id') || ''; }

  appliquerProfil(profil: string) {
    this.modules.forEach(m => {
      if (profil === 'lecteur') {
        m.lire = true; m.creer = false; m.modifier = false; m.supprimer = false; m.valider = false;
      } else if (profil === 'operateur') {
        m.lire = true; m.creer = m.key !== 'administration'; m.modifier = m.key !== 'administration';
        m.supprimer = false; m.valider = false;
      } else if (profil === 'superviseur') {
        m.lire = true; m.creer = true; m.modifier = true; m.supprimer = m.key !== 'administration';
        m.valider = m.key !== 'administration';
      } else if (profil === 'administrateur') {
        m.lire = true; m.creer = true; m.modifier = true; m.supprimer = true; m.valider = true;
      }
    });
  }
}

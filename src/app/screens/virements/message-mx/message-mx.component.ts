import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { combineLatest } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import {
  MessageEmisListApi,
  MessageRecuListApi,
  VirementsService
} from '../../../shared/services/virements.service';

@Component({
  selector: 'app-message-mx',
  standalone: true,
  imports: [CommonModule, RouterModule, TopbarComponent],
  templateUrl: './message-mx.component.html',
  styleUrls: ['./message-mx.component.scss']
})
export class MessageMxComponent implements OnInit {
  virementId = '';
  direction: 'emis' | 'recus' = 'emis';

  loading = false;
  error = '';
  xmlContent = '';
  fileName = '';
  filePath = '';
  copySuccess = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private virementsService: VirementsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(([params, query]) => {
      const id = params.get('id') || '';
      if (!id) {
        this.router.navigate(['/virements/recherche'], { replaceUrl: true });
        return;
      }
      this.virementId = id;
      const qpDirection = (query.get('direction') || '').toLowerCase();
      this.direction = qpDirection === 'recus' ? 'recus' : 'emis';
      this.loadCorrespondingMessage();
    });
  }

  copyXml(): void {
    if (!this.xmlContent || !navigator?.clipboard) return;
    navigator.clipboard.writeText(this.xmlContent).then(() => {
      this.copySuccess = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.copySuccess = false;
        this.cdr.detectChanges();
      }, 1200);
    }).catch(() => {});
  }

  downloadAsText(): void {
    if (!this.xmlContent) return;
    const direction = this.direction === 'recus' ? 'recu' : 'emis';
    const filename = `message-mx-${direction}-${this.virementId || 'unknown'}.txt`;
    const blob = new Blob([this.xmlContent], { type: 'text/plain;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  }

  private loadCorrespondingMessage(): void {
    this.loading = true;
    this.error = '';
    this.xmlContent = '';
    this.fileName = '';
    this.filePath = '';

    const done = () => {
      this.loading = false;
      this.cdr.detectChanges();
    };

    if (this.direction === 'recus') {
      this.virementsService.getMessagesRecuByVirement(this.virementId)
        .pipe(finalize(done))
        .subscribe({
          next: (rows) => this.pickAndLoadRecu(rows || []),
          error: () => { this.error = 'Aucun message MX reçu trouvé pour ce virement.'; }
        });
      return;
    }

    this.virementsService.getMessagesEmisByVirement(this.virementId)
      .pipe(finalize(done))
      .subscribe({
        next: (rows) => this.pickAndLoadEmis(rows || []),
        error: () => { this.error = 'Aucun message MX émis trouvé pour ce virement.'; }
      });
  }

  private pickAndLoadEmis(rows: MessageEmisListApi[]): void {
    if (!rows.length) {
      this.error = 'Aucun message MX émis trouvé pour ce virement.';
      return;
    }
    const selected = rows[rows.length - 1];
    this.fileName = (selected.nom || '').trim() || '—';
    this.filePath = (selected.path || '').trim() || '—';
    this.virementsService.getMessageEmisXmlByRow(selected).subscribe({
      next: (xml) => {
        this.xmlContent = xml || '';
        if (!this.xmlContent) this.error = 'Le message est vide.';
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Impossible de lire le fichier MX.';
        this.cdr.detectChanges();
      }
    });
  }

  private pickAndLoadRecu(rows: MessageRecuListApi[]): void {
    if (!rows.length) {
      this.error = 'Aucun message MX reçu trouvé pour ce virement.';
      return;
    }
    const selected = rows[rows.length - 1];
    this.fileName = (selected.nom || '').trim() || '—';
    this.filePath = (selected.path || '').trim() || '—';
    this.virementsService.getMessageRecuXmlByRow(selected).subscribe({
      next: (xml) => {
        this.xmlContent = xml || '';
        if (!this.xmlContent) this.error = 'Le message est vide.';
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Impossible de lire le fichier MX.';
        this.cdr.detectChanges();
      }
    });
  }
}

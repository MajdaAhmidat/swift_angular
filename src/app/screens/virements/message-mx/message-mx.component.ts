import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';
import { VirementsService } from '../../../shared/services/virements.service';
import { finalize } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

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
  sourceLabel = '';

  constructor(
    private route: ActivatedRoute,
    private virementsService: VirementsService
  ) {}

  ngOnInit() {
    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(([params, query]) => {
      this.virementId = params.get('id') || '';
      const qpDirection = (query.get('direction') || '').toLowerCase();
      this.direction = qpDirection === 'recus' ? 'recus' : 'emis';
      this.loadXml();
    });
  }

  copyXml(): void {
    if (!this.xmlContent || !navigator?.clipboard) {
      return;
    }
    navigator.clipboard.writeText(this.xmlContent).catch(() => {});
  }

  private loadXml(): void {
    this.loading = true;
    this.error = '';
    this.xmlContent = '';
    const id = this.virementId;

    if (this.direction === 'recus') {
      this.virementsService.getMessageXmlByVirementRecu(id)
        .pipe(finalize(() => { this.loading = false; }))
        .subscribe({
          next: (xml) => {
            this.xmlContent = xml || '';
            this.sourceLabel = 'RECU';
          },
          error: () => {
            this.tryFallbackEmis(id);
          }
        });
      return;
    }

    this.virementsService.getMessageXmlByVirementEmis(id)
      .pipe(finalize(() => { this.loading = false; }))
      .subscribe({
        next: (xml) => {
          this.xmlContent = xml || '';
          this.sourceLabel = 'EMIS';
        },
        error: () => {
          this.tryFallbackRecu(id);
        }
      });
  }

  private tryFallbackEmis(id: string): void {
    this.virementsService.getMessageXmlByVirementEmis(id).subscribe({
      next: (xml) => {
        this.xmlContent = xml || '';
        this.sourceLabel = 'EMIS';
      },
      error: () => {
        this.error = 'Aucun message MX archive pour ce virement.';
      }
    });
  }

  private tryFallbackRecu(id: string): void {
    this.virementsService.getMessageXmlByVirementRecu(id).subscribe({
      next: (xml) => {
        this.xmlContent = xml || '';
        this.sourceLabel = 'RECU';
      },
      error: () => {
        this.error = 'Aucun message MX archive pour ce virement.';
      }
    });
  }
}

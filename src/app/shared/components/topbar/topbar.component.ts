import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent {
  @Input() pageTitle  = '';
  @Input() breadcrumb = '';
  @Input() primaryLabel    = '';
  @Input() secondaryLabel  = '';
  @Output() primaryClick = new EventEmitter<void>();
  @Output() secondaryClick = new EventEmitter<void>();

  getIcon(label: string, fallback: 'plus' | 'download' = 'plus'): string {
    const normalized = (label || '').toLowerCase();
    if (normalized.includes('réinitialiser') || normalized.includes('reinitialiser')) return 'reset';
    if (normalized.includes('export')) return 'download';
    if (normalized.includes('enregistrer')) return 'save';
    if (normalized.includes('créer') || normalized.includes('creer') || normalized.includes('nouveau')) return 'plus';
    if (normalized.includes('rechercher') || normalized.includes('recherche')) return 'search';
    return fallback;
  }
}

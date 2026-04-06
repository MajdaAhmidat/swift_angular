import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { NavigationEnd } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <ng-container *ngIf="showLayout(); else noMenu">
      <div class="app-layout">
        <app-sidebar></app-sidebar>
        <div class="app-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </ng-container>

    <ng-template #noMenu>
      <router-outlet></router-outlet>
    </ng-template>
  `
})
export class App {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  readonly showLayout = computed(() => {
    if (!this.auth.currentUser()) return false;
    const url = (this.currentUrl().split('?')[0] || '').replace(/\/$/, '') || '/';
    return url !== '/login' && url !== '/';
  });
}

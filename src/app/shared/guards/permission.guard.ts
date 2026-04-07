import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

type PermissionAction = 'lire' | 'creer' | 'modifier' | 'supprimer' | 'valider';

export const permissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const required = route.data?.['permission'] as { module: string; action?: PermissionAction } | undefined;

  if (!required) {
    return true;
  }
  if (!auth.getToken() || !auth.currentUser()) {
    return router.createUrlTree(['/login']);
  }

  return auth.ensurePermissionsLoaded(true).pipe(
    map(() => {
      const action = required.action || 'lire';
      if (auth.hasPermission(required.module, action)) {
        return true;
      }
      return router.createUrlTree(['/profil']);
    })
  );
};

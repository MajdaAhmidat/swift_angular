import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Garde qui exige une authentification.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser();
  if (user && auth.getToken()) {
    const allowedRoles = route.data?.['roles'] as Array<'ADMIN' | 'SUPERVISEUR'> | undefined;
    if (!allowedRoles || allowedRoles.includes(user.role)) {
      return true;
    }
    return router.createUrlTree(['/dashboard/grafana']);
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};

import { inject } from '@angular/core';
import { type CanActivateChildFn, Router } from '@angular/router';

import { AuthStore } from '@features/auth/ui/state/auth.store';

const PLAYER_PROFILE_PATH = '/backoffice/perfil';

export const backofficeSectionGuard: CanActivateChildFn = (_route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.currentRole() !== 'PLAYER' || state.url === PLAYER_PROFILE_PATH) {
    return true;
  }

  return router.createUrlTree([PLAYER_PROFILE_PATH]);
};

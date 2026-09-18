import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, type UrlTree, provideRouter } from '@angular/router';

import type { AuthRole } from '@features/auth/domain/entities/auth-user';
import { AuthStore } from '@features/auth/ui/state/auth.store';
import { backofficeSectionGuard } from './backoffice-section.guard';

async function runGuard(role: AuthRole, url: string) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      {
        provide: AuthStore,
        useValue: {
          currentRole: signal(role),
          ensureInitialized: jest.fn().mockResolvedValue(undefined),
        } satisfies Pick<AuthStore, 'currentRole' | 'ensureInitialized'>,
      },
    ],
  });

  const router = TestBed.inject(Router);
  const result = await TestBed.runInInjectionContext(() =>
    backofficeSectionGuard({} as never, { url } as never),
  );

  return { result, router };
}

describe('backofficeSectionGuard', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('redirects players from the backoffice home to their profile', async () => {
    const { result, router } = await runGuard('PLAYER', '/backoffice');

    expect(router.serializeUrl(result as UrlTree)).toBe('/backoffice/perfil');
  });

  it('blocks players from the operational backoffice sections', async () => {
    const { result, router } = await runGuard('PLAYER', '/backoffice/equipos');

    expect(router.serializeUrl(result as UrlTree)).toBe('/backoffice/perfil');
  });

  it('allows players to open their profile', async () => {
    const { result } = await runGuard('PLAYER', '/backoffice/perfil');

    expect(result).toBe(true);
  });

  it.each(['PRESIDENT', 'ADMIN'] as const)(
    'allows %s accounts into operational sections',
    async (role) => {
      const { result } = await runGuard(role, '/backoffice/equipos');

      expect(result).toBe(true);
    },
  );
});

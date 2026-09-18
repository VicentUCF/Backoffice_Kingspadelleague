import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import type { AuthUser } from '@features/auth/domain/entities/auth-user';
import { AuthStore } from '@features/auth/ui/state/auth.store';
import { BackofficeSessionStore } from './backoffice-session.store';

function createAuthStoreMock(user: AuthUser | null) {
  return {
    currentRole: signal(user?.role ?? null),
    logout: jest.fn().mockResolvedValue(undefined),
    user: signal(user),
  } satisfies Pick<AuthStore, 'currentRole' | 'logout' | 'user'>;
}

describe('BackofficeSessionStore', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('uses the teamId from auth metadata when it exists', () => {
    TestBed.configureTestingModule({
      providers: [
        BackofficeSessionStore,
        {
          provide: AuthStore,
          useValue: createAuthStoreMock({
            id: 'user-1',
            email: 'president@example.com',
            displayName: 'President',
            role: 'PRESIDENT',
            teamId: 'team-from-auth',
          }),
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
    });

    const store = TestBed.inject(BackofficeSessionStore);

    expect(store.currentPresidentTeamId()).toBe('team-from-auth');
  });

  it('returns null when auth metadata does not include a teamId', () => {
    TestBed.configureTestingModule({
      providers: [
        BackofficeSessionStore,
        {
          provide: AuthStore,
          useValue: createAuthStoreMock({
            id: 'user-1',
            email: 'president@example.com',
            displayName: 'President',
            role: 'PRESIDENT',
            teamId: null,
          }),
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
    });

    const store = TestBed.inject(BackofficeSessionStore);

    expect(store.currentPresidentTeamId()).toBeNull();
  });

  it('keeps PRESIDENT accounts in the president backoffice role', () => {
    TestBed.configureTestingModule({
      providers: [
        BackofficeSessionStore,
        {
          provide: AuthStore,
          useValue: createAuthStoreMock({
            id: 'user-1',
            email: 'president@example.com',
            displayName: 'President',
            role: 'PRESIDENT',
            teamId: 'team-1',
          }),
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
    });

    const store = TestBed.inject(BackofficeSessionStore);

    expect(store.currentRole()).toBe('PRESIDENT');
  });

  it.each(['PLAYER', 'PRESIDENT'] as const)(
    'includes the private profile in the %s navigation',
    (role) => {
      TestBed.configureTestingModule({
        providers: [
          BackofficeSessionStore,
          {
            provide: AuthStore,
            useValue: createAuthStoreMock({
              id: 'user-1',
              email: 'member@example.com',
              displayName: 'League member',
              role,
              teamId: 'team-1',
            }),
          },
          { provide: Router, useValue: { navigate: jest.fn() } },
        ],
      });

      const store = TestBed.inject(BackofficeSessionStore);

      expect(store.navigation()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: '/backoffice/perfil',
            label: 'Mi perfil',
            isAccessible: true,
          }),
        ]),
      );
    },
  );

  it('does not include the private player profile in the admin navigation', () => {
    TestBed.configureTestingModule({
      providers: [
        BackofficeSessionStore,
        {
          provide: AuthStore,
          useValue: createAuthStoreMock({
            id: 'admin-1',
            email: 'admin@example.com',
            displayName: 'Admin',
            role: 'ADMIN',
            teamId: null,
          }),
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
    });

    const store = TestBed.inject(BackofficeSessionStore);

    expect(
      store.navigation().find((item) => item.path === '/backoffice/perfil')?.isAccessible,
    ).toBe(false);
  });

  it('limits player navigation to the private profile', () => {
    TestBed.configureTestingModule({
      providers: [
        BackofficeSessionStore,
        {
          provide: AuthStore,
          useValue: createAuthStoreMock({
            id: 'player-1',
            email: 'player@example.com',
            displayName: 'Player',
            role: 'PLAYER',
            teamId: 'team-1',
          }),
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
    });

    const store = TestBed.inject(BackofficeSessionStore);

    expect(
      store
        .navigation()
        .filter((item) => item.isAccessible)
        .map((item) => item.label),
    ).toEqual(['Mi perfil']);
  });
});

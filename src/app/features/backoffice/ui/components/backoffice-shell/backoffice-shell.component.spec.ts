import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router, RouterOutlet, provideRouter } from '@angular/router';
import { render, screen, within } from '@testing-library/angular';
import { axe } from 'jest-axe';

import type { AuthRole } from '@features/auth/domain/entities/auth-user';
import { ProcessPlayerProfileImageUseCase } from '@features/auth/application/use-cases/process-player-profile-image.use-case';
import { AuthStore } from '@features/auth/ui/state/auth.store';
import { BACKOFFICE_ROUTES } from '../../backoffice.routes';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
class RouterHostComponent {}

function makeAuthStoreMock(role: AuthRole = 'ADMIN') {
  return {
    user: signal({
      id: '1',
      email: 'admin@test.com',
      displayName: 'Admin',
      role,
      teamId: role === 'ADMIN' || role === 'USER' ? null : 'team-1',
    }),
    currentRole: signal(role),
    isAuthenticated: signal(true),
    isLoading: signal(false),
    error: signal(null),
    accessToken: signal('mock-token'),
    status: signal('authenticated'),
    logout: async () => {},
    login: async () => {},
    register: async () => {},
    requestPasswordReset: async () => {},
    resetPassword: async () => {},
    clearError: () => {},
    loadCurrentPlayerProfile: jest.fn().mockResolvedValue(null),
    updateCurrentPlayerProfile: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  };
}

const processPlayerProfileImageUseCaseMock = {
  execute: jest.fn(async (file: File) => file),
};

describe('BackofficeShellComponent', () => {
  it('renders navigation items for an ADMIN user', async () => {
    const { fixture } = await render(RouterHostComponent, {
      providers: [
        provideRouter([{ path: 'backoffice', children: BACKOFFICE_ROUTES }]),
        { provide: AuthStore, useValue: makeAuthStoreMock('ADMIN') },
      ],
    });

    const router = fixture.componentRef.injector.get(Router);

    await router.navigateByUrl('/backoffice');
    fixture.detectChanges();

    const navigation = screen.getByRole('navigation', { name: /Backoffice/i });

    expect(within(navigation).getByRole('link', { name: /Dashboard/i })).toHaveAttribute(
      'href',
      '/backoffice',
    );
    expect(within(navigation).getByText('Equipos')).toBeVisible();
    expect(within(navigation).getByText('Jugadores')).toBeVisible();
    expect(within(navigation).getByText('Jornadas')).toBeVisible();
    expect(within(navigation).getByText('Clasificación')).toBeVisible();
    expect(within(navigation).queryByText('Usuarios')).toBeNull();
  });

  it('shows logout button in the sidebar', async () => {
    const { fixture } = await render(RouterHostComponent, {
      providers: [
        provideRouter([{ path: 'backoffice', children: BACKOFFICE_ROUTES }]),
        { provide: AuthStore, useValue: makeAuthStoreMock('ADMIN') },
      ],
    });

    const router = fixture.componentRef.injector.get(Router);

    await router.navigateByUrl('/backoffice');
    fixture.detectChanges();

    await screen.findByRole('button', { name: /Cerrar sesión/i });
  });

  it('renders player access without the admin-only users module', async () => {
    const { fixture } = await render(RouterHostComponent, {
      providers: [
        provideRouter([{ path: 'backoffice', children: BACKOFFICE_ROUTES }]),
        { provide: AuthStore, useValue: makeAuthStoreMock('PLAYER') },
        {
          provide: ProcessPlayerProfileImageUseCase,
          useValue: processPlayerProfileImageUseCaseMock,
        },
      ],
    });

    const router = fixture.componentRef.injector.get(Router);

    await router.navigateByUrl('/backoffice');
    fixture.detectChanges();

    const navigation = screen.getByRole('navigation', { name: /Backoffice/i });

    expect(within(navigation).queryByRole('link', { name: /Mi equipo/i })).toBeNull();
    expect(within(navigation).getByRole('link', { name: /Mi perfil/i })).toHaveAttribute(
      'href',
      '/backoffice/perfil',
    );
    expect(within(navigation).queryByText('Equipos')).toBeNull();
    expect(within(navigation).queryByText('Jugadores')).toBeNull();
    expect(within(navigation).queryByText('Jornadas')).toBeNull();
    expect(within(navigation).queryByText('Clasificación')).toBeNull();
    expect(within(navigation).queryByText('Usuarios')).toBeNull();
    expect(screen.queryByText('Rol activo')).toBeNull();
  });

  it('has no accessibility violations in the backoffice shell', async () => {
    const { container, fixture } = await render(RouterHostComponent, {
      providers: [
        provideRouter([{ path: 'backoffice', children: BACKOFFICE_ROUTES }]),
        { provide: AuthStore, useValue: makeAuthStoreMock('ADMIN') },
      ],
    });

    const router = fixture.componentRef.injector.get(Router);

    await router.navigateByUrl('/backoffice');
    fixture.detectChanges();

    await screen.findByRole('heading', { name: /^Dashboard$/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});

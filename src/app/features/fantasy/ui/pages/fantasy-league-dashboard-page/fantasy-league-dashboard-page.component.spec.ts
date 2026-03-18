import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { render, screen, within } from '@testing-library/angular';
import { axe } from 'jest-axe';
import { of } from 'rxjs';

import {
  LOAD_FANTASY_LEAGUE_DASHBOARD_USE_CASE,
  provideFantasyFeature,
} from '../../providers/fantasy.providers';
import {
  createFantasyLeagueDashboard,
  createFantasyPlayer,
  createFantasyRankingEntry,
} from '../../../testing/fantasy-test.fixtures';
import { FantasyLeagueDashboardPageComponent } from './fantasy-league-dashboard-page.component';

describe('FantasyLeagueDashboardPageComponent', () => {
  it('renders the league dashboard as a manager cockpit when the user already has a team', async () => {
    const { container } = await render(FantasyLeagueDashboardPageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        createActivatedRouteProvider('league-1'),
      ],
    });

    expect(await screen.findByRole('heading', { name: /Amigos del curro/i })).toBeVisible();
    expect(screen.getByText(/Equipo activo/i)).toBeVisible();
    expect(screen.getAllByText(/Previa Imperial/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Cabina del manager/i)).toBeVisible();
    expect(screen.getByText(/Mercado abierto y equipo editable/i)).toBeVisible();
    expect(screen.getByText(/Pulso de la liga/i)).toBeVisible();
    expect(screen.getByText(/MVP de la jornada/i)).toBeVisible();
    expect(
      screen
        .getAllByRole('link', { name: /Gestionar equipo/i })
        .some((link) => link.getAttribute('href') === '/fantasy/leagues/league-1/team'),
    ).toBe(true);
    expect(
      screen.getByRole('heading', { name: /Amigos del curro/i }).closest('[data-motion="hero"]'),
    ).not.toBeNull();
    expect(container.querySelector('[data-motion="section-nav"]')).not.toBeNull();
    expect(
      screen.getByText(/Equipo activo/i).closest('[data-motion="stagger-item"]'),
    ).toHaveAttribute('style', expect.stringContaining('--fantasy-motion-index: 0'));
  });

  it('renders the onboarding variant and derived market snapshot when the user has no team yet', async () => {
    const dashboardWithoutTeam = createFantasyLeagueDashboard({
      myTeam: null,
      players: [
        createFantasyPlayer({
          id: 'player-1',
          name: 'Jugador Uno',
          photoPath: null,
          price: 20_000_000,
        }),
        createFantasyPlayer({
          id: 'player-2',
          name: 'Jugador Dos',
          photoPath: null,
          price: 70_000_000,
        }),
        createFantasyPlayer({
          id: 'player-3',
          name: 'Jugador Tres',
          photoPath: null,
          price: 130_000_000,
        }),
      ],
      ranking: [
        createFantasyRankingEntry({
          isMe: false,
          managerName: 'Ana',
          rank: 1,
          teamName: 'Liderato Temporal',
          teamValue: 92_000_000,
        }),
        createFantasyRankingEntry({
          isMe: true,
          managerName: 'Vicent',
          rank: 2,
          teamName: 'Equipo pendiente',
          teamValue: 0,
        }),
      ],
    });

    await render(FantasyLeagueDashboardPageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        createActivatedRouteProvider('league-1'),
        {
          provide: LOAD_FANTASY_LEAGUE_DASHBOARD_USE_CASE,
          useValue: {
            execute: async () => dashboardWithoutTeam,
          },
        },
      ],
    });

    expect(await screen.findByRole('heading', { name: /Amigos del curro/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Punto de arranque de la liga/i })).toBeVisible();
    expect(screen.getByText(/Fichar 6 jugadores/i)).toBeVisible();
    expect(screen.queryByText(/Equipo activo/i)).toBeNull();
    expect(
      screen
        .getAllByRole('link', { name: /Crear plantilla/i })
        .some((link) => link.getAttribute('href') === '/fantasy/leagues/league-1/create-team'),
    ).toBe(true);

    const marketCard = screen
      .getByRole('heading', { name: /Mercado de pretemporada abierto/i })
      .closest('article');

    expect(marketCard).not.toBeNull();
    expect(within(marketCard!).getByText('Asequibles')).toBeVisible();
    expect(within(marketCard!).getByText('2')).toBeVisible();
    expect(within(marketCard!).getByText('En plantilla')).toBeVisible();
    expect(within(marketCard!).getByText('0')).toBeVisible();
  });

  it('has no accessibility violations in the fantasy dashboard', async () => {
    const { container } = await render(FantasyLeagueDashboardPageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        createActivatedRouteProvider('league-1'),
      ],
    });

    await screen.findByRole('heading', { name: /Amigos del curro/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});

function createActivatedRouteProvider(leagueId: string) {
  const paramMap = convertToParamMap({ leagueId });

  return {
    provide: ActivatedRoute,
    useValue: {
      snapshot: { paramMap },
      paramMap: of(paramMap),
    },
  };
}

import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';
import { of } from 'rxjs';

import { provideFantasyFeature } from '../../providers/fantasy.providers';
import { FantasyLeagueDashboardPageComponent } from './fantasy-league-dashboard-page.component';

describe('FantasyLeagueDashboardPageComponent', () => {
  it('renders the league dashboard with summary links, MVP and ranking preview', async () => {
    await render(FantasyLeagueDashboardPageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        createActivatedRouteProvider('league-1'),
      ],
    });

    expect(await screen.findByRole('heading', { name: /Amigos del curro/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /Ir al mercado/i })).toHaveAttribute(
      'href',
      '/fantasy/leagues/league-1/market',
    );
    expect(screen.getByText(/Ranking provisional por valor de plantilla/i)).toBeVisible();
    expect(screen.getByText(/Jugador a seguir/i)).toBeVisible();
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

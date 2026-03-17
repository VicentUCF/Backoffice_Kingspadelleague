import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';
import { of } from 'rxjs';

import { provideFantasyFeature } from '../../providers/fantasy.providers';
import { FantasyLeagueResultsPageComponent } from './fantasy-league-results-page.component';

describe('FantasyLeagueResultsPageComponent', () => {
  it('renders the weekly results with ranking, awards and market analysis', async () => {
    await render(FantasyLeagueResultsPageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        createActivatedRouteProvider('league-1'),
      ],
    });

    expect(
      await screen.findByRole('heading', { name: /Resultados jornada disponibles/i }),
    ).toBeVisible();
    expect(screen.getByText(/Cómo terminó el domingo/i)).toBeVisible();
    expect(screen.getByText(/Premios/i)).toBeVisible();
    expect(screen.getAllByRole('link', { name: /Mi equipo/i }).length).toBeGreaterThan(0);
    expect(screen.getByText(/Rivales directos/i)).toBeVisible();
    expect(screen.getByText(/Mercado post-jornada/i)).toBeVisible();
    expect(screen.getAllByRole('link', { name: /Resultados/i }).length).toBeGreaterThan(0);
  });

  it('renders a not available state when the league has no weekly results', async () => {
    await render(FantasyLeagueResultsPageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        createActivatedRouteProvider('league-3'),
      ],
    });

    expect(
      await screen.findByRole('heading', { name: /Resultados fantasy no disponibles/i }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: /Volver a fantasy/i })).toHaveAttribute(
      'href',
      '/fantasy',
    );
  });

  it('has no accessibility violations in the fantasy results page', async () => {
    const { container } = await render(FantasyLeagueResultsPageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        createActivatedRouteProvider('league-1'),
      ],
    });

    await screen.findByRole('heading', { name: /Resultados jornada disponibles/i });

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

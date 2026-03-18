import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';
import { of } from 'rxjs';

import { provideFantasyFeature } from '../../providers/fantasy.providers';
import { FantasyRankingPageComponent } from './fantasy-ranking-page.component';

describe('FantasyRankingPageComponent', () => {
  it('renders the ranking with league navigation and podium summary', async () => {
    const { container } = await render(FantasyRankingPageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        createActivatedRouteProvider('league-1'),
      ],
    });

    expect(await screen.findByRole('heading', { name: /Amigos del curro/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /Resumen/i })).toHaveAttribute('href', '/fantasy');
    expect(screen.getByText(/Pulso de la liga/i)).toBeVisible();
    expect(screen.getByText(/Tu posición/i)).toBeVisible();
    expect(screen.getByText(/Clasificación con detalle/i)).toBeVisible();
    expect(
      screen.getByRole('heading', { name: /Amigos del curro/i }).closest('[data-motion="hero"]'),
    ).not.toBeNull();
    expect(container.querySelector('[data-motion="section-nav"]')).not.toBeNull();
    expect(
      container.querySelector('.fantasy-ranking-page__summary-card[data-motion="stagger-item"]'),
    ).toHaveAttribute('style', expect.stringContaining('--fantasy-motion-index: 0'));
  });

  it('has no accessibility violations in the ranking page', async () => {
    const { container } = await render(FantasyRankingPageComponent, {
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

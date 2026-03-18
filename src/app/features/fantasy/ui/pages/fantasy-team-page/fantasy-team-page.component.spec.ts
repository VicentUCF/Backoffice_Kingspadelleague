import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';
import { of } from 'rxjs';

import { provideFantasyFeature } from '../../providers/fantasy.providers';
import { FantasyTeamPageComponent } from './fantasy-team-page.component';

describe('FantasyTeamPageComponent', () => {
  it('renders the fantasy roster with player names instead of raw ids', async () => {
    const { container } = await render(FantasyTeamPageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        createActivatedRouteProvider('league-1'),
      ],
    });

    expect(
      await screen.findByRole('heading', { name: /Mi equipo · Amigos del curro/i }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: /Abrir ficha de Borja Vercher/i })).toBeVisible();
    expect(screen.getByText(/Capitán x2/i)).toBeVisible();
    expect(screen.queryByText(/^thormentadores-player-1$/i)).toBeNull();
    expect(
      screen.getByText(/La jornada todavía no ha cerrado y puedes seguir ajustando la plantilla/i),
    ).toBeVisible();
    expect(
      screen
        .getByRole('heading', { name: /Mi equipo · Amigos del curro/i })
        .closest('[data-motion="hero"]'),
    ).not.toBeNull();
    expect(container.querySelector('[data-motion="section-nav"]')).not.toBeNull();
    expect(
      container.querySelector('.fantasy-team-page__summary-card[data-motion="stagger-item"]'),
    ).toHaveAttribute('style', expect.stringContaining('--fantasy-motion-index: 0'));
  });

  it('has no accessibility violations in the roster page', async () => {
    const { container } = await render(FantasyTeamPageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        createActivatedRouteProvider('league-1'),
      ],
    });

    await screen.findByRole('heading', { name: /Mi equipo · Amigos del curro/i });

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

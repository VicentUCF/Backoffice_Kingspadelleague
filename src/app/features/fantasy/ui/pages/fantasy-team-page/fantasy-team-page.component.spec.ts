import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';
import { of } from 'rxjs';

import { provideFantasyFeature } from '../../providers/fantasy.providers';
import { FantasyTeamPageComponent } from './fantasy-team-page.component';

describe('FantasyTeamPageComponent', () => {
  it('renders the fantasy roster with player names instead of raw ids', async () => {
    await render(FantasyTeamPageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        createActivatedRouteProvider('league-1'),
      ],
    });

    expect(
      await screen.findByRole('heading', { name: /Mi equipo · Amigos del curro/i }),
    ).toBeVisible();
    expect(screen.getByText('Borja Vercher')).toBeVisible();
    expect(screen.getByText(/Capitán x2/i)).toBeVisible();
    expect(screen.queryByText(/^thormentadores-player-1$/i)).toBeNull();
    expect(screen.getByText(/Puedes hacer cambios libres/i)).toBeVisible();
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

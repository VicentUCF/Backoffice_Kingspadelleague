import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';
import { of } from 'rxjs';

import { provideFantasyFeature } from '../../providers/fantasy.providers';
import { FantasyCreateTeamPageComponent } from './fantasy-create-team-page.component';

describe('FantasyCreateTeamPageComponent', () => {
  it('renders lineup mode from the purchased roster when the team already exists', async () => {
    await render(FantasyCreateTeamPageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        createActivatedRouteProvider('league-1'),
      ],
    });

    expect(
      await screen.findByRole('heading', { name: /Edita tu equipo tras el viernes/i }),
    ).toBeVisible();
    expect(screen.getByRole('heading', { name: /Roster comprado/i })).toBeVisible();
    expect(
      screen.getByText(/La porra ya quedó cerrada. Ahora eliges el equipo definitivo/i),
    ).toBeVisible();
    expect(screen.queryByLabelText(/Buscar jugador/i)).toBeNull();
    expect(
      screen.getAllByRole('button', { name: /Mandar a rotación|Poner titular/i }).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/Roster completo de la liga/i)).toBeNull();
  });

  it('has no accessibility violations in lineup mode', async () => {
    const { container } = await render(FantasyCreateTeamPageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        createActivatedRouteProvider('league-1'),
      ],
    });

    await screen.findByRole('heading', { name: /Edita tu equipo tras el viernes/i });

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

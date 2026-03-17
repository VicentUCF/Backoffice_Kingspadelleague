import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { fireEvent, render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';
import { of } from 'rxjs';

import { provideFantasyFeature } from '../../providers/fantasy.providers';
import { FantasyMarketPageComponent } from './fantasy-market-page.component';

describe('FantasyMarketPageComponent', () => {
  it('renders the market page and filters by player name', async () => {
    await render(FantasyMarketPageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        createActivatedRouteProvider('league-1'),
      ],
    });

    expect(
      await screen.findByRole('heading', { name: /Mercado · Amigos del curro/i }),
    ).toBeVisible();

    fireEvent.input(screen.getByRole('searchbox', { name: /Buscar jugador/i }), {
      target: { value: 'vicent' },
    });

    expect(screen.getByRole('link', { name: /Vicent Ciscar/i })).toBeVisible();
    expect(screen.queryByRole('link', { name: /Adri Alvarez/i })).toBeNull();
  });

  it('has no accessibility violations in the market page', async () => {
    const { container } = await render(FantasyMarketPageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        createActivatedRouteProvider('league-1'),
      ],
    });

    await screen.findByRole('heading', { name: /Mercado · Amigos del curro/i });

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

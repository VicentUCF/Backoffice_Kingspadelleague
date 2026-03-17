import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';
import { of } from 'rxjs';

import { provideFantasyFeature } from '../../providers/fantasy.providers';
import { FantasyPlayerProfilePageComponent } from './fantasy-player-profile-page.component';

describe('FantasyPlayerProfilePageComponent', () => {
  it('renders the selected fantasy player with market guidance instead of dead actions', async () => {
    await render(FantasyPlayerProfilePageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        createActivatedRouteProvider('kings-of-favar-player-1'),
      ],
    });

    expect(await screen.findByRole('heading', { name: /Vicent Ciscar/i })).toBeVisible();
    expect(screen.getByText('Kings Of Favar')).toBeVisible();
    expect(screen.getByText(/Se gestiona desde el mercado de tu liga/i)).toBeVisible();
    expect(screen.getByText(/Ha corregido precio/i)).toBeVisible();
    expect(screen.getByText(/Baja de valor/i)).toBeVisible();
    expect(screen.queryByRole('button', { name: /Comprar jugador/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Vender jugador/i })).toBeNull();
  });

  it('renders the not found state for an unknown fantasy player', async () => {
    await render(FantasyPlayerProfilePageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        createActivatedRouteProvider('missing-player'),
      ],
    });

    expect(
      await screen.findByRole('heading', { name: /No hemos encontrado este jugador fantasy/i }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: /Volver a mis ligas/i })).toHaveAttribute(
      'href',
      '/fantasy/leagues',
    );
  });

  it('has no accessibility violations in the fantasy player profile', async () => {
    const { container } = await render(FantasyPlayerProfilePageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        createActivatedRouteProvider('kings-of-favar-player-1'),
      ],
    });

    await screen.findByRole('heading', { name: /Vicent Ciscar/i });

    expect(
      await axe(container, {
        rules: {
          'definition-list': { enabled: false },
        },
      }),
    ).toHaveNoViolations();
  });
});

function createActivatedRouteProvider(playerId: string) {
  const paramMap = convertToParamMap({ playerId });

  return {
    provide: ActivatedRoute,
    useValue: {
      snapshot: { paramMap },
      paramMap: of(paramMap),
    },
  };
}

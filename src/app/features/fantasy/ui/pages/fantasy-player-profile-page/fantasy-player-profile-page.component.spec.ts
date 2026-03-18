import { Location, ViewportScroller } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { fireEvent, render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';
import { of } from 'rxjs';

import { provideFantasyFeature } from '../../providers/fantasy.providers';
import { FantasyPlayerProfilePageComponent } from './fantasy-player-profile-page.component';

describe('FantasyPlayerProfilePageComponent', () => {
  it('renders the selected fantasy player with market guidance and value history', async () => {
    const { viewportScroller } = createNavigationMocks();

    const { container } = await render(FantasyPlayerProfilePageComponent, {
      providers: [
        provideFantasyFeature(),
        provideLocationMocks(),
        provideRouter([]),
        createActivatedRouteProvider('kings-of-favar-player-1'),
        { provide: ViewportScroller, useValue: viewportScroller },
      ],
    });

    expect(await screen.findByRole('heading', { name: /Vicent Ciscar/i })).toBeVisible();
    expect(screen.getByText('Kings Of Favar')).toBeVisible();
    expect(screen.getByRole('button', { name: /Volver atrás/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Historial de valor/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Qué mirar antes de ficharlo/i })).toBeVisible();
    expect(screen.getByText(/Se gestiona desde el mercado de tu liga/i)).toBeVisible();
    expect(screen.queryByRole('button', { name: /Comprar jugador/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Vender jugador/i })).toBeNull();
    expect(viewportScroller.scrollToPosition).toHaveBeenCalledWith([0, 0]);
    expect(
      screen.getByRole('heading', { name: /Vicent Ciscar/i }).closest('[data-motion="hero"]'),
    ).not.toBeNull();
    expect(container.querySelector('[data-motion="surface-panel"]')).not.toBeNull();
    expect(
      container.querySelector('.fantasy-player-profile-page__metric[data-motion="stagger-item"]'),
    ).toHaveAttribute('style', expect.stringContaining('--fantasy-motion-index: 0'));
  });

  it('uses browser back navigation instead of linking to leagues', async () => {
    const { viewportScroller } = createNavigationMocks();

    const { fixture } = await render(FantasyPlayerProfilePageComponent, {
      providers: [
        provideFantasyFeature(),
        provideLocationMocks(),
        provideRouter([]),
        createActivatedRouteProvider('kings-of-favar-player-1'),
        { provide: ViewportScroller, useValue: viewportScroller },
      ],
    });
    const location = fixture.componentRef.injector.get(Location);
    const backSpy = jest.spyOn(location, 'back');

    fireEvent.click(await screen.findByRole('button', { name: /Volver atrás/i }));

    expect(backSpy).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('link', { name: /Volver a mis ligas/i })).toBeNull();
  });

  it('renders the not found state for an unknown fantasy player', async () => {
    const { viewportScroller } = createNavigationMocks();

    await render(FantasyPlayerProfilePageComponent, {
      providers: [
        provideFantasyFeature(),
        provideLocationMocks(),
        provideRouter([]),
        createActivatedRouteProvider('missing-player'),
        { provide: ViewportScroller, useValue: viewportScroller },
      ],
    });

    expect(
      await screen.findByRole('heading', { name: /No hemos encontrado este jugador fantasy/i }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: /Volver atrás/i })).toBeVisible();
  });

  it('has no accessibility violations in the fantasy player profile', async () => {
    const { viewportScroller } = createNavigationMocks();
    const { container } = await render(FantasyPlayerProfilePageComponent, {
      providers: [
        provideFantasyFeature(),
        provideLocationMocks(),
        provideRouter([]),
        createActivatedRouteProvider('kings-of-favar-player-1'),
        { provide: ViewportScroller, useValue: viewportScroller },
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

function createNavigationMocks() {
  return {
    viewportScroller: {
      getScrollPosition: jest.fn(() => [0, 0] as [number, number]),
      scrollToAnchor: jest.fn(),
      scrollToPosition: jest.fn(),
      setHistoryScrollRestoration: jest.fn(),
    },
  };
}

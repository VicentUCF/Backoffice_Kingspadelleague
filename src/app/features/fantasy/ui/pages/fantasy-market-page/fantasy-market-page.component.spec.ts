import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { axe } from 'jest-axe';
import { of } from 'rxjs';

import { ActionToastStore } from '@core/state/action-toast.store';
import { provideFantasyFeature } from '../../providers/fantasy.providers';
import { FantasyMarketPageComponent } from './fantasy-market-page.component';

describe('FantasyMarketPageComponent', () => {
  it('renders the market page and filters by player name', async () => {
    const { container } = await render(FantasyMarketPageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        createActivatedRouteProvider('league-1'),
      ],
    });

    expect(
      await screen.findByRole('heading', { name: /Mercado · Amigos del curro/i }),
    ).toBeVisible();
    expect(
      screen
        .getByRole('heading', { name: /Mercado · Amigos del curro/i })
        .closest('[data-motion="hero"]'),
    ).not.toBeNull();
    expect(container.querySelector('[data-motion="section-nav"]')).not.toBeNull();
    expect(container.querySelector('[data-motion="market-results"]')).toHaveAttribute(
      'data-motion-key',
      '0',
    );

    fireEvent.input(screen.getByRole('searchbox', { name: /Buscar jugador/i }), {
      target: { value: 'vicent' },
    });

    expect(screen.getByRole('link', { name: /Abrir ficha de Vicent Ciscar/i })).toBeVisible();
    expect(screen.queryByRole('link', { name: /Abrir ficha de Adri Alvarez/i })).toBeNull();
    await waitFor(() => {
      expect(container.querySelector('[data-motion="market-results"]')).toHaveAttribute(
        'data-motion-key',
        '1',
      );
    });
    expect(
      container.querySelector('[data-motion="market-results"] [data-motion="stagger-item"]'),
    ).toHaveAttribute('style', expect.stringContaining('--fantasy-motion-index: 0'));
  });

  it('shows a toast when a player sale is confirmed', async () => {
    const toastStore = createActionToastStoreMock();

    await render(FantasyMarketPageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        createActivatedRouteProvider('league-1'),
        { provide: ActionToastStore, useValue: toastStore },
      ],
    });

    await screen.findByRole('heading', { name: /Mercado · Amigos del curro/i });

    fireEvent.click(screen.getAllByRole('button', { name: /^Vender a /i })[0]!);

    expect(await screen.findByRole('heading', { name: /Vender a/i })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: /Confirmar venta/i }));

    await waitFor(() => {
      expect(toastStore.success).toHaveBeenCalledWith(
        expect.stringMatching(/^Has vendido a .+\.$/),
        'Venta completada',
      );
    });
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

function createActionToastStoreMock() {
  return {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    dismiss: jest.fn(),
    toasts: { asReadonly: () => [] },
  };
}

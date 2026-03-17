import { toFantasyPlayerProfileViewModel } from './fantasy-player-profile.viewmodel';

import { createFantasyPlayer } from '@features/fantasy/testing/fantasy-test.fixtures';

describe('toFantasyPlayerProfileViewModel', () => {
  it('maps a player into a page-ready view model', () => {
    const viewModel = toFantasyPlayerProfileViewModel(
      createPlayer({
        id: 'arturo-coello',
        name: 'Arturo Coello',
        teamName: 'Valladolid Kings',
        price: 28_000_000,
        previousPrice: 27_700_000,
        pointsMatchday: 16,
        pointsTotal: 210,
      }),
    );

    expect(viewModel.pageTitle).toBe('Arturo Coello | Fantasy | KingsPadelLeague');
    expect(viewModel.priceLabel).toContain('€');
    expect(viewModel.previousPriceLabel).toContain('€');
    expect(viewModel.priceChangeLabel).toContain('300');
    expect(viewModel.marketGuidance).toMatch(/Se gestiona desde el mercado de tu liga/i);
    expect(viewModel.marketTrendLabel).toBe('Sube de valor');
    expect(viewModel.priceChangeTone).toBe('positive');
    expect(viewModel.matchdayPointsLabel).toBe('16 pts');
  });

  it('marks negative and neutral price changes explicitly', () => {
    const fallingPlayer = toFantasyPlayerProfileViewModel(
      createPlayer({
        price: 24_000_000,
        previousPrice: 25_000_000,
      }),
    );
    const flatPlayer = toFantasyPlayerProfileViewModel(
      createPlayer({
        price: 24_000_000,
        previousPrice: 24_000_000,
      }),
    );

    expect(fallingPlayer.priceChangeTone).toBe('negative');
    expect(fallingPlayer.marketTrendLabel).toBe('Baja de valor');
    expect(flatPlayer.priceChangeTone).toBe('neutral');
    expect(flatPlayer.priceChangeLabel).toBe('Sin cambios');
  });
});

function createPlayer(
  overrides: Parameters<typeof createFantasyPlayer>[0],
): ReturnType<typeof createFantasyPlayer> {
  return createFantasyPlayer(overrides);
}

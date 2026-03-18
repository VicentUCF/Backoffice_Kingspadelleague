import { toFantasyPlayerProfileViewModel } from './fantasy-player-profile.viewmodel';

import { createFantasyPlayer } from '@features/fantasy/testing/fantasy-test.fixtures';

describe('toFantasyPlayerProfileViewModel', () => {
  it('maps a player into a page-ready view model with decision signals and value history', () => {
    const viewModel = toFantasyPlayerProfileViewModel(
      createPlayer({
        id: 'arturo-coello',
        name: 'Arturo Coello',
        teamName: 'Valladolid Kings',
        price: 28_000_000,
        previousPrice: 27_700_000,
        pointsMatchday: 16,
        pointsTotal: 210,
        priceHistory: [
          { label: 'D-4', value: 26_800_000 },
          { label: 'D-3', value: 27_050_000 },
          { label: 'D-2', value: 27_450_000 },
          { label: 'Ayer', value: 27_700_000 },
          { label: 'Hoy', value: 28_000_000 },
        ],
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
    expect(viewModel.decisionTitle).toBe('Compra selectiva');
    expect(viewModel.keyMetrics).toHaveLength(6);
    expect(viewModel.signals).toHaveLength(3);
    expect(viewModel.valueHistory.points).toHaveLength(5);
    expect(viewModel.valueHistory.points.at(-1)?.priceLabel).toBe(viewModel.priceLabel);
    expect(viewModel.valueHistory.deltaLabel).toContain('+');
    expect(viewModel.valueHistory.linePoints).toContain(',');
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
    expect(fallingPlayer.decisionTone).toBe('warning');
    expect(flatPlayer.priceChangeTone).toBe('neutral');
    expect(flatPlayer.priceChangeLabel).toBe('Sin cambios');
    expect(flatPlayer.valueHistory.points.at(-1)?.priceLabel).toBe(flatPlayer.priceLabel);
  });
});

function createPlayer(
  overrides: Parameters<typeof createFantasyPlayer>[0],
): ReturnType<typeof createFantasyPlayer> {
  return createFantasyPlayer(overrides);
}

import { FANTASY_DASHBOARD_BY_LEAGUE_SEED } from '@features/fantasy/infrastructure/mocks/fantasy.seed';

import {
  ALL_FANTASY_MARKET_SIDES,
  ALL_FANTASY_MARKET_STATUS,
  ALL_FANTASY_MARKET_TEAMS,
  type FantasyMarketFilters,
  filterFantasyMarketPlayers,
} from './fantasy-market.filters';
import { toFantasyLeagueDashboardViewModel } from './fantasy-league-dashboard.viewmodel';

describe('toFantasyLeagueDashboardViewModel', () => {
  it('maps the competitive snapshot into the dashboard view model', () => {
    const viewModel = toFantasyLeagueDashboardViewModel(
      FANTASY_DASHBOARD_BY_LEAGUE_SEED['league-1']!,
    );

    expect(viewModel.leagueName).toBe('Amigos del curro');
    expect(viewModel.phaseLabel).toBe('Mercado abierto');
    expect(viewModel.marketStatusLabel).toBe('Mercado abierto y equipo editable.');
    expect(viewModel.rankingTitle).toBe('Clasificación fantasy');
    expect(viewModel.team?.formationLabel).toBe('4 titulares · 2 rotaciones');
    expect(viewModel.team?.playersCountLabel).toBe('6 jugadores');
    expect(viewModel.team?.starters).toHaveLength(4);
    expect(viewModel.team?.bench).toHaveLength(2);
    expect(viewModel.spotlight?.title).toBe('MVP de la jornada');
    expect(viewModel.spotlight?.badgeLabel).toMatch(/\d+ pts/);
    expect(viewModel.spotlight?.supportingLabel).toBeTruthy();
    expect(viewModel.topRankingEntries[0]).toMatchObject({
      rankLabel: '#1',
      managerName: 'Marta',
    });
    expect(viewModel.topRankingEntries[1]).toMatchObject({
      rankLabel: '#2',
      teamName: 'Rivales del Viernes',
    });
    expect(viewModel.marketPlayers.some((player) => player.name === 'Vicent Ciscar')).toBe(true);
  });
});

describe('filterFantasyMarketPlayers', () => {
  const viewModel = toFantasyLeagueDashboardViewModel(
    FANTASY_DASHBOARD_BY_LEAGUE_SEED['league-1']!,
  );
  const baseFilters = {
    query: 'vicent',
    side: ALL_FANTASY_MARKET_SIDES,
    status: ALL_FANTASY_MARKET_STATUS,
    sortBy: 'price-desc' as const,
    teamId: ALL_FANTASY_MARKET_TEAMS,
  } satisfies FantasyMarketFilters;

  it('finds players by name', () => {
    const results = filterFantasyMarketPlayers(viewModel.marketPlayers, baseFilters);

    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe('Vicent Ciscar');
  });

  it('allows filtering by team id', () => {
    const thormentadores = filterFantasyMarketPlayers(viewModel.marketPlayers, {
      ...baseFilters,
      query: '',
      teamId: 'thormentadores',
    });

    expect(thormentadores).toHaveLength(6);
  });
});

import { createFantasyLeagueResults } from '@features/fantasy/testing/fantasy-test.fixtures';

import { toFantasyLeagueResultsPageViewModel } from './fantasy-league-results.viewmodel';

describe('toFantasyLeagueResultsPageViewModel', () => {
  it('maps the weekly results to ranking, awards and market sections', () => {
    const viewModel = toFantasyLeagueResultsPageViewModel(createFantasyLeagueResults());

    expect(viewModel.hero.weekLabel).toBe('Jornada 5 cerrada');
    expect(viewModel.overviewLink).toBe('/fantasy');
    expect(viewModel.hero.rankLabel).toBe('#2');
    expect(viewModel.hero.captainPointsLabel).toBe('10 pts');
    expect(viewModel.ranking[1]?.isMe).toBe(true);
    expect(viewModel.playerLines[0]?.captainLabel).toBe('Capitán');
    expect(viewModel.awards[0]?.title).toBe('MVP jornada');
    expect(viewModel.marketSections[0]?.title).toBe('Suben de precio');
  });
});

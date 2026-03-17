import {
  createFantasyHomeExperience,
  createFantasyWeeklyCycle,
} from '@features/fantasy/testing/fantasy-test.fixtures';

import { toFantasyHomePageViewModel } from './fantasy-home.viewmodel';

describe('toFantasyHomePageViewModel', () => {
  it('maps the post-friday flow with the porra bonus and edit CTA', () => {
    const viewModel = toFantasyHomePageViewModel(createFantasyHomeExperience());

    expect(viewModel).not.toBeNull();
    expect(viewModel?.primaryLeague.phase).toBe('lineups-published');
    expect(viewModel?.primaryLeague.actions[0]?.label).toBe('Editar equipo');
    expect(viewModel?.primaryLeague.predictionOutcome?.bonusLabel).toBe('2 pts');
    expect(viewModel?.primaryLeague.overviewLink).toBe('/fantasy');
    expect(viewModel?.primaryLeague.marketLink).toBe('/fantasy/leagues/league-1/market');
    expect(viewModel?.primaryLeague.teamDraftLink).toBe('/fantasy/leagues/league-1/create-team');
    expect(viewModel?.primaryLeague.statusMetrics[0]?.label).toBe('Posición');
    expect(viewModel?.secondaryLeagues).toHaveLength(1);
  });

  it('maps the prediction-open flow into a plantilla-first porra experience', () => {
    const viewModel = toFantasyHomePageViewModel(
      createFantasyHomeExperience({
        primaryLeague: createFantasyHomeExperience().primaryLeague
          ? {
              ...createFantasyHomeExperience().primaryLeague!,
              weeklyCycle: createFantasyWeeklyCycle({
                phase: 'prediction-open',
                phaseLabel: 'Haz tu porra',
                predictionOutcome: null,
              }),
            }
          : null,
      }),
    );

    expect(viewModel?.primaryLeague.phase).toBe('prediction-open');
    expect(viewModel?.primaryLeague.actions[0]?.label).toBe('Hacer porra');
    expect(viewModel?.primaryLeague.predictionOutcome).toBeNull();
  });
});

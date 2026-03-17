import { InjectionToken, makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';

import { CreateFantasyLeagueUseCase } from '@features/fantasy/application/use-cases/create-fantasy-league.use-case';
import { JoinFantasyLeagueByCodeUseCase } from '@features/fantasy/application/use-cases/join-fantasy-league-by-code.use-case';
import { LoadFantasyLeagueDashboardUseCase } from '@features/fantasy/application/use-cases/load-fantasy-league-dashboard.use-case';
import { LoadFantasyPlayerProfileUseCase } from '@features/fantasy/application/use-cases/load-fantasy-player-profile.use-case';
import { LoadMyFantasyLeaguesUseCase } from '@features/fantasy/application/use-cases/load-my-fantasy-leagues.use-case';
import { SaveFantasyTeamUseCase } from '@features/fantasy/application/use-cases/save-fantasy-team.use-case';
import { FantasyRepository } from '@features/fantasy/application/ports/fantasy.repository';
import { InMemoryFantasyRepository } from '@features/fantasy/infrastructure/repositories/in-memory-fantasy.repository';

export const LOAD_MY_FANTASY_LEAGUES_USE_CASE = new InjectionToken<LoadMyFantasyLeaguesUseCase>(
  'LOAD_MY_FANTASY_LEAGUES_USE_CASE',
);

export const CREATE_FANTASY_LEAGUE_USE_CASE = new InjectionToken<CreateFantasyLeagueUseCase>(
  'CREATE_FANTASY_LEAGUE_USE_CASE',
);

export const JOIN_FANTASY_LEAGUE_BY_CODE_USE_CASE =
  new InjectionToken<JoinFantasyLeagueByCodeUseCase>('JOIN_FANTASY_LEAGUE_BY_CODE_USE_CASE');

export const LOAD_FANTASY_LEAGUE_DASHBOARD_USE_CASE =
  new InjectionToken<LoadFantasyLeagueDashboardUseCase>('LOAD_FANTASY_LEAGUE_DASHBOARD_USE_CASE');

export const LOAD_FANTASY_PLAYER_PROFILE_USE_CASE =
  new InjectionToken<LoadFantasyPlayerProfileUseCase>('LOAD_FANTASY_PLAYER_PROFILE_USE_CASE');

export const SAVE_FANTASY_TEAM_USE_CASE = new InjectionToken<SaveFantasyTeamUseCase>(
  'SAVE_FANTASY_TEAM_USE_CASE',
);

export function provideFantasyFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    InMemoryFantasyRepository,
    {
      provide: FantasyRepository,
      useExisting: InMemoryFantasyRepository,
    },
    {
      provide: LOAD_MY_FANTASY_LEAGUES_USE_CASE,
      useFactory: (repository: FantasyRepository) => new LoadMyFantasyLeaguesUseCase(repository),
      deps: [FantasyRepository],
    },
    {
      provide: CREATE_FANTASY_LEAGUE_USE_CASE,
      useFactory: (repository: FantasyRepository) => new CreateFantasyLeagueUseCase(repository),
      deps: [FantasyRepository],
    },
    {
      provide: JOIN_FANTASY_LEAGUE_BY_CODE_USE_CASE,
      useFactory: (repository: FantasyRepository) => new JoinFantasyLeagueByCodeUseCase(repository),
      deps: [FantasyRepository],
    },
    {
      provide: LOAD_FANTASY_LEAGUE_DASHBOARD_USE_CASE,
      useFactory: (repository: FantasyRepository) =>
        new LoadFantasyLeagueDashboardUseCase(repository),
      deps: [FantasyRepository],
    },
    {
      provide: LOAD_FANTASY_PLAYER_PROFILE_USE_CASE,
      useFactory: (repository: FantasyRepository) =>
        new LoadFantasyPlayerProfileUseCase(repository),
      deps: [FantasyRepository],
    },
    {
      provide: SAVE_FANTASY_TEAM_USE_CASE,
      useFactory: (repository: FantasyRepository) => new SaveFantasyTeamUseCase(repository),
      deps: [FantasyRepository],
    },
  ]);
}

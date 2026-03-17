import {
  type CreateFantasyLeagueCommand,
  type FantasyHomeExperience,
  type FantasyLeagueDashboard,
  type FantasyLeagueResults,
  type SaveFantasyTeamCommand,
} from '@features/fantasy/domain/entities/fantasy.models';
import {
  createFantasyLeague,
  createFantasyLeagueDashboard,
} from '@features/fantasy/testing/fantasy-test.fixtures';

import { FantasyRepository } from '../ports/fantasy.repository';
import { LoadFantasyLeagueDashboardUseCase } from './load-fantasy-league-dashboard.use-case';

class FantasyRepositoryStub extends FantasyRepository {
  constructor(
    private readonly leagueDashboard: FantasyLeagueDashboard | null,
    private readonly playerProfile = null,
    private readonly leagues: readonly never[] = [],
  ) {
    super();
  }

  override async loadMyLeagues(): Promise<readonly never[]> {
    return this.leagues;
  }

  override async loadLeagueDashboard(_leagueId: string): Promise<FantasyLeagueDashboard | null> {
    return this.leagueDashboard;
  }

  override async loadHomeExperience(): Promise<FantasyHomeExperience> {
    return {
      primaryLeague: null,
      secondaryLeagues: [],
    };
  }

  override async loadLeagueResults(_leagueId: string): Promise<FantasyLeagueResults | null> {
    return null;
  }

  override async loadPlayerProfile(_playerId: string): Promise<null> {
    return this.playerProfile;
  }

  override async createLeague(
    _command: CreateFantasyLeagueCommand,
  ): Promise<FantasyLeagueDashboard> {
    return createFantasyLeagueDashboard();
  }

  override async joinLeagueByCode(_code: string): Promise<FantasyLeagueDashboard | null> {
    return null;
  }

  override async saveTeam(
    _command: SaveFantasyTeamCommand,
  ): Promise<FantasyLeagueDashboard | null> {
    return this.leagueDashboard;
  }
}

describe('LoadFantasyLeagueDashboardUseCase', () => {
  it('returns the requested fantasy dashboard', async () => {
    const dashboard = createFantasyLeagueDashboard({
      league: createFantasyLeague({
        code: 'CURRO26',
        myRank: 2,
      }),
      ranking: [],
      players: [],
    });
    const useCase = new LoadFantasyLeagueDashboardUseCase(new FantasyRepositoryStub(dashboard));

    await expect(useCase.execute('league-1')).resolves.toEqual(dashboard);
  });
});

import {
  type CreateFantasyLeagueCommand,
  type FantasyHomeExperience,
  type FantasyLeague,
  type FantasyLeagueDashboard,
  type FantasyLeagueResults,
  type FantasyPlayer,
  type SaveFantasyTeamCommand,
} from '@features/fantasy/domain/entities/fantasy.models';
import {
  createFantasyLeagueDashboard,
  createFantasyLeagueResults,
} from '@features/fantasy/testing/fantasy-test.fixtures';

import { FantasyRepository } from '../ports/fantasy.repository';
import { LoadFantasyLeagueResultsUseCase } from './load-fantasy-league-results.use-case';

class FantasyRepositoryStub extends FantasyRepository {
  constructor(private readonly results: FantasyLeagueResults | null) {
    super();
  }

  override async loadMyLeagues(): Promise<readonly FantasyLeague[]> {
    return [];
  }

  override async loadLeagueDashboard(_leagueId: string): Promise<FantasyLeagueDashboard | null> {
    return null;
  }

  override async loadHomeExperience(): Promise<FantasyHomeExperience> {
    return {
      primaryLeague: null,
      secondaryLeagues: [],
    };
  }

  override async loadLeagueResults(_leagueId: string): Promise<FantasyLeagueResults | null> {
    return this.results;
  }

  override async loadPlayerProfile(_playerId: string): Promise<FantasyPlayer | null> {
    return null;
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
    return null;
  }
}

describe('LoadFantasyLeagueResultsUseCase', () => {
  it('returns weekly results for a league', async () => {
    const results = createFantasyLeagueResults();
    const useCase = new LoadFantasyLeagueResultsUseCase(new FantasyRepositoryStub(results));

    await expect(useCase.execute('league-1')).resolves.toEqual(results);
  });
});

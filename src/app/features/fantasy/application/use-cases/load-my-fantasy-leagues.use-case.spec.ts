import {
  type CreateFantasyLeagueCommand,
  type FantasyLeague,
  type FantasyLeagueDashboard,
  type SaveFantasyTeamCommand,
} from '@features/fantasy/domain/entities/fantasy.models';
import {
  createFantasyLeague,
  createFantasyLeagueDashboard,
} from '@features/fantasy/testing/fantasy-test.fixtures';

import { FantasyRepository } from '../ports/fantasy.repository';
import { LoadMyFantasyLeaguesUseCase } from './load-my-fantasy-leagues.use-case';

class FantasyRepositoryStub extends FantasyRepository {
  constructor(
    private readonly leagues: readonly FantasyLeague[],
    private readonly dashboard = null,
    private readonly playerProfile = null,
  ) {
    super();
  }

  override async loadMyLeagues(): Promise<readonly FantasyLeague[]> {
    return this.leagues;
  }

  override async loadLeagueDashboard(_leagueId: string): Promise<null> {
    return this.dashboard;
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
    return null;
  }
}

describe('LoadMyFantasyLeaguesUseCase', () => {
  it('returns the current user leagues', async () => {
    const leagues = [
      createFantasyLeague({
        id: 'league-1',
        code: 'CURRO26',
        myRank: 2,
      }),
      createFantasyLeague({
        id: 'league-2',
        name: 'Colegas pádel',
        code: 'PALA26',
        memberCount: 12,
        myRank: 5,
      }),
    ] satisfies readonly FantasyLeague[];
    const useCase = new LoadMyFantasyLeaguesUseCase(new FantasyRepositoryStub(leagues));

    await expect(useCase.execute()).resolves.toEqual(leagues);
  });
});

import {
  type CreateFantasyLeagueCommand,
  type FantasyHomeExperience,
  type FantasyLeague,
  type FantasyLeagueDashboard,
  type FantasyLeagueResults,
  type FantasyPlayer,
  type SaveFantasyTeamCommand,
} from '@features/fantasy/domain/entities/fantasy.models';
import { createFantasyLeagueDashboard } from '@features/fantasy/testing/fantasy-test.fixtures';

import { FantasyRepository } from '../ports/fantasy.repository';
import { JoinFantasyLeagueByCodeUseCase } from './join-fantasy-league-by-code.use-case';

class FantasyRepositoryStub extends FantasyRepository {
  private joinedCode: string | null = null;

  constructor(private readonly dashboard: FantasyLeagueDashboard | null) {
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
    return null;
  }

  override async loadPlayerProfile(_playerId: string): Promise<FantasyPlayer | null> {
    return null;
  }

  override async createLeague(
    _command: CreateFantasyLeagueCommand,
  ): Promise<FantasyLeagueDashboard> {
    return createFantasyLeagueDashboard();
  }

  override async joinLeagueByCode(code: string): Promise<FantasyLeagueDashboard | null> {
    this.joinedCode = code;

    return this.dashboard;
  }

  override async saveTeam(
    _command: SaveFantasyTeamCommand,
  ): Promise<FantasyLeagueDashboard | null> {
    return null;
  }

  get lastJoinedCode(): string | null {
    return this.joinedCode;
  }
}

describe('JoinFantasyLeagueByCodeUseCase', () => {
  it('delegates the code lookup to the repository and returns the resolved dashboard', async () => {
    const dashboard = createFantasyLeagueDashboard();
    const repository = new FantasyRepositoryStub(dashboard);
    const useCase = new JoinFantasyLeagueByCodeUseCase(repository);

    await expect(useCase.execute('CURRO26')).resolves.toEqual(dashboard);
    expect(repository.lastJoinedCode).toBe('CURRO26');
  });

  it('propagates missing league lookups', async () => {
    const repository = new FantasyRepositoryStub(null);
    const useCase = new JoinFantasyLeagueByCodeUseCase(repository);

    await expect(useCase.execute('MISSING26')).resolves.toBeNull();
  });
});

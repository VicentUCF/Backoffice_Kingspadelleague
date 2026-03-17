import {
  type CreateFantasyLeagueCommand,
  type FantasyHomeExperience,
  type FantasyLeague,
  type FantasyLeagueDashboard,
  type FantasyLeagueResults,
  type SaveFantasyTeamCommand,
} from '@features/fantasy/domain/entities/fantasy.models';
import {
  createFantasyLeagueDashboard,
  createFantasyWeeklyCycle,
} from '@features/fantasy/testing/fantasy-test.fixtures';

import { FantasyRepository } from '../ports/fantasy.repository';
import { SaveFantasyTeamUseCase } from './save-fantasy-team.use-case';

class FantasyRepositoryStub extends FantasyRepository {
  private savedCommand: SaveFantasyTeamCommand | null = null;

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

  override async loadPlayerProfile(_playerId: string): Promise<null> {
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

  override async saveTeam(command: SaveFantasyTeamCommand): Promise<FantasyLeagueDashboard | null> {
    this.savedCommand = command;

    return this.dashboard;
  }

  get lastSavedCommand(): SaveFantasyTeamCommand | null {
    return this.savedCommand;
  }
}

describe('SaveFantasyTeamUseCase', () => {
  const league: FantasyLeague = {
    id: 'league-1',
    name: 'Amigos del curro',
    code: 'CURRO26',
    memberCount: 8,
    myRank: 1,
    myPoints: 0,
    phase: 'preseason',
  };
  const dashboard: FantasyLeagueDashboard = {
    league,
    myTeam: null,
    teams: [],
    ranking: [],
    players: [],
    marketLocked: false,
    weeklyCycle: createFantasyWeeklyCycle({
      phase: 'prediction-open',
      predictionOutcome: null,
    }),
  };
  const command: SaveFantasyTeamCommand = {
    leagueId: 'league-1',
    teamName: 'Pretemporada',
    selectedPlayerIds: [
      'kings-of-favar-player-1',
      'thormentadores-player-1',
      'magic-city-player-1',
    ],
    captainId: 'thormentadores-player-1',
  };

  it('delegates the saveTeam call to the repository and returns the dashboard', async () => {
    const repository = new FantasyRepositoryStub(dashboard);
    const useCase = new SaveFantasyTeamUseCase(repository);

    await expect(useCase.execute(command)).resolves.toEqual(dashboard);
    expect(repository.lastSavedCommand).toBe(command);
  });

  it('propagates null responses when the repository returns no dashboard', async () => {
    const repository = new FantasyRepositoryStub(null);
    const useCase = new SaveFantasyTeamUseCase(repository);

    await expect(useCase.execute(command)).resolves.toBeNull();
  });
});

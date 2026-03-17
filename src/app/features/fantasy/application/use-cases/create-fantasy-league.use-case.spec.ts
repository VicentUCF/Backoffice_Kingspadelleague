import {
  type CreateFantasyLeagueCommand,
  type FantasyLeague,
  type FantasyLeagueDashboard,
  type FantasyPlayer,
  type SaveFantasyTeamCommand,
} from '@features/fantasy/domain/entities/fantasy.models';
import { createFantasyLeagueDashboard } from '@features/fantasy/testing/fantasy-test.fixtures';

import { FantasyRepository } from '../ports/fantasy.repository';
import { CreateFantasyLeagueUseCase } from './create-fantasy-league.use-case';

class FantasyRepositoryStub extends FantasyRepository {
  private createdCommand: CreateFantasyLeagueCommand | null = null;

  constructor(private readonly dashboard: FantasyLeagueDashboard) {
    super();
  }

  override async loadMyLeagues(): Promise<readonly FantasyLeague[]> {
    return [];
  }

  override async loadLeagueDashboard(_leagueId: string): Promise<FantasyLeagueDashboard | null> {
    return null;
  }

  override async loadPlayerProfile(_playerId: string): Promise<FantasyPlayer | null> {
    return null;
  }

  override async createLeague(
    command: CreateFantasyLeagueCommand,
  ): Promise<FantasyLeagueDashboard> {
    this.createdCommand = command;

    return this.dashboard;
  }

  override async joinLeagueByCode(_code: string): Promise<FantasyLeagueDashboard | null> {
    return null;
  }

  override async saveTeam(
    _command: SaveFantasyTeamCommand,
  ): Promise<FantasyLeagueDashboard | null> {
    return null;
  }

  get lastCreatedCommand(): CreateFantasyLeagueCommand | null {
    return this.createdCommand;
  }
}

describe('CreateFantasyLeagueUseCase', () => {
  it('delegates league creation to the repository', async () => {
    const dashboard = createFantasyLeagueDashboard();
    const repository = new FantasyRepositoryStub(dashboard);
    const useCase = new CreateFantasyLeagueUseCase(repository);
    const command: CreateFantasyLeagueCommand = {
      name: 'Fantasy del viernes',
      description: 'Liga cerrada para el grupo habitual',
    };

    await expect(useCase.execute(command)).resolves.toEqual(dashboard);
    expect(repository.lastCreatedCommand).toEqual(command);
  });
});

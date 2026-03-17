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
  createFantasyHomeExperience,
  createFantasyLeagueDashboard,
} from '@features/fantasy/testing/fantasy-test.fixtures';

import { FantasyRepository } from '../ports/fantasy.repository';
import { LoadFantasyHomeExperienceUseCase } from './load-fantasy-home-experience.use-case';

class FantasyRepositoryStub extends FantasyRepository {
  constructor(private readonly homeExperience: FantasyHomeExperience) {
    super();
  }

  override async loadMyLeagues(): Promise<readonly FantasyLeague[]> {
    return [];
  }

  override async loadLeagueDashboard(_leagueId: string): Promise<FantasyLeagueDashboard | null> {
    return null;
  }

  override async loadHomeExperience(): Promise<FantasyHomeExperience> {
    return this.homeExperience;
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

  override async joinLeagueByCode(_code: string): Promise<FantasyLeagueDashboard | null> {
    return null;
  }

  override async saveTeam(
    _command: SaveFantasyTeamCommand,
  ): Promise<FantasyLeagueDashboard | null> {
    return null;
  }
}

describe('LoadFantasyHomeExperienceUseCase', () => {
  it('returns the weekly fantasy home experience', async () => {
    const homeExperience = createFantasyHomeExperience();
    const useCase = new LoadFantasyHomeExperienceUseCase(new FantasyRepositoryStub(homeExperience));

    await expect(useCase.execute()).resolves.toEqual(homeExperience);
  });
});

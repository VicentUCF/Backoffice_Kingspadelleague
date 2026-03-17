import {
  type CreateFantasyLeagueCommand,
  type FantasyLeagueDashboard,
  type FantasyPlayer,
  type SaveFantasyTeamCommand,
} from '@features/fantasy/domain/entities/fantasy.models';
import {
  createFantasyLeagueDashboard,
  createFantasyPlayer,
} from '@features/fantasy/testing/fantasy-test.fixtures';

import { FantasyRepository } from '../ports/fantasy.repository';
import { LoadFantasyPlayerProfileUseCase } from './load-fantasy-player-profile.use-case';

class FantasyRepositoryStub extends FantasyRepository {
  constructor(
    private readonly playerProfile: FantasyPlayer | null,
    private readonly dashboard = null,
    private readonly leagues: readonly never[] = [],
  ) {
    super();
  }

  override async loadMyLeagues(): Promise<readonly never[]> {
    return this.leagues;
  }

  override async loadLeagueDashboard(_leagueId: string): Promise<null> {
    return this.dashboard;
  }

  override async loadPlayerProfile(_playerId: string): Promise<FantasyPlayer | null> {
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

describe('LoadFantasyPlayerProfileUseCase', () => {
  it('returns a fantasy player profile by id', async () => {
    const player = createFantasyPlayer({
      id: 'thormentadores-player-1',
      slug: 'borja-vercher',
      name: 'Borja Vercher',
      avatar: 'BV',
      photoPath: '/stock_players/player-06.svg',
      teamId: 'thormentadores',
      teamName: 'Thormentadores',
      teamLogoPath: '/teams_logos/Thormentadores.png',
    }) satisfies FantasyPlayer;
    const useCase = new LoadFantasyPlayerProfileUseCase(new FantasyRepositoryStub(player));

    await expect(useCase.execute('thormentadores-player-1')).resolves.toEqual(player);
  });
});

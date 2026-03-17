import {
  type CreateFantasyLeagueCommand,
  type FantasyLeague,
  type FantasyLeagueDashboard,
  type FantasyPlayer,
  type SaveFantasyTeamCommand,
} from '@features/fantasy/domain/entities/fantasy.models';

export abstract class FantasyRepository {
  abstract loadMyLeagues(): Promise<readonly FantasyLeague[]>;

  abstract loadLeagueDashboard(leagueId: string): Promise<FantasyLeagueDashboard | null>;

  abstract loadPlayerProfile(playerId: string): Promise<FantasyPlayer | null>;

  abstract createLeague(command: CreateFantasyLeagueCommand): Promise<FantasyLeagueDashboard>;

  abstract joinLeagueByCode(code: string): Promise<FantasyLeagueDashboard | null>;

  abstract saveTeam(command: SaveFantasyTeamCommand): Promise<FantasyLeagueDashboard | null>;
}

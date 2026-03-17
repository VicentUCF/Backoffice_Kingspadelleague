import {
  type FantasyLeague,
  type FantasyLeagueDashboard,
  type FantasyPlayer,
} from '@features/fantasy/domain/entities/fantasy.models';

export abstract class FantasyRepository {
  abstract loadMyLeagues(): Promise<readonly FantasyLeague[]>;

  abstract loadLeagueDashboard(leagueId: string): Promise<FantasyLeagueDashboard | null>;

  abstract loadPlayerProfile(playerId: string): Promise<FantasyPlayer | null>;
}

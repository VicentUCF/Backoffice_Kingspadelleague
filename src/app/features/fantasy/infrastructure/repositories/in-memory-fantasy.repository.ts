import { Injectable } from '@angular/core';

import {
  type FantasyLeague,
  type FantasyLeagueDashboard,
  type FantasyPlayer,
} from '@features/fantasy/domain/entities/fantasy.models';
import { type FantasyRepository } from '@features/fantasy/application/ports/fantasy.repository';
import {
  FANTASY_DASHBOARD_BY_LEAGUE_SEED,
  FANTASY_LEAGUES_SEED,
  FANTASY_PLAYERS_SEED,
} from '@features/fantasy/infrastructure/mocks/fantasy.seed';

@Injectable()
export class InMemoryFantasyRepository implements FantasyRepository {
  async loadMyLeagues(): Promise<readonly FantasyLeague[]> {
    return FANTASY_LEAGUES_SEED;
  }

  async loadLeagueDashboard(leagueId: string): Promise<FantasyLeagueDashboard | null> {
    return FANTASY_DASHBOARD_BY_LEAGUE_SEED[leagueId] ?? null;
  }

  async loadPlayerProfile(playerId: string): Promise<FantasyPlayer | null> {
    return FANTASY_PLAYERS_SEED.find((player) => player.id === playerId) ?? null;
  }
}

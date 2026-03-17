import { Injectable } from '@angular/core';

import {
  type CreateFantasyLeagueCommand,
  type FantasyLeague,
  type FantasyLeagueDashboard,
  type FantasyPlayer,
  type FantasyRankingEntry,
  type FantasyTeam,
  type SaveFantasyTeamCommand,
} from '@features/fantasy/domain/entities/fantasy.models';
import { type FantasyRepository } from '@features/fantasy/application/ports/fantasy.repository';
import { FANTASY_TEAM_INITIAL_BUDGET } from '@features/fantasy/domain/services/build-fantasy-team-draft';
import { generateFantasyLeagueInvitationCode } from '@features/fantasy/domain/services/generate-fantasy-league-invitation-code';
import {
  FANTASY_DASHBOARD_BY_LEAGUE_SEED,
  FANTASY_LEAGUES_SEED,
  FANTASY_PLAYERS_SEED,
} from '@features/fantasy/infrastructure/mocks/fantasy.seed';

const DEFAULT_FANTASY_MANAGER_NAME = 'Vicent';
const EMPTY_FANTASY_TEAM_LABEL = 'Equipo pendiente';
const FANTASY_STORAGE_KEY = 'kingspadelleague.fantasy.state';

@Injectable()
export class InMemoryFantasyRepository implements FantasyRepository {
  private readonly players = FANTASY_PLAYERS_SEED;
  private readonly dashboardsByLeague = buildDashboardsByLeagueMap(
    readPersistedFantasyState()?.dashboardsByLeague ??
      Object.values(FANTASY_DASHBOARD_BY_LEAGUE_SEED),
  );
  private leagues = (readPersistedFantasyState()?.leagues ?? FANTASY_LEAGUES_SEED).map(
    (league) => ({ ...league }),
  );
  private nextLeagueSequence = resolveNextLeagueSequence(this.leagues);

  async loadMyLeagues(): Promise<readonly FantasyLeague[]> {
    return this.leagues.map((league) => ({ ...league }));
  }

  async loadLeagueDashboard(leagueId: string): Promise<FantasyLeagueDashboard | null> {
    const dashboard = this.dashboardsByLeague.get(leagueId);

    return dashboard ? cloneDashboard(dashboard) : null;
  }

  async loadPlayerProfile(playerId: string): Promise<FantasyPlayer | null> {
    const player = this.players.find((candidate) => candidate.id === playerId);

    return player ? { ...player } : null;
  }

  async createLeague(command: CreateFantasyLeagueCommand): Promise<FantasyLeagueDashboard> {
    const leagueName = command.name.trim() || 'Nueva liga fantasy';
    const leagueId = `league-${this.nextLeagueSequence++}`;
    const leagueCode = this.createUniqueLeagueCode(generateFantasyLeagueInvitationCode(leagueName));
    const league: FantasyLeague = {
      id: leagueId,
      name: leagueName,
      code: leagueCode,
      memberCount: 1,
      myRank: 1,
      myPoints: 0,
      phase: 'preseason',
    };
    const dashboard: FantasyLeagueDashboard = {
      league,
      myTeam: null,
      ranking: [
        {
          rank: 1,
          teamName: EMPTY_FANTASY_TEAM_LABEL,
          managerName: DEFAULT_FANTASY_MANAGER_NAME,
          totalPoints: 0,
          matchdayPoints: 0,
          teamValue: 0,
          isMe: true,
        },
      ],
      players: this.players.map((player) => ({ ...player })),
      marketLocked: false,
    };

    this.dashboardsByLeague.set(leagueId, cloneDashboard(dashboard));
    this.leagues = [{ ...league }, ...this.leagues];
    this.persistState();

    return cloneDashboard(dashboard);
  }

  async joinLeagueByCode(code: string): Promise<FantasyLeagueDashboard | null> {
    const normalizedCode = normalizeFantasyLeagueCode(code);
    const league = this.leagues.find(
      (candidate) => normalizeFantasyLeagueCode(candidate.code) === normalizedCode,
    );

    if (!league) {
      return null;
    }

    return this.loadLeagueDashboard(league.id);
  }

  async saveTeam(command: SaveFantasyTeamCommand): Promise<FantasyLeagueDashboard | null> {
    const dashboard = this.dashboardsByLeague.get(command.leagueId);

    if (!dashboard) {
      return null;
    }

    const uniquePlayerIds = [...new Set(command.selectedPlayerIds)];
    const selectedPlayers = uniquePlayerIds.map((playerId) =>
      this.players.find((player) => player.id === playerId),
    );

    if (
      selectedPlayers.some((player) => player === undefined) ||
      uniquePlayerIds.length !== 6 ||
      !uniquePlayerIds.includes(command.captainId)
    ) {
      return null;
    }

    const resolvedPlayers = selectedPlayers.filter(isFantasyPlayer);
    const teamValue = resolvedPlayers.reduce((total, player) => total + player.price, 0);

    if (teamValue > FANTASY_TEAM_INITIAL_BUDGET) {
      return null;
    }

    const nextTeam: FantasyTeam = {
      id: dashboard.myTeam?.id ?? `team-${command.leagueId}`,
      leagueId: command.leagueId,
      name: command.teamName.trim() || dashboard.myTeam?.name || 'Mi equipo fantasy',
      budgetRemaining: FANTASY_TEAM_INITIAL_BUDGET - teamValue,
      teamValue,
      totalPoints: 0,
      matchdayPoints: 0,
      players: uniquePlayerIds.map((playerId, index) => ({
        playerId,
        isStarter: index < 4,
        isCaptain: playerId === command.captainId,
      })),
    };

    const nextRanking = updateRanking(dashboard.ranking, nextTeam, dashboard.myTeam?.name);
    const myRankingEntry = nextRanking.find((entry) => entry.isMe) ?? nextRanking[0];
    const nextLeague: FantasyLeague = {
      ...dashboard.league,
      myRank: myRankingEntry?.rank ?? dashboard.league.myRank,
      myPoints: myRankingEntry?.totalPoints ?? dashboard.league.myPoints,
    };
    const nextDashboard: FantasyLeagueDashboard = {
      ...dashboard,
      league: nextLeague,
      myTeam: nextTeam,
      ranking: nextRanking,
    };

    this.dashboardsByLeague.set(command.leagueId, cloneDashboard(nextDashboard));
    this.leagues = this.leagues.map((league) =>
      league.id === nextLeague.id ? { ...nextLeague } : league,
    );
    this.persistState();

    return cloneDashboard(nextDashboard);
  }

  private createUniqueLeagueCode(baseCode: string): string {
    let nextCode = baseCode;
    let counter = 2;

    while (this.leagues.some((league) => league.code === nextCode)) {
      nextCode = appendLeagueCodeCounter(baseCode, counter);
      counter += 1;
    }

    return nextCode;
  }

  private persistState(): void {
    writePersistedFantasyState({
      dashboardsByLeague: [...this.dashboardsByLeague.values()].map((dashboard) =>
        cloneDashboard(dashboard),
      ),
      leagues: this.leagues.map((league) => ({ ...league })),
    });
  }
}

function updateRanking(
  ranking: readonly FantasyRankingEntry[],
  team: FantasyTeam,
  previousTeamName: string | undefined,
): readonly FantasyRankingEntry[] {
  return ranking
    .map((entry) => {
      if (!entry.isMe) {
        return { ...entry };
      }

      return {
        ...entry,
        teamName: team.name || previousTeamName || entry.teamName,
        teamValue: team.teamValue,
        totalPoints: 0,
        matchdayPoints: 0,
      };
    })
    .sort((leftEntry, rightEntry) => {
      if (rightEntry.teamValue !== leftEntry.teamValue) {
        return rightEntry.teamValue - leftEntry.teamValue;
      }

      return leftEntry.teamName.localeCompare(rightEntry.teamName, 'es');
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}

function cloneDashboard(dashboard: FantasyLeagueDashboard): FantasyLeagueDashboard {
  return {
    ...dashboard,
    league: { ...dashboard.league },
    myTeam: dashboard.myTeam ? cloneTeam(dashboard.myTeam) : null,
    ranking: dashboard.ranking.map((entry) => ({ ...entry })),
    players: dashboard.players.map((player) => ({ ...player })),
  };
}

function cloneTeam(team: FantasyTeam): FantasyTeam {
  return {
    ...team,
    players: team.players.map((player) => ({ ...player })),
  };
}

function isFantasyPlayer(player: FantasyPlayer | undefined): player is FantasyPlayer {
  return player !== undefined;
}

function appendLeagueCodeCounter(baseCode: string, counter: number): string {
  const suffix = `${counter}`;
  const baseLength = Math.max(4, 12 - suffix.length);

  return `${baseCode.slice(0, baseLength)}${suffix}`;
}

function normalizeFantasyLeagueCode(value: string): string {
  return value.trim().toUpperCase();
}

function buildDashboardsByLeagueMap(
  dashboards: readonly FantasyLeagueDashboard[],
): Map<string, FantasyLeagueDashboard> {
  return new Map(
    dashboards.map((dashboard) => [dashboard.league.id, cloneDashboard(dashboard)] as const),
  );
}

function resolveNextLeagueSequence(leagues: readonly FantasyLeague[]): number {
  const numericIds = leagues
    .map((league) => Number(league.id.replace(/^league-/, '')))
    .filter((id) => Number.isFinite(id));

  return (numericIds.length ? Math.max(...numericIds) : 0) + 1;
}

function readPersistedFantasyState(): {
  readonly dashboardsByLeague: readonly FantasyLeagueDashboard[];
  readonly leagues: readonly FantasyLeague[];
} | null {
  const storage = resolveFantasyStorage();

  if (!storage) {
    return null;
  }

  try {
    const rawValue = storage.getItem(FANTASY_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as {
      readonly dashboardsByLeague: readonly FantasyLeagueDashboard[];
      readonly leagues: readonly FantasyLeague[];
    };
  } catch {
    return null;
  }
}

function writePersistedFantasyState(state: {
  readonly dashboardsByLeague: readonly FantasyLeagueDashboard[];
  readonly leagues: readonly FantasyLeague[];
}): void {
  const storage = resolveFantasyStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(FANTASY_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota or availability issues in the in-memory fallback.
  }
}

function resolveFantasyStorage(): Storage | null {
  return typeof window !== 'undefined' ? window.localStorage : null;
}

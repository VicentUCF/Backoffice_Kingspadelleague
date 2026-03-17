import { Injectable } from '@angular/core';

import {
  type CreateFantasyLeagueCommand,
  type FantasyHomeExperience,
  type FantasyHomePrimaryLeague,
  type FantasyLeague,
  type FantasyLeagueDashboard,
  type FantasyLeagueResults,
  type FantasyMarketMover,
  type FantasyPlayer,
  type FantasyPredictionOutcome,
  type FantasyRankingEntry,
  type FantasyResultsPlayerLine,
  type FantasyResultsRankingEntry,
  type FantasyTeam,
  type FantasyWeeklyCountdown,
  type FantasyWeeklyCycle,
  type FantasyWeeklyFeedEntry,
  type SaveFantasyTeamCommand,
} from '@features/fantasy/domain/entities/fantasy.models';
import { type FantasyRepository } from '@features/fantasy/application/ports/fantasy.repository';
import { sanitizeFantasyTeamStarters } from '@features/fantasy/domain/services/build-fantasy-team-lineup';
import { FANTASY_TEAM_INITIAL_BUDGET } from '@features/fantasy/domain/services/build-fantasy-team-draft';
import { generateFantasyLeagueInvitationCode } from '@features/fantasy/domain/services/generate-fantasy-league-invitation-code';
import { resolveFantasyPredictionOutcome } from '@features/fantasy/domain/services/resolve-fantasy-prediction-outcome';
import {
  FANTASY_DASHBOARD_BY_LEAGUE_SEED,
  FANTASY_LEAGUES_SEED,
  FANTASY_PLAYERS_SEED,
} from '@features/fantasy/infrastructure/mocks/fantasy.seed';
import {
  FANTASY_HOME_PRIMARY_LEAGUE_SEED,
  FANTASY_LEAGUE_RESULTS_SEED,
} from '@features/fantasy/infrastructure/mocks/fantasy-weekly.seed';

const DEFAULT_FANTASY_MANAGER_NAME = 'Vicent';
const EMPTY_FANTASY_TEAM_LABEL = 'Equipo pendiente';
const FANTASY_STORAGE_KEY = 'kingspadelleague.fantasy.state.v3';

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

    return dashboard ? synchronizeDashboardWeeklyCycle(dashboard) : null;
  }

  async loadHomeExperience(): Promise<FantasyHomeExperience> {
    const primaryLeague = this.leagues[0] ?? null;

    if (!primaryLeague) {
      return {
        primaryLeague: null,
        secondaryLeagues: [],
      };
    }

    const dashboard = this.dashboardsByLeague.get(primaryLeague.id);

    return {
      primaryLeague: dashboard
        ? buildFantasyHomePrimaryLeague(synchronizeDashboardWeeklyCycle(dashboard))
        : null,
      secondaryLeagues: this.leagues.slice(1).map((league) => ({ ...league })),
    };
  }

  async loadLeagueResults(leagueId: string): Promise<FantasyLeagueResults | null> {
    const dashboard = this.dashboardsByLeague.get(leagueId);

    if (!dashboard) {
      return null;
    }

    const seed = FANTASY_LEAGUE_RESULTS_SEED[leagueId];

    if (!seed) {
      return null;
    }

    return buildFantasyLeagueResults(synchronizeDashboardWeeklyCycle(dashboard), seed);
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
      teams: [],
      ranking: [
        {
          rank: 1,
          teamId: `team-${leagueId}`,
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
      weeklyCycle: buildFallbackWeeklyCycle(null),
    };

    this.dashboardsByLeague.set(leagueId, cloneDashboard(dashboard));
    this.leagues = [{ ...league }, ...this.leagues];
    this.persistState();

    return synchronizeDashboardWeeklyCycle(dashboard);
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
      uniquePlayerIds.length > 6 ||
      (command.captainId !== null && !uniquePlayerIds.includes(command.captainId))
    ) {
      return null;
    }

    const resolvedPlayers = selectedPlayers.filter(isFantasyPlayer);
    const teamValue = resolvedPlayers.reduce((total, player) => total + player.price, 0);
    const nextCaptainId = command.captainId ?? uniquePlayerIds[0] ?? null;
    const requiredStarters = Math.min(4, uniquePlayerIds.length);
    const requestedStarterIds = [...new Set(command.starterPlayerIds ?? [])];
    const previousStarterIds =
      dashboard.myTeam?.players
        .filter((player) => player.isStarter)
        .map((player) => player.playerId) ?? [];
    const nextStarterIds =
      requestedStarterIds.length > 0 || command.starterPlayerIds !== undefined
        ? requestedStarterIds
        : sanitizeFantasyTeamStarters(uniquePlayerIds, previousStarterIds);

    if (teamValue > FANTASY_TEAM_INITIAL_BUDGET) {
      return null;
    }

    if (
      requestedStarterIds.some((playerId) => !uniquePlayerIds.includes(playerId)) ||
      (command.starterPlayerIds !== undefined && requestedStarterIds.length !== requiredStarters) ||
      (command.starterPlayerIds !== undefined &&
        nextCaptainId !== null &&
        !requestedStarterIds.includes(nextCaptainId))
    ) {
      return null;
    }

    const nextTeam =
      uniquePlayerIds.length === 0
        ? null
        : ({
            id: dashboard.myTeam?.id ?? `team-${command.leagueId}`,
            leagueId: command.leagueId,
            managerName: dashboard.myTeam?.managerName ?? DEFAULT_FANTASY_MANAGER_NAME,
            name: command.teamName.trim() || dashboard.myTeam?.name || 'Mi equipo fantasy',
            budgetRemaining: FANTASY_TEAM_INITIAL_BUDGET - teamValue,
            teamValue,
            totalPoints: 0,
            matchdayPoints: 0,
            submittedCaptainId: resolveSubmittedCaptainId(
              dashboard.weeklyCycle.phase,
              dashboard.myTeam?.submittedCaptainId ?? null,
              nextCaptainId,
            ),
            submittedStarterPlayerIds: resolveSubmittedStarterIds(
              dashboard.weeklyCycle.phase,
              dashboard.myTeam?.submittedStarterPlayerIds ?? [],
              nextStarterIds,
            ),
            players: uniquePlayerIds.map((playerId) => ({
              playerId,
              isStarter: nextStarterIds.includes(playerId),
              isCaptain: playerId === nextCaptainId,
            })),
          } satisfies FantasyTeam);

    const nextTeams = updateTeams(dashboard.teams, nextTeam, command.leagueId);
    const nextRanking = updateRanking(
      dashboard.ranking,
      nextTeams,
      command.leagueId,
      dashboard.myTeam?.name,
    );
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
      teams: nextTeams,
      ranking: nextRanking,
    };
    const synchronizedDashboard = synchronizeDashboardWeeklyCycle(nextDashboard);

    this.dashboardsByLeague.set(command.leagueId, cloneDashboard(synchronizedDashboard));
    this.leagues = this.leagues.map((league) =>
      league.id === nextLeague.id ? { ...nextLeague } : league,
    );
    this.persistState();

    return synchronizedDashboard;
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
  teams: readonly FantasyTeam[],
  leagueId: string,
  previousTeamName: string | undefined,
): readonly FantasyRankingEntry[] {
  return ranking
    .map((entry) => {
      if (!entry.isMe) {
        return { ...entry };
      }

      const myTeam = teams.find((team) => team.id === `team-${leagueId}`) ?? null;

      return {
        ...entry,
        teamId: myTeam?.id ?? entry.teamId,
        teamName: myTeam?.name || previousTeamName || EMPTY_FANTASY_TEAM_LABEL,
        managerName: myTeam?.managerName ?? entry.managerName,
        teamValue: myTeam?.teamValue ?? 0,
        totalPoints: myTeam?.totalPoints ?? 0,
        matchdayPoints: myTeam?.matchdayPoints ?? 0,
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

function updateTeams(
  teams: readonly FantasyTeam[],
  nextTeam: FantasyTeam | null,
  leagueId: string,
): readonly FantasyTeam[] {
  const teamId = `team-${leagueId}`;
  const rivalTeams = teams.filter((team) => team.id !== teamId).map((team) => cloneTeam(team));

  return nextTeam ? [...rivalTeams, cloneTeam(nextTeam)] : rivalTeams;
}

type FantasyHomePrimaryLeagueSeed = (typeof FANTASY_HOME_PRIMARY_LEAGUE_SEED)[string];
type FantasyLeagueResultsSeed = (typeof FANTASY_LEAGUE_RESULTS_SEED)[string];

function buildFantasyHomePrimaryLeague(
  dashboard: FantasyLeagueDashboard,
): FantasyHomePrimaryLeague {
  const seed = FANTASY_HOME_PRIMARY_LEAGUE_SEED[dashboard.league.id];

  return seed
    ? buildSeededFantasyHomePrimaryLeague(dashboard, seed)
    : buildFallbackFantasyHomePrimaryLeague(dashboard);
}

function buildSeededFantasyHomePrimaryLeague(
  dashboard: FantasyLeagueDashboard,
  seed: FantasyHomePrimaryLeagueSeed,
): FantasyHomePrimaryLeague {
  const captain = resolvePlayerById(dashboard.players, seed.impactSummary.captainPlayerId);

  return {
    league: { ...dashboard.league },
    teamName: dashboard.myTeam?.name ?? EMPTY_FANTASY_TEAM_LABEL,
    mode: seed.mode,
    headline: seed.headline,
    summary: seed.summary,
    impactSummary: {
      currentRank: seed.impactSummary.currentRank,
      previousRank: seed.impactSummary.previousRank,
      totalPoints: seed.impactSummary.totalPoints,
      lastMatchdayPoints: seed.impactSummary.lastMatchdayPoints,
      supportingText: seed.impactSummary.supportingText,
      captainPlayerId: seed.impactSummary.captainPlayerId,
      captainName: captain?.name ?? null,
      captainPoints: seed.impactSummary.captainPoints,
    },
    nextMatchdaySummary: seed.nextMatchdaySummary ? { ...seed.nextMatchdaySummary } : null,
    marketSections: seed.marketSections.map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description,
      movers: section.movers.map((mover) => toFantasyMarketMoverFromSeed(dashboard.players, mover)),
    })),
    feed: seed.feed.map((entry) => ({ ...entry })),
    weeklyCycle: buildSeededWeeklyCycle(seed, dashboard.myTeam),
  };
}

function buildFallbackFantasyHomePrimaryLeague(
  dashboard: FantasyLeagueDashboard,
): FantasyHomePrimaryLeague {
  const risingPlayers = [...dashboard.players]
    .sort((leftPlayer, rightPlayer) => {
      const leftMovement = leftPlayer.price - leftPlayer.previousPrice;
      const rightMovement = rightPlayer.price - rightPlayer.previousPrice;

      if (rightMovement !== leftMovement) {
        return rightMovement - leftMovement;
      }

      return rightPlayer.price - leftPlayer.price;
    })
    .slice(0, 3);
  const fallbackFormPlayers =
    dashboard.myTeam?.players
      .map((teamPlayer) => resolvePlayerById(dashboard.players, teamPlayer.playerId))
      .filter((player): player is FantasyPlayer => player !== null)
      .slice(0, 3) ?? [];
  const captain = resolvePlayerById(
    dashboard.players,
    dashboard.myTeam?.players.find((player) => player.isCaptain)?.playerId ?? null,
  );
  const currentRank = dashboard.league.myRank;
  const previousRank = Math.min(dashboard.ranking.length || currentRank + 1, currentRank + 1);
  const changesAvailable = Math.max(
    0,
    2 - Math.max(0, (dashboard.myTeam?.players.length ?? 0) - 4),
  );

  return {
    league: { ...dashboard.league },
    teamName: dashboard.myTeam?.name ?? EMPTY_FANTASY_TEAM_LABEL,
    mode: 'prep',
    headline: 'Tu fantasy entra en modo preparación.',
    summary:
      'Todavía no hay live, así que la ventaja sale de llegar mejor preparado al cierre semanal.',
    impactSummary: {
      currentRank,
      previousRank,
      totalPoints: dashboard.league.myPoints,
      lastMatchdayPoints: 0,
      supportingText:
        'La clasificación sigue abierta y el mercado es el sitio donde puedes ganar ventaja antes del domingo.',
      captainPlayerId: captain?.id ?? null,
      captainName: captain?.name ?? null,
      captainPoints: null,
    },
    nextMatchdaySummary: {
      kickoffLabel: 'Próxima jornada en preparación',
      countdownLabel: 'Mercado abierto para ajustar',
      changesAvailable,
      isUrgent: false,
    },
    marketSections: [
      {
        id: 'rising',
        title: 'Suben de precio',
        description: 'Jugadores con tendencia positiva para mover valor de plantilla.',
        movers: risingPlayers.map((player, index) =>
          toFantasyMarketMoverFromPlayer(player, buildFallbackRecentPoints(index + 1, true)),
        ),
      },
      {
        id: 'form',
        title: 'Mercado a vigilar',
        description: 'Piezas del roster que conviene revisar antes del siguiente cierre.',
        movers: (fallbackFormPlayers.length ? fallbackFormPlayers : risingPlayers).map(
          (player, index) =>
            toFantasyMarketMoverFromPlayer(player, buildFallbackRecentPoints(index + 1, false)),
        ),
      },
    ],
    feed: buildFallbackFantasyFeed(dashboard),
    weeklyCycle: buildFallbackWeeklyCycle(dashboard.myTeam),
  };
}

function buildSeededWeeklyCycle(
  seed: FantasyHomePrimaryLeagueSeed,
  team: FantasyTeam | null,
): FantasyWeeklyCycle {
  const countdown = toFantasyWeeklyCountdown(seed.weeklyCycle.countdown);
  const predictionOutcome = buildFantasyPredictionOutcome(seed, team);

  return {
    countdown,
    headline: seed.weeklyCycle.headline,
    note: seed.weeklyCycle.note,
    officialLineupLabel: seed.weeklyCycle.officialLineupLabel,
    phase: seed.weeklyCycle.phase,
    phaseLabel: seed.weeklyCycle.phaseLabel,
    predictionOutcome,
    summary: seed.weeklyCycle.summary,
  };
}

function buildFallbackWeeklyCycle(team: FantasyTeam | null): FantasyWeeklyCycle {
  return {
    countdown: {
      isUrgent: false,
      label: 'Cierre de la porra',
      targetIso: buildFutureIsoFromNow(2 * 24 * 60),
    },
    headline: 'Tu plantilla previa será tu porra de viernes',
    note: 'Primero defines tus 4 titulares en plantilla. Esa elección se comparará con la alineación oficial del viernes.',
    officialLineupLabel: null,
    phase: 'prediction-open',
    phaseLabel: 'Haz tu porra',
    predictionOutcome: team
      ? {
          bonusPoints: 0,
          confirmedStarterPlayerIds: [],
          hitPlayerIds: [],
          hits: 0,
          lockedMessage:
            'Tu bonus se calculará cuando se publiquen las alineaciones oficiales del viernes.',
          sundayChangeNote: null,
        }
      : null,
    summary:
      'Deja tu cuarteto y capitán antes del viernes. Después podrás editar el equipo, pero el bonus de porra ya no cambiará.',
  };
}

function buildFantasyPredictionOutcome(
  seed: FantasyHomePrimaryLeagueSeed,
  team: FantasyTeam | null,
): FantasyPredictionOutcome | null {
  if (!team) {
    return null;
  }

  const confirmedStarterPlayerIds = [...seed.weeklyCycle.confirmedStarterPlayerIds];
  const resolvedOutcome = resolveFantasyPredictionOutcome(
    team.submittedStarterPlayerIds,
    confirmedStarterPlayerIds,
  );

  return {
    bonusPoints: resolvedOutcome.bonusPoints,
    confirmedStarterPlayerIds,
    hitPlayerIds: resolvedOutcome.hitPlayerIds,
    hits: resolvedOutcome.hits,
    lockedMessage: seed.weeklyCycle.predictionLockedMessage,
    sundayChangeNote: seed.weeklyCycle.sundayChangeNote,
  };
}

function toFantasyWeeklyCountdown(
  countdown: FantasyHomePrimaryLeagueSeed['weeklyCycle']['countdown'] | null,
): FantasyWeeklyCountdown | null {
  if (!countdown) {
    return null;
  }

  return {
    isUrgent: countdown.isUrgent,
    label: countdown.label,
    targetIso: buildFutureIsoFromNow(countdown.minutesFromNow),
  };
}

function buildFutureIsoFromNow(minutesFromNow: number): string {
  return new Date(Date.now() + minutesFromNow * 60_000).toISOString();
}

function buildFantasyLeagueResults(
  dashboard: FantasyLeagueDashboard,
  seed: FantasyLeagueResultsSeed,
): FantasyLeagueResults {
  const ranking = seed.ranking.map<FantasyResultsRankingEntry>((entry) => ({
    rank: entry.rank,
    teamName: entry.teamName,
    managerName: entry.managerName,
    matchdayPoints: entry.matchdayPoints,
    movement: entry.movement,
    isMe: entry.managerName === DEFAULT_FANTASY_MANAGER_NAME,
  }));
  const myRankingEntry = ranking.find((entry) => entry.isMe) ?? ranking[0];
  const captain = resolvePlayerById(dashboard.players, seed.captainPlayerId);
  const predictionOutcome = dashboard.weeklyCycle.predictionOutcome;
  const predictionBonusPoints = predictionOutcome?.bonusPoints ?? 0;
  const predictionHits = predictionOutcome?.hits ?? 0;

  return {
    league: {
      ...dashboard.league,
      myRank: myRankingEntry?.rank ?? dashboard.league.myRank,
    },
    weekLabel: seed.weekLabel,
    headline: seed.headline,
    summary: seed.summary,
    myTeamName: dashboard.myTeam?.name ?? EMPTY_FANTASY_TEAM_LABEL,
    myRank: myRankingEntry?.rank ?? dashboard.league.myRank,
    previousRank: seed.previousRank,
    matchdayPoints: seed.matchdayPoints,
    predictionBonusPoints,
    predictionHits,
    predictionLockedMessage: seed.predictionLockedMessage,
    sundayChangeNote: seed.sundayChangeNote,
    totalPoints: seed.matchdayPoints + predictionBonusPoints,
    captainPlayerId: seed.captainPlayerId,
    captainName: captain?.name ?? null,
    captainPoints: seed.captainPoints,
    ranking,
    playerLines: buildFantasyResultsPlayerLines(dashboard, seed),
    awards: seed.awards.map((award) => ({ ...award })),
    rivalComparisons: seed.rivalComparisons.map((comparison) => ({ ...comparison })),
    marketSections: seed.marketSections.map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description,
      movers: section.movers.map((mover) => toFantasyMarketMoverFromSeed(dashboard.players, mover)),
    })),
  };
}

function buildFantasyResultsPlayerLines(
  dashboard: FantasyLeagueDashboard,
  seed: FantasyLeagueResultsSeed,
): readonly FantasyResultsPlayerLine[] {
  const seedLinesByPlayerId = new Map(
    seed.playerLines.map((playerLine) => [playerLine.playerId, playerLine] as const),
  );

  return (dashboard.myTeam?.players ?? [])
    .map((teamPlayer) => {
      const player = resolvePlayerById(dashboard.players, teamPlayer.playerId);

      if (!player) {
        return null;
      }

      const seededLine = seedLinesByPlayerId.get(teamPlayer.playerId);

      return {
        playerId: player.id,
        name: player.name,
        avatar: player.avatar,
        photoPath: player.photoPath,
        teamName: player.teamName,
        teamLogoPath: player.teamLogoPath,
        points: seededLine?.points ?? 0,
        isCaptain: teamPlayer.isCaptain,
        priceChange: seededLine?.priceChange ?? player.price - player.previousPrice,
      } satisfies FantasyResultsPlayerLine;
    })
    .filter((playerLine): playerLine is FantasyResultsPlayerLine => playerLine !== null);
}

function toFantasyMarketMoverFromSeed(
  players: readonly FantasyPlayer[],
  mover: FantasyHomePrimaryLeagueSeed['marketSections'][number]['movers'][number],
): FantasyMarketMover {
  const player = resolvePlayerById(players, mover.playerId);

  if (!player) {
    return {
      playerId: mover.playerId,
      name: mover.playerId,
      avatar: mover.playerId.slice(0, 2).toUpperCase(),
      photoPath: null,
      teamName: 'Equipo pendiente',
      teamLogoPath: null,
      currentPrice: mover.currentPrice ?? 0,
      priceChange: mover.priceChange,
      recentPoints: [...mover.recentPoints],
    };
  }

  return {
    playerId: player.id,
    name: player.name,
    avatar: player.avatar,
    photoPath: player.photoPath,
    teamName: player.teamName,
    teamLogoPath: player.teamLogoPath,
    currentPrice: mover.currentPrice ?? player.price,
    priceChange: mover.priceChange,
    recentPoints: [...mover.recentPoints],
  };
}

function toFantasyMarketMoverFromPlayer(
  player: FantasyPlayer,
  recentPoints: readonly number[],
): FantasyMarketMover {
  return {
    playerId: player.id,
    name: player.name,
    avatar: player.avatar,
    photoPath: player.photoPath,
    teamName: player.teamName,
    teamLogoPath: player.teamLogoPath,
    currentPrice: player.price,
    priceChange: player.price - player.previousPrice,
    recentPoints: [...recentPoints],
  };
}

function buildFallbackFantasyFeed(
  dashboard: FantasyLeagueDashboard,
): readonly FantasyWeeklyFeedEntry[] {
  const teamPlayers = dashboard.myTeam?.players.length ?? 0;

  return [
    {
      id: `${dashboard.league.id}-feed-1`,
      type: 'market',
      actorName: 'Mercado fantasy',
      headline: 'El mercado sigue siendo el mejor sitio para ganar ventaja.',
      detail:
        'Aún no hay live, así que la diferencia sale del valor y de llegar mejor ajustado al cierre.',
      accentLabel: 'Mercado',
      relativeTimeLabel: 'Ahora',
    },
    {
      id: `${dashboard.league.id}-feed-2`,
      type: 'ranking',
      actorName: dashboard.myTeam?.name ?? EMPTY_FANTASY_TEAM_LABEL,
      headline: `Tu equipo tiene ${teamPlayers}/6 piezas cerradas.`,
      detail:
        'Cada hueco libre te condiciona el siguiente cierre semanal y la lectura del ranking.',
      accentLabel: 'Equipo',
      relativeTimeLabel: 'Hace 20 min',
    },
  ];
}

function buildFallbackRecentPoints(seedIndex: number, isAggressive: boolean): readonly number[] {
  const baseValue = isAggressive ? 5 : 3;

  return [baseValue + seedIndex, baseValue + seedIndex + 1, baseValue + seedIndex + 2];
}

function resolvePlayerById(
  players: readonly FantasyPlayer[],
  playerId: string | null,
): FantasyPlayer | null {
  if (!playerId) {
    return null;
  }

  return players.find((player) => player.id === playerId) ?? null;
}

function synchronizeDashboardWeeklyCycle(
  dashboard: FantasyLeagueDashboard,
): FantasyLeagueDashboard {
  const seed = FANTASY_HOME_PRIMARY_LEAGUE_SEED[dashboard.league.id];

  return {
    ...cloneDashboard(dashboard),
    weeklyCycle: seed
      ? buildSeededWeeklyCycle(seed, dashboard.myTeam)
      : buildFallbackWeeklyCycle(dashboard.myTeam),
  };
}

function resolveSubmittedStarterIds(
  phase: FantasyWeeklyCycle['phase'],
  currentSubmittedStarterIds: readonly string[],
  nextStarterIds: readonly string[],
): readonly string[] {
  return phase === 'prediction-open' || currentSubmittedStarterIds.length === 0
    ? [...nextStarterIds]
    : [...currentSubmittedStarterIds];
}

function resolveSubmittedCaptainId(
  phase: FantasyWeeklyCycle['phase'],
  currentSubmittedCaptainId: string | null,
  nextCaptainId: string | null,
): string | null {
  return phase === 'prediction-open' || currentSubmittedCaptainId === null
    ? nextCaptainId
    : currentSubmittedCaptainId;
}

function cloneDashboard(dashboard: FantasyLeagueDashboard): FantasyLeagueDashboard {
  return {
    ...dashboard,
    league: { ...dashboard.league },
    myTeam: dashboard.myTeam ? cloneTeam(dashboard.myTeam) : null,
    teams: dashboard.teams.map((team) => cloneTeam(team)),
    ranking: dashboard.ranking.map((entry) => ({ ...entry })),
    players: dashboard.players.map((player) => ({ ...player })),
    weeklyCycle: cloneWeeklyCycle(dashboard.weeklyCycle),
  };
}

function cloneWeeklyCycle(weeklyCycle: FantasyWeeklyCycle): FantasyWeeklyCycle {
  return {
    ...weeklyCycle,
    countdown: weeklyCycle.countdown ? { ...weeklyCycle.countdown } : null,
    predictionOutcome: weeklyCycle.predictionOutcome
      ? {
          ...weeklyCycle.predictionOutcome,
          confirmedStarterPlayerIds: [...weeklyCycle.predictionOutcome.confirmedStarterPlayerIds],
          hitPlayerIds: [...weeklyCycle.predictionOutcome.hitPlayerIds],
        }
      : null,
  };
}

function cloneTeam(team: FantasyTeam): FantasyTeam {
  return {
    ...team,
    submittedStarterPlayerIds: [...team.submittedStarterPlayerIds],
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

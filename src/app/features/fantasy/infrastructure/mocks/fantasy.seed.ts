import {
  type FantasyLeague,
  type FantasyLeagueDashboard,
  type FantasyLeaguePhase,
  type FantasyPlayer,
  type FantasyRankingEntry,
  type FantasyTeam,
  type FantasyWeeklyCycle,
} from '@features/fantasy/domain/entities/fantasy.models';
import { FANTASY_TEAM_INITIAL_BUDGET } from '@features/fantasy/domain/services/build-fantasy-team-draft';

import { buildFantasyPreseasonPlayerPool } from './build-fantasy-preseason-player-pool';
import { FANTASY_HOME_PRIMARY_LEAGUE_SEED } from './fantasy-weekly.seed';

interface LeagueSeedConfig {
  readonly code: string;
  readonly id: string;
  readonly memberCount: number;
  readonly name: string;
  readonly phase?: FantasyLeaguePhase;
  readonly teams: readonly TeamSeedConfig[];
}

interface TeamSeedConfig {
  readonly captainId: string;
  readonly id: string;
  readonly isMe: boolean;
  readonly matchdayPoints?: number;
  readonly managerName: string;
  readonly name: string;
  readonly selectedPlayerIds: readonly string[];
  readonly totalPoints?: number;
}

const fantasyPlayers = buildFantasyPreseasonPlayerPool();
const fantasyPlayersById = new Map(fantasyPlayers.map((player) => [player.id, player] as const));
const preseasonPhase: FantasyLeaguePhase = 'preseason';

const leagueSeedConfigs: readonly LeagueSeedConfig[] = [
  {
    id: 'league-1',
    name: 'Amigos del curro',
    code: 'CURRO26',
    memberCount: 8,
    phase: 'market-open',
    teams: [
      {
        id: 'team-league-1',
        isMe: true,
        managerName: 'Vicent',
        name: 'Previa Imperial',
        captainId: 'thormentadores-player-1',
        matchdayPoints: 42,
        selectedPlayerIds: [
          'kings-of-favar-player-1',
          'thormentadores-player-1',
          'magic-city-player-1',
          'barbaridad-player-2',
          'titanics-player-4',
          'sin-equipo-player-1',
        ],
        totalPoints: 186,
      },
      {
        id: 'league-1-rival-1',
        isMe: false,
        managerName: 'Lucía',
        name: 'Drive de Oficina',
        captainId: 'titanics-player-1',
        matchdayPoints: 35,
        selectedPlayerIds: [
          'kings-of-favar-player-2',
          'thormentadores-player-2',
          'titanics-player-1',
          'titanics-player-5',
          'barbaridad-player-1',
          'sin-equipo-player-2',
        ],
        totalPoints: 181,
      },
      {
        id: 'league-1-rival-2',
        isMe: false,
        managerName: 'Marta',
        name: 'Cristal Team',
        captainId: 'kings-of-favar-player-3',
        matchdayPoints: 44,
        selectedPlayerIds: [
          'kings-of-favar-player-3',
          'thormentadores-player-3',
          'titanics-player-2',
          'titanics-player-6',
          'titanics-player-10',
          'sin-equipo-player-3',
        ],
        totalPoints: 191,
      },
      {
        id: 'league-1-rival-3',
        isMe: false,
        managerName: 'Carlos',
        name: 'Rivales del Viernes',
        captainId: 'kings-of-favar-player-4',
        matchdayPoints: 38,
        selectedPlayerIds: [
          'kings-of-favar-player-4',
          'thormentadores-player-4',
          'titanics-player-3',
          'titanics-player-7',
          'titanics-player-11',
          'sin-equipo-player-4',
        ],
        totalPoints: 188,
      },
      {
        id: 'league-1-rival-4',
        isMe: false,
        managerName: 'Nora',
        name: 'La Bandeja Club',
        captainId: 'magic-city-player-2',
        matchdayPoints: 31,
        selectedPlayerIds: [
          'magic-city-player-2',
          'thormentadores-player-5',
          'thormentadores-player-6',
          'titanics-player-8',
          'titanics-player-9',
          'barbaridad-player-3',
        ],
        totalPoints: 175,
      },
    ],
  },
  {
    id: 'league-2',
    name: 'Colegas pádel',
    code: 'PALA26',
    memberCount: 12,
    phase: 'market-open',
    teams: [
      {
        id: 'team-league-2',
        isMe: true,
        managerName: 'Vicent',
        name: 'Mercado Fino',
        captainId: 'titanics-player-1',
        matchdayPoints: 40,
        selectedPlayerIds: [
          'titanics-player-1',
          'kings-of-favar-player-2',
          'thormentadores-player-2',
          'barbaridad-player-1',
          'magic-city-player-2',
          'sin-equipo-player-2',
        ],
        totalPoints: 198,
      },
      {
        id: 'league-2-rival-1',
        isMe: false,
        managerName: 'Ana',
        name: 'Bandeja Táctica',
        captainId: 'kings-of-favar-player-1',
        matchdayPoints: 43,
        selectedPlayerIds: [
          'kings-of-favar-player-1',
          'thormentadores-player-1',
          'magic-city-player-1',
          'barbaridad-player-2',
          'titanics-player-4',
          'sin-equipo-player-1',
        ],
        totalPoints: 204,
      },
      {
        id: 'league-2-rival-2',
        isMe: false,
        managerName: 'Joan',
        name: 'Líderes del Cristal',
        captainId: 'kings-of-favar-player-3',
        matchdayPoints: 41,
        selectedPlayerIds: [
          'kings-of-favar-player-3',
          'thormentadores-player-3',
          'titanics-player-2',
          'titanics-player-6',
          'titanics-player-10',
          'sin-equipo-player-3',
        ],
        totalPoints: 201,
      },
      {
        id: 'league-2-rival-3',
        isMe: false,
        managerName: 'Pablo',
        name: 'Ritmo de Liga',
        captainId: 'kings-of-favar-player-4',
        matchdayPoints: 36,
        selectedPlayerIds: [
          'kings-of-favar-player-4',
          'thormentadores-player-4',
          'titanics-player-3',
          'titanics-player-7',
          'titanics-player-11',
          'sin-equipo-player-4',
        ],
        totalPoints: 194,
      },
      {
        id: 'league-2-rival-4',
        isMe: false,
        managerName: 'Sergio',
        name: 'Globo Largo',
        captainId: 'thormentadores-player-5',
        matchdayPoints: 34,
        selectedPlayerIds: [
          'magic-city-player-2',
          'thormentadores-player-5',
          'thormentadores-player-6',
          'titanics-player-5',
          'titanics-player-8',
          'barbaridad-player-3',
        ],
        totalPoints: 190,
      },
    ],
  },
  {
    id: 'league-3',
    name: 'Global',
    code: 'GLOBAL26',
    memberCount: 24,
    phase: 'market-open',
    teams: [
      {
        id: 'team-league-3',
        isMe: true,
        managerName: 'Vicent',
        name: 'Draft de Domingo',
        captainId: 'kings-of-favar-player-3',
        matchdayPoints: 39,
        selectedPlayerIds: [
          'kings-of-favar-player-3',
          'thormentadores-player-3',
          'titanics-player-2',
          'barbaridad-player-3',
          'magic-city-player-1',
          'sin-equipo-player-3',
        ],
        totalPoints: 209,
      },
      {
        id: 'league-3-rival-1',
        isMe: false,
        managerName: 'Eva',
        name: 'Pared de Fondo',
        captainId: 'kings-of-favar-player-1',
        matchdayPoints: 44,
        selectedPlayerIds: [
          'kings-of-favar-player-1',
          'thormentadores-player-1',
          'titanics-player-1',
          'titanics-player-5',
          'barbaridad-player-1',
          'sin-equipo-player-1',
        ],
        totalPoints: 214,
      },
      {
        id: 'league-3-rival-2',
        isMe: false,
        managerName: 'Toni',
        name: 'Seis en Caja',
        captainId: 'kings-of-favar-player-2',
        matchdayPoints: 42,
        selectedPlayerIds: [
          'kings-of-favar-player-2',
          'thormentadores-player-2',
          'titanics-player-4',
          'titanics-player-6',
          'barbaridad-player-2',
          'sin-equipo-player-2',
        ],
        totalPoints: 211,
      },
      {
        id: 'league-3-rival-3',
        isMe: false,
        managerName: 'Andrea',
        name: 'Presión Alta',
        captainId: 'kings-of-favar-player-4',
        matchdayPoints: 37,
        selectedPlayerIds: [
          'kings-of-favar-player-4',
          'thormentadores-player-4',
          'titanics-player-3',
          'titanics-player-7',
          'titanics-player-10',
          'sin-equipo-player-4',
        ],
        totalPoints: 205,
      },
      {
        id: 'league-3-rival-4',
        isMe: false,
        managerName: 'Javi',
        name: 'Cierre Perfecto',
        captainId: 'magic-city-player-2',
        matchdayPoints: 35,
        selectedPlayerIds: [
          'magic-city-player-2',
          'thormentadores-player-5',
          'thormentadores-player-6',
          'titanics-player-8',
          'titanics-player-9',
          'titanics-player-11',
        ],
        totalPoints: 202,
      },
    ],
  },
];

export const FANTASY_DASHBOARD_BY_LEAGUE_SEED = Object.fromEntries(
  leagueSeedConfigs.map((config) => {
    const dashboard = buildFantasyLeagueDashboard(config);

    return [config.id, dashboard] as const;
  }),
) as Record<string, FantasyLeagueDashboard>;

export const FANTASY_LEAGUES_SEED: readonly FantasyLeague[] = Object.values(
  FANTASY_DASHBOARD_BY_LEAGUE_SEED,
).map((dashboard) => dashboard.league);

export const FANTASY_PLAYERS_SEED = fantasyPlayers;

function buildFantasyLeagueDashboard(config: LeagueSeedConfig): FantasyLeagueDashboard {
  const teams = config.teams.map((teamConfig) => buildFantasyTeam(config.id, teamConfig));
  const myTeam = teams.find((team) => team.id === `team-${config.id}`) ?? null;
  const ranking = buildFantasyRanking(teams);
  const myRankingEntry = ranking.find((entry) => entry.isMe);

  const league: FantasyLeague = {
    id: config.id,
    name: config.name,
    code: config.code,
    memberCount: config.memberCount,
    myRank: myRankingEntry?.rank ?? ranking.length,
    myPoints: myRankingEntry?.totalPoints ?? 0,
    phase: config.phase ?? preseasonPhase,
  };

  return {
    league,
    myTeam,
    teams,
    ranking,
    players: fantasyPlayers,
    marketLocked: false,
    weeklyCycle: buildFantasyWeeklyCycle(config.id),
  };
}

function buildFantasyTeam(leagueId: string, config: TeamSeedConfig): FantasyTeam {
  const selectedPlayers = config.selectedPlayerIds
    .map((playerId) => fantasyPlayersById.get(playerId))
    .filter(isFantasyPlayer);
  const teamValue = selectedPlayers.reduce((total, player) => total + player.price, 0);

  return {
    id: config.id,
    leagueId,
    managerName: config.managerName,
    name: config.name,
    budgetRemaining: Math.max(0, FANTASY_TEAM_INITIAL_BUDGET - teamValue),
    teamValue,
    totalPoints:
      config.totalPoints ?? calculateSeedTeamPoints(selectedPlayers, config.captainId, 'total'),
    matchdayPoints:
      config.matchdayPoints ??
      calculateSeedTeamPoints(selectedPlayers, config.captainId, 'matchday'),
    submittedCaptainId: config.captainId,
    submittedStarterPlayerIds: config.selectedPlayerIds.slice(0, 4),
    players: config.selectedPlayerIds.map((playerId, index) => ({
      playerId,
      isStarter: index < 4,
      isCaptain: playerId === config.captainId,
    })),
  };
}

function buildFantasyRanking(teams: readonly FantasyTeam[]): readonly FantasyRankingEntry[] {
  const hasCompetitivePoints = teams.some(
    (team) => team.totalPoints > 0 || team.matchdayPoints > 0,
  );

  return [...teams]
    .sort((leftTeam, rightTeam) => {
      if (hasCompetitivePoints) {
        if (rightTeam.totalPoints !== leftTeam.totalPoints) {
          return rightTeam.totalPoints - leftTeam.totalPoints;
        }

        if (rightTeam.matchdayPoints !== leftTeam.matchdayPoints) {
          return rightTeam.matchdayPoints - leftTeam.matchdayPoints;
        }
      }

      if (rightTeam.teamValue !== leftTeam.teamValue) {
        return rightTeam.teamValue - leftTeam.teamValue;
      }

      return leftTeam.name.localeCompare(rightTeam.name, 'es');
    })
    .map((team, index) => ({
      rank: index + 1,
      teamId: team.id,
      teamName: team.name,
      managerName: team.managerName,
      totalPoints: team.totalPoints,
      matchdayPoints: team.matchdayPoints,
      teamValue: team.teamValue,
      isMe: team.id.startsWith('team-league-'),
    }));
}

function isFantasyPlayer(player: FantasyPlayer | undefined): player is FantasyPlayer {
  return player !== undefined;
}

function calculateSeedTeamPoints(
  selectedPlayers: readonly FantasyPlayer[],
  captainId: string,
  type: 'matchday' | 'total',
): number {
  const starters = selectedPlayers.slice(0, 4);

  const basePoints = starters.reduce((total, player) => {
    return total + (type === 'total' ? player.pointsTotal : player.pointsMatchday);
  }, 0);

  const captain = starters.find((player) => player.id === captainId);

  return (
    basePoints + (captain ? (type === 'total' ? captain.pointsTotal : captain.pointsMatchday) : 0)
  );
}

function buildFantasyWeeklyCycle(leagueId: string): FantasyWeeklyCycle {
  const seededCycle = FANTASY_HOME_PRIMARY_LEAGUE_SEED[leagueId]?.weeklyCycle;

  if (!seededCycle) {
    return {
      countdown: null,
      headline: 'Plantilla en preparación',
      note: 'La jornada todavía no ha abierto la fase competitiva.',
      officialLineupLabel: null,
      phase: 'prediction-open',
      phaseLabel: 'Plantilla abierta',
      predictionOutcome: null,
      summary: 'Deja lista tu predicción desde plantilla antes de que lleguen las alineaciones.',
    };
  }

  return {
    countdown: seededCycle.countdown
      ? {
          isUrgent: seededCycle.countdown.isUrgent,
          label: seededCycle.countdown.label,
          targetIso: null,
        }
      : null,
    headline: seededCycle.headline,
    note: seededCycle.note,
    officialLineupLabel: seededCycle.officialLineupLabel,
    phase: seededCycle.phase,
    phaseLabel: seededCycle.phaseLabel,
    predictionOutcome: null,
    summary: seededCycle.summary,
  };
}

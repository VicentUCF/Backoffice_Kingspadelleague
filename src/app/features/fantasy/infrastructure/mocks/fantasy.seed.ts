import {
  type FantasyLeague,
  type FantasyLeagueDashboard,
  type FantasyLeaguePhase,
  type FantasyPlayer,
  type FantasyRankingEntry,
  type FantasyTeam,
} from '@features/fantasy/domain/entities/fantasy.models';
import { FANTASY_TEAM_INITIAL_BUDGET } from '@features/fantasy/domain/services/build-fantasy-team-draft';

import { buildFantasyPreseasonPlayerPool } from './build-fantasy-preseason-player-pool';

interface LeagueSeedConfig {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly memberCount: number;
  readonly myManagerName: string;
  readonly myTeamName: string;
  readonly captainId: string;
  readonly selectedPlayerIds: readonly string[];
  readonly rankingOpponents: readonly RankingSeedInput[];
}

interface RankingSeedInput {
  readonly teamName: string;
  readonly managerName: string;
  readonly teamValue: number;
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
    myManagerName: 'Vicent',
    myTeamName: 'Previa Imperial',
    captainId: 'thormentadores-player-1',
    selectedPlayerIds: [
      'kings-of-favar-player-1',
      'thormentadores-player-1',
      'magic-city-player-1',
      'barbaridad-player-2',
      'titanics-player-4',
      'sin-equipo-player-1',
    ],
    rankingOpponents: [
      { teamName: 'Drive de Oficina', managerName: 'Lucía', teamValue: 80_950_000 },
      { teamName: 'Cristal Team', managerName: 'Marta', teamValue: 78_200_000 },
      { teamName: 'Rivales del Viernes', managerName: 'Carlos', teamValue: 76_650_000 },
      { teamName: 'La Bandeja Club', managerName: 'Nora', teamValue: 74_900_000 },
    ],
  },
  {
    id: 'league-2',
    name: 'Colegas pádel',
    code: 'PALA26',
    memberCount: 12,
    myManagerName: 'Vicent',
    myTeamName: 'Mercado Fino',
    captainId: 'titanics-player-1',
    selectedPlayerIds: [
      'titanics-player-1',
      'kings-of-favar-player-2',
      'thormentadores-player-2',
      'barbaridad-player-1',
      'magic-city-player-2',
      'sin-equipo-player-2',
    ],
    rankingOpponents: [
      { teamName: 'Bandeja Táctica', managerName: 'Ana', teamValue: 79_300_000 },
      { teamName: 'Líderes del Cristal', managerName: 'Joan', teamValue: 77_700_000 },
      { teamName: 'Ritmo de Liga', managerName: 'Pablo', teamValue: 75_950_000 },
      { teamName: 'Globo Largo', managerName: 'Sergio', teamValue: 72_800_000 },
    ],
  },
  {
    id: 'league-3',
    name: 'Global',
    code: 'GLOBAL26',
    memberCount: 24,
    myManagerName: 'Vicent',
    myTeamName: 'Draft de Domingo',
    captainId: 'kings-of-favar-player-3',
    selectedPlayerIds: [
      'kings-of-favar-player-3',
      'thormentadores-player-3',
      'titanics-player-2',
      'barbaridad-player-3',
      'magic-city-player-1',
      'sin-equipo-player-3',
    ],
    rankingOpponents: [
      { teamName: 'Pared de Fondo', managerName: 'Eva', teamValue: 82_150_000 },
      { teamName: 'Seis en Caja', managerName: 'Toni', teamValue: 80_800_000 },
      { teamName: 'Presión Alta', managerName: 'Andrea', teamValue: 79_450_000 },
      { teamName: 'Cierre Perfecto', managerName: 'Javi', teamValue: 76_900_000 },
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
  const myTeam = buildFantasyTeam(
    config.id,
    config.myTeamName,
    config.selectedPlayerIds,
    config.captainId,
  );
  const ranking = buildFantasyRanking(config, myTeam);
  const myRankingEntry = ranking.find((entry) => entry.isMe);

  const league: FantasyLeague = {
    id: config.id,
    name: config.name,
    code: config.code,
    memberCount: config.memberCount,
    myRank: myRankingEntry?.rank ?? ranking.length,
    myPoints: myRankingEntry?.totalPoints ?? 0,
    phase: preseasonPhase,
  };

  return {
    league,
    myTeam,
    ranking,
    players: fantasyPlayers,
    marketLocked: false,
  };
}

function buildFantasyTeam(
  leagueId: string,
  teamName: string,
  selectedPlayerIds: readonly string[],
  captainId: string,
): FantasyTeam {
  const selectedPlayers = selectedPlayerIds
    .map((playerId) => fantasyPlayersById.get(playerId))
    .filter(isFantasyPlayer);
  const teamValue = selectedPlayers.reduce((total, player) => total + player.price, 0);

  return {
    id: `team-${leagueId}`,
    leagueId,
    name: teamName,
    budgetRemaining: Math.max(0, FANTASY_TEAM_INITIAL_BUDGET - teamValue),
    teamValue,
    totalPoints: 0,
    matchdayPoints: 0,
    players: selectedPlayerIds.map((playerId, index) => ({
      playerId,
      isStarter: index < 4,
      isCaptain: playerId === captainId,
    })),
  };
}

function buildFantasyRanking(
  config: LeagueSeedConfig,
  myTeam: FantasyTeam,
): readonly FantasyRankingEntry[] {
  return [
    ...config.rankingOpponents.map((entry) => ({
      ...entry,
      totalPoints: 0,
      matchdayPoints: 0,
      isMe: false,
    })),
    {
      teamName: myTeam.name,
      managerName: config.myManagerName,
      teamValue: myTeam.teamValue,
      totalPoints: 0,
      matchdayPoints: 0,
      isMe: true,
    },
  ]
    .sort((leftEntry, rightEntry) => {
      if (rightEntry.teamValue !== leftEntry.teamValue) {
        return rightEntry.teamValue - leftEntry.teamValue;
      }

      return leftEntry.teamName.localeCompare(rightEntry.teamName, 'es');
    })
    .map((entry, index) => ({
      rank: index + 1,
      teamName: entry.teamName,
      managerName: entry.managerName,
      totalPoints: entry.totalPoints,
      matchdayPoints: entry.matchdayPoints,
      teamValue: entry.teamValue,
      isMe: entry.isMe,
    }));
}

function isFantasyPlayer(player: FantasyPlayer | undefined): player is FantasyPlayer {
  return player !== undefined;
}

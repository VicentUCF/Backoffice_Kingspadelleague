import {
  type FantasyLeague,
  type FantasyLeagueDashboard,
  type FantasyPlayer,
  type FantasyRankingEntry,
  type FantasyTeam,
} from '@features/fantasy/domain/entities/fantasy.models';

export function createFantasyLeague(overrides: Partial<FantasyLeague> = {}): FantasyLeague {
  return {
    id: 'league-1',
    name: 'Amigos del curro',
    code: 'CURRO26',
    memberCount: 8,
    myRank: 1,
    myPoints: 0,
    phase: 'preseason',
    ...overrides,
  };
}

export function createFantasyPlayer(overrides: Partial<FantasyPlayer> = {}): FantasyPlayer {
  return {
    id: 'kings-of-favar-player-1',
    slug: 'vicent-ciscar',
    name: 'Vicent Ciscar',
    avatar: 'VC',
    photoPath: '/stock_players/player-01.svg',
    teamId: 'kings-of-favar',
    teamName: 'Kings Of Favar',
    teamLogoPath: '/teams_logos/Kings_of_Favar_no_bg.png',
    side: 'ambas',
    sideLabel: 'Ambas',
    roleLabel: 'Presidente',
    scoutingNote:
      'Vicent Ciscar lidera Kings Of Favar y parte como una de las referencias más seguras para abrir la pretemporada fantasy.',
    price: 15_400_000,
    previousPrice: 15_200_000,
    pointsMatchday: 0,
    pointsTotal: 0,
    ...overrides,
  };
}

export function createFantasyRankingEntry(
  overrides: Partial<FantasyRankingEntry> = {},
): FantasyRankingEntry {
  return {
    rank: 1,
    teamName: 'Previa Imperial',
    managerName: 'Vicent',
    totalPoints: 0,
    matchdayPoints: 0,
    teamValue: 86_150_000,
    isMe: true,
    ...overrides,
  };
}

export function createFantasyTeam(overrides: Partial<FantasyTeam> = {}): FantasyTeam {
  return {
    id: 'team-league-1',
    leagueId: 'league-1',
    name: 'Previa Imperial',
    budgetRemaining: 13_850_000,
    teamValue: 86_150_000,
    totalPoints: 0,
    matchdayPoints: 0,
    players: [],
    ...overrides,
  };
}

export function createFantasyLeagueDashboard(
  overrides: Partial<FantasyLeagueDashboard> = {},
): FantasyLeagueDashboard {
  return {
    league: createFantasyLeague(),
    myTeam: null,
    ranking: [createFantasyRankingEntry()],
    players: [createFantasyPlayer()],
    marketLocked: false,
    ...overrides,
  };
}

import {
  type FantasyLeague,
  type FantasyLeagueDashboard,
  type FantasyPlayer,
  type FantasyRankingEntry,
  type FantasyTeam,
} from '@features/fantasy/domain/entities/fantasy.models';

const fantasyPlayers: readonly FantasyPlayer[] = [
  {
    id: 'fp-1',
    name: 'Ale Ruiz',
    avatar: 'AR',
    teamName: 'Málaga Smash',
    price: 24000000,
    previousPrice: 23500000,
    pointsMatchday: 14,
    pointsTotal: 182,
  },
  {
    id: 'fp-2',
    name: 'Bea González',
    avatar: 'BG',
    teamName: 'Costa Sol Pádel',
    price: 26000000,
    previousPrice: 26200000,
    pointsMatchday: 12,
    pointsTotal: 190,
  },
  {
    id: 'fp-3',
    name: 'Arturo Coello',
    avatar: 'AC',
    teamName: 'Valladolid Kings',
    price: 28000000,
    previousPrice: 27700000,
    pointsMatchday: 16,
    pointsTotal: 210,
  },
  {
    id: 'fp-4',
    name: 'Paula Josemaría',
    avatar: 'PJ',
    teamName: 'Extremadura Volley',
    price: 27000000,
    previousPrice: 26400000,
    pointsMatchday: 16,
    pointsTotal: 205,
  },
  {
    id: 'fp-5',
    name: 'Juan Lebrón',
    avatar: 'JL',
    teamName: 'Cádiz Viboras',
    price: 22000000,
    previousPrice: 22500000,
    pointsMatchday: 9,
    pointsTotal: 165,
  },
  {
    id: 'fp-6',
    name: 'Martín Di Nenno',
    avatar: 'MD',
    teamName: 'Buenos Aires Drive',
    price: 25000000,
    previousPrice: 24700000,
    pointsMatchday: 11,
    pointsTotal: 174,
  },
  {
    id: 'fp-7',
    name: 'Gemma Triay',
    avatar: 'GT',
    teamName: 'Menorca Rackets',
    price: 23500000,
    previousPrice: 23100000,
    pointsMatchday: 10,
    pointsTotal: 170,
  },
  {
    id: 'fp-8',
    name: 'Agustín Tapia',
    avatar: 'AT',
    teamName: 'Catamarca Smash',
    price: 29000000,
    previousPrice: 28600000,
    pointsMatchday: 15,
    pointsTotal: 214,
  },
];

const leagueOne: FantasyLeague = {
  id: 'league-1',
  name: 'Amigos del curro',
  code: 'CURRO24',
  memberCount: 8,
  myRank: 2,
  myPoints: 542,
};
const leagueTwo: FantasyLeague = {
  id: 'league-2',
  name: 'Colegas pádel',
  code: 'COLEGAS',
  memberCount: 12,
  myRank: 5,
  myPoints: 490,
};
const leagueThree: FantasyLeague = {
  id: 'league-3',
  name: 'Global',
  code: 'GLOBALX',
  memberCount: 86,
  myRank: 24,
  myPoints: 451,
};

const myTeamByLeague = (leagueId: string, name: string): FantasyTeam => ({
  id: `team-${leagueId}`,
  leagueId,
  name,
  budgetRemaining: 8000000,
  teamValue: 92000000,
  totalPoints: 542,
  matchdayPoints: 63,
  players: [
    { playerId: 'fp-1', isStarter: true, isCaptain: false },
    { playerId: 'fp-2', isStarter: true, isCaptain: false },
    { playerId: 'fp-3', isStarter: true, isCaptain: true },
    { playerId: 'fp-4', isStarter: true, isCaptain: false },
    { playerId: 'fp-5', isStarter: false, isCaptain: false },
    { playerId: 'fp-6', isStarter: false, isCaptain: false },
  ],
});

const ranking = (myTeamName: string): readonly FantasyRankingEntry[] => [
  {
    rank: 1,
    teamName: 'Padel Dynasty',
    managerName: 'Lucía',
    totalPoints: 578,
    matchdayPoints: 71,
    teamValue: 98500000,
    isMe: false,
  },
  {
    rank: 2,
    teamName: myTeamName,
    managerName: 'Vicent',
    totalPoints: 542,
    matchdayPoints: 63,
    teamValue: 92000000,
    isMe: true,
  },
  {
    rank: 3,
    teamName: 'Smash Masters',
    managerName: 'Carlos',
    totalPoints: 537,
    matchdayPoints: 60,
    teamValue: 91300000,
    isMe: false,
  },
  {
    rank: 4,
    teamName: 'Viboras Team',
    managerName: 'Marta',
    totalPoints: 511,
    matchdayPoints: 55,
    teamValue: 88000000,
    isMe: false,
  },
  {
    rank: 5,
    teamName: 'Globo Winners',
    managerName: 'Nora',
    totalPoints: 500,
    matchdayPoints: 49,
    teamValue: 86200000,
    isMe: false,
  },
];

export const FANTASY_LEAGUES_SEED: readonly FantasyLeague[] = [leagueOne, leagueTwo, leagueThree];

export const FANTASY_DASHBOARD_BY_LEAGUE_SEED: Record<string, FantasyLeagueDashboard> = {
  'league-1': {
    league: leagueOne,
    myTeam: myTeamByLeague('league-1', 'Smash Masters'),
    ranking: ranking('Smash Masters'),
    players: fantasyPlayers,
    marketLocked: false,
  },
  'league-2': {
    league: leagueTwo,
    myTeam: myTeamByLeague('league-2', 'Viboras Team'),
    ranking: ranking('Viboras Team'),
    players: fantasyPlayers,
    marketLocked: true,
  },
  'league-3': {
    league: leagueThree,
    myTeam: myTeamByLeague('league-3', 'Padel Dynasty'),
    ranking: ranking('Padel Dynasty'),
    players: fantasyPlayers,
    marketLocked: false,
  },
};

export const FANTASY_PLAYERS_SEED = fantasyPlayers;

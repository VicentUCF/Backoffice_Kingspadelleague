import { type FantasyMarketPlayerViewModel } from './fantasy-league-dashboard.viewmodel';

export const ALL_FANTASY_MARKET_TEAMS = 'all-teams';
export const ALL_FANTASY_MARKET_SIDES = 'all-sides';
export const ALL_FANTASY_MARKET_STATUS = 'all-status';

export type FantasyMarketAvailabilityFilter =
  | typeof ALL_FANTASY_MARKET_STATUS
  | 'available'
  | 'free-agent'
  | 'in-team'
  | 'outside-budget';

export type FantasyMarketSideFilter =
  | FantasyMarketPlayerViewModel['side']
  | typeof ALL_FANTASY_MARKET_SIDES;

export type FantasyMarketSort = 'name' | 'price-asc' | 'price-desc' | 'trend';

export interface FantasyMarketFilters {
  readonly query: string;
  readonly side: FantasyMarketSideFilter;
  readonly status: FantasyMarketAvailabilityFilter;
  readonly sortBy: FantasyMarketSort;
  readonly teamId: string;
}

export interface FantasyMarketFilterOption {
  readonly label: string;
  readonly value: string;
}

export const FANTASY_MARKET_SIDE_OPTIONS: readonly FantasyMarketFilterOption[] = [
  { label: 'Todos los lados', value: ALL_FANTASY_MARKET_SIDES },
  { label: 'Derecha', value: 'derecha' },
  { label: 'Revés', value: 'reves' },
  { label: 'Ambas', value: 'ambas' },
];

export const FANTASY_MARKET_STATUS_OPTIONS: readonly FantasyMarketFilterOption[] = [
  { label: 'Todos los estados', value: ALL_FANTASY_MARKET_STATUS },
  { label: 'En mi plantilla', value: 'in-team' },
  { label: 'Disponibles', value: 'available' },
  { label: 'Agentes libres', value: 'free-agent' },
  { label: 'Fuera de presupuesto', value: 'outside-budget' },
];

export const FANTASY_MARKET_SORT_OPTIONS: readonly FantasyMarketFilterOption[] = [
  { label: 'Más caros primero', value: 'price-desc' },
  { label: 'Más baratos primero', value: 'price-asc' },
  { label: 'Mayor subida', value: 'trend' },
  { label: 'Nombre', value: 'name' },
];

export function filterFantasyMarketPlayers(
  players: readonly FantasyMarketPlayerViewModel[],
  filters: FantasyMarketFilters,
): readonly FantasyMarketPlayerViewModel[] {
  const searchTerms = normalize(filters.query).split(/\s+/).filter(Boolean);

  return [...players]
    .filter((player) => {
      if (filters.teamId !== ALL_FANTASY_MARKET_TEAMS && player.teamId !== filters.teamId) {
        return false;
      }

      if (filters.side !== ALL_FANTASY_MARKET_SIDES && player.side !== filters.side) {
        return false;
      }

      if (!matchesStatusFilter(player, filters.status)) {
        return false;
      }

      if (searchTerms.length === 0) {
        return true;
      }

      return searchTerms.every((term) =>
        getSearchableValues(player).some((value) => normalize(value).includes(term)),
      );
    })
    .sort((leftPlayer, rightPlayer) =>
      compareFantasyMarketPlayers(leftPlayer, rightPlayer, filters.sortBy),
    );
}

export function buildFantasyMarketTeamOptions(
  players: readonly Pick<FantasyMarketPlayerViewModel, 'teamId' | 'teamName'>[],
): readonly FantasyMarketFilterOption[] {
  const uniqueTeams = [
    ...new Map(players.map((player) => [player.teamId, player.teamName])).entries(),
  ]
    .sort((leftTeam, rightTeam) => leftTeam[1].localeCompare(rightTeam[1], 'es'))
    .map(([teamId, teamName]) => ({
      label: teamName,
      value: teamId,
    }));

  return [{ label: 'Todos los equipos', value: ALL_FANTASY_MARKET_TEAMS }, ...uniqueTeams];
}

export function coerceFantasyMarketSideFilter(value: string): FantasyMarketSideFilter {
  return FANTASY_MARKET_SIDE_OPTIONS.some((option) => option.value === value)
    ? (value as FantasyMarketSideFilter)
    : ALL_FANTASY_MARKET_SIDES;
}

export function coerceFantasyMarketAvailabilityFilter(
  value: string,
): FantasyMarketAvailabilityFilter {
  return FANTASY_MARKET_STATUS_OPTIONS.some((option) => option.value === value)
    ? (value as FantasyMarketAvailabilityFilter)
    : ALL_FANTASY_MARKET_STATUS;
}

export function coerceFantasyMarketSort(value: string): FantasyMarketSort {
  return FANTASY_MARKET_SORT_OPTIONS.some((option) => option.value === value)
    ? (value as FantasyMarketSort)
    : 'price-desc';
}

function matchesStatusFilter(
  player: FantasyMarketPlayerViewModel,
  status: FantasyMarketAvailabilityFilter,
): boolean {
  switch (status) {
    case 'in-team':
      return player.isInMyTeam;
    case 'available':
      return !player.isInMyTeam && player.canAfford;
    case 'free-agent':
      return player.statusLabel === 'Agente libre';
    case 'outside-budget':
      return !player.isInMyTeam && !player.canAfford;
    default:
      return true;
  }
}

function compareFantasyMarketPlayers(
  leftPlayer: FantasyMarketPlayerViewModel,
  rightPlayer: FantasyMarketPlayerViewModel,
  sortBy: FantasyMarketSort,
): number {
  switch (sortBy) {
    case 'name':
      return leftPlayer.name.localeCompare(rightPlayer.name, 'es');
    case 'price-asc':
      return (
        leftPlayer.priceValue - rightPlayer.priceValue ||
        leftPlayer.name.localeCompare(rightPlayer.name, 'es')
      );
    case 'trend':
      return (
        parseTrendValue(rightPlayer.priceChangeLabel) -
          parseTrendValue(leftPlayer.priceChangeLabel) ||
        rightPlayer.priceValue - leftPlayer.priceValue
      );
    default:
      return (
        rightPlayer.priceValue - leftPlayer.priceValue ||
        leftPlayer.name.localeCompare(rightPlayer.name, 'es')
      );
  }
}

function parseTrendValue(label: string): number {
  const normalizedLabel = normalize(label);

  if (normalizedLabel === 'sin cambios') {
    return 0;
  }

  const numericValue = Number(normalizedLabel.replace(/[^0-9.-]/g, '').replace(',', '.'));

  return Number.isNaN(numericValue) ? 0 : numericValue;
}

function getSearchableValues(player: FantasyMarketPlayerViewModel): readonly string[] {
  return [
    player.name,
    player.teamName,
    player.roleLabel,
    player.sideLabel,
    player.statusLabel,
    player.scoutingNote,
  ];
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

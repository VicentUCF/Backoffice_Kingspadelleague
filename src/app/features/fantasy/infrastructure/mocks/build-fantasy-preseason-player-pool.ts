import {
  UNASSIGNED_PLAYER_TEAM_ID,
  UNASSIGNED_PLAYER_TEAM_NAME,
} from '@features/players/domain/entities/player.entity';
import { type FantasyPlayer } from '@features/fantasy/domain/entities/fantasy.models';
import {
  PUBLIC_LEAGUE_PLAYER_CATALOG,
  PUBLIC_LEAGUE_TEAM_CATALOG,
  type PublicLeaguePlayerCatalogEntry,
} from '@shared/data/public-league-catalog.seed';
import { resolveTeamBranding } from '@shared/utils/team-branding';

interface FantasyTeamCatalogEntry {
  readonly id: string;
  readonly name: string;
  readonly logoPath: string | null;
  readonly presidentName: string;
}

const TEAM_BY_ID = new Map<string, FantasyTeamCatalogEntry>(
  PUBLIC_LEAGUE_TEAM_CATALOG.map((team) => [
    team.id,
    {
      id: team.id,
      name: team.name,
      logoPath: team.logoPath,
      presidentName: team.presidentName,
    },
  ]),
);

export function buildFantasyPreseasonPlayerPool(): readonly FantasyPlayer[] {
  return PUBLIC_LEAGUE_PLAYER_CATALOG.map((player, index) => toFantasyPlayer(player, index));
}

function toFantasyPlayer(player: PublicLeaguePlayerCatalogEntry, index: number): FantasyPlayer {
  const teamId = resolvePlayerTeamId(player.id);
  const team = TEAM_BY_ID.get(teamId);
  const teamName = team?.name ?? UNASSIGNED_PLAYER_TEAM_NAME;
  const teamBranding = resolveTeamBranding({
    teamName,
    teamSlug: teamId,
    fallbackLogoPath: team?.logoPath ?? null,
  });
  const price = resolveFantasyPrice(player, index, team);
  const previousPrice = resolvePreviousPrice(price, index, teamId);
  const pointsTotal = resolveTotalPoints(player, index, team);
  const pointsMatchday = resolveMatchdayPoints(player, index, team);

  return {
    id: player.id,
    slug: player.slug,
    name: player.displayName,
    avatar: toPlayerInitials(player.displayName),
    photoPath: player.photoPath,
    teamId,
    teamName,
    teamLogoPath: teamBranding.logoPath,
    side: player.side,
    sideLabel: player.roleLabel,
    roleLabel: resolveRoleLabel(player, team),
    scoutingNote: resolveScoutingNote(player, team),
    price,
    previousPrice,
    pointsMatchday,
    pointsTotal,
  };
}

function resolvePlayerTeamId(playerId: string): string {
  const teamId = playerId.replace(/-player-\d+$/, '');

  return TEAM_BY_ID.has(teamId) ? teamId : UNASSIGNED_PLAYER_TEAM_ID;
}

function resolveFantasyPrice(
  player: PublicLeaguePlayerCatalogEntry,
  index: number,
  team: FantasyTeamCatalogEntry | undefined,
): number {
  const rosterSlot = resolveRosterSlot(player.id);
  const baseValue = team ? 11_200_000 : 9_800_000;
  const versatilityPremium = player.side === 'ambas' ? 900_000 : 380_000;
  const captainPremium = team?.presidentName === player.displayName ? 1_400_000 : 0;
  const rosterPremium = Math.max(0, 1_900_000 - (rosterSlot - 1) * 170_000);
  const momentumPremium = (index % 4) * 110_000;

  return roundFantasyMoney(
    baseValue + versatilityPremium + captainPremium + rosterPremium + momentumPremium,
  );
}

function resolvePreviousPrice(currentPrice: number, index: number, teamId: string): number {
  if (teamId === UNASSIGNED_PLAYER_TEAM_ID) {
    return currentPrice - 150_000;
  }

  const movementByIndex = [-220_000, 0, 180_000, 320_000, -120_000];
  const currentMovement = movementByIndex[index % movementByIndex.length] ?? 0;

  return currentPrice - currentMovement;
}

function resolveTotalPoints(
  player: PublicLeaguePlayerCatalogEntry,
  index: number,
  team: FantasyTeamCatalogEntry | undefined,
): number {
  const rosterSlot = resolveRosterSlot(player.id);
  const teamBase = team ? 12 : 8;
  const slotBonus = Math.max(0, 6 - Math.min(rosterSlot, 6)) * 3;
  const versatilityBonus = player.side === 'ambas' ? 3 : 1;
  const captainBonus = team?.presidentName === player.displayName ? 5 : 0;
  const momentumBonus = index % 4;

  return teamBase + slotBonus + versatilityBonus + captainBonus + momentumBonus;
}

function resolveMatchdayPoints(
  player: PublicLeaguePlayerCatalogEntry,
  index: number,
  team: FantasyTeamCatalogEntry | undefined,
): number {
  const rosterSlot = resolveRosterSlot(player.id);
  const teamBase = team ? 2 : 1;
  const slotBonus = Math.max(0, 5 - Math.min(rosterSlot, 5));
  const versatilityBonus = player.side === 'ambas' ? 1 : 0;
  const momentumBonus = index % 3;

  return teamBase + slotBonus + versatilityBonus + momentumBonus;
}

function resolveRoleLabel(
  player: PublicLeaguePlayerCatalogEntry,
  team: FantasyTeamCatalogEntry | undefined,
): string {
  if (team?.presidentName === player.displayName) {
    return 'Presidente';
  }

  switch (player.side) {
    case 'derecha':
      return 'Especialista de derecha';
    case 'reves':
      return 'Especialista de revés';
    default:
      return 'Jugador versátil';
  }
}

function resolveScoutingNote(
  player: PublicLeaguePlayerCatalogEntry,
  team: FantasyTeamCatalogEntry | undefined,
): string {
  if (!team) {
    return `${player.displayName} llega como agente libre y puede encajar como rotación flexible para completar plantilla.`;
  }

  if (team.presidentName === player.displayName) {
    return `${player.displayName} lidera ${team.name} y parte como una de las referencias más seguras para abrir la pretemporada fantasy.`;
  }

  if (player.side === 'ambas') {
    return `${player.displayName} aporta flexibilidad táctica y sube enteros en plantillas que quieran cubrir ambos perfiles de juego.`;
  }

  return `${player.displayName} refuerza a ${team.name} como perfil específico de ${player.roleLabel.toLocaleLowerCase('es')}.`;
}

function resolveRosterSlot(playerId: string): number {
  const match = playerId.match(/-player-(\d+)$/);

  return match ? Number(match[1]) : 1;
}

function roundFantasyMoney(value: number): number {
  return Math.round(value / 50_000) * 50_000;
}

function toPlayerInitials(playerName: string): string {
  return playerName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

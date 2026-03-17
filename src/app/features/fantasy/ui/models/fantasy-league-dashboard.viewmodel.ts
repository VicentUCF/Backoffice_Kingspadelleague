import { UNASSIGNED_PLAYER_TEAM_ID } from '@features/players/domain/entities/player.entity';
import {
  type FantasyLeagueDashboard,
  type FantasyLeaguePhase,
  type FantasyPlayer,
  type FantasyRankingEntry,
  type FantasyTeamPlayer,
} from '@features/fantasy/domain/entities/fantasy.models';
import { calculateMatchdayMvp } from '@features/fantasy/domain/services/calculate-matchday-mvp';
import { FANTASY_TEAM_INITIAL_BUDGET } from '@features/fantasy/domain/services/build-fantasy-team-draft';

import {
  formatFantasyMemberCount,
  formatFantasyMoney,
  formatFantasyPoints,
  formatFantasyRank,
  formatFantasySignedMoneyDifference,
} from './fantasy-number.formatter';

export interface FantasySpotlightCardViewModel {
  readonly avatarLabel: string;
  readonly badgeLabel: string;
  readonly name: string;
  readonly photoPath: string | null;
  readonly priceLabel: string;
  readonly supportingLabel: string;
  readonly teamName: string;
  readonly title: string;
}

export interface FantasyRankingEntryViewModel {
  readonly isMe: boolean;
  readonly managerName: string;
  readonly matchdayPointsLabel: string;
  readonly rankLabel: string;
  readonly teamName: string;
  readonly teamValueLabel: string;
  readonly totalPointsLabel: string;
}

export interface FantasyRosterPlayerViewModel {
  readonly avatar: string;
  readonly captainLabel: string | null;
  readonly detailLink: string;
  readonly id: string;
  readonly name: string;
  readonly photoPath: string | null;
  readonly priceLabel: string;
  readonly roleLabel: string;
  readonly scoutingNote: string;
  readonly sideLabel: string;
  readonly teamLogoPath: string | null;
  readonly teamName: string;
  readonly totalPointsLabel: string;
}

export interface FantasyMarketPlayerViewModel {
  readonly affordabilityLabel: string;
  readonly avatar: string;
  readonly canAfford: boolean;
  readonly detailLink: string;
  readonly id: string;
  readonly isInMyTeam: boolean;
  readonly name: string;
  readonly photoPath: string | null;
  readonly pointsMatchdayLabel: string;
  readonly pointsMatchdayValue: number;
  readonly pointsTotalLabel: string;
  readonly pointsTotalValue: number;
  readonly priceChangeLabel: string;
  readonly priceLabel: string;
  readonly priceValue: number;
  readonly roleLabel: string;
  readonly scoutingNote: string;
  readonly side: FantasyPlayer['side'];
  readonly sideLabel: string;
  readonly statusLabel: string;
  readonly statusTone: 'positive' | 'neutral' | 'warning';
  readonly teamId: string;
  readonly teamLogoPath: string | null;
  readonly teamName: string;
}

export interface FantasyTeamViewModel {
  readonly bench: readonly FantasyRosterPlayerViewModel[];
  readonly budgetRemainingLabel: string;
  readonly budgetSpentLabel: string;
  readonly captainName: string | null;
  readonly compositionLabel: string;
  readonly formationLabel: string;
  readonly matchdayPointsLabel: string;
  readonly name: string;
  readonly playersCountLabel: string;
  readonly starters: readonly FantasyRosterPlayerViewModel[];
  readonly teamValueLabel: string;
  readonly totalPointsLabel: string;
}

export interface FantasyLeagueDashboardViewModel {
  readonly hasTeam: boolean;
  readonly inviteCode: string;
  readonly leagueId: string;
  readonly leagueName: string;
  readonly marketLink: string;
  readonly marketPlayers: readonly FantasyMarketPlayerViewModel[];
  readonly marketStatusDescription: string;
  readonly marketStatusLabel: string;
  readonly memberCountLabel: string;
  readonly myPointsLabel: string;
  readonly myRankLabel: string;
  readonly phaseDescription: string;
  readonly phaseLabel: string;
  readonly rankingDescription: string;
  readonly rankingEntries: readonly FantasyRankingEntryViewModel[];
  readonly rankingLink: string;
  readonly rankingTitle: string;
  readonly spotlight: FantasySpotlightCardViewModel | null;
  readonly team: FantasyTeamViewModel | null;
  readonly teamCreationLink: string;
  readonly teamLink: string;
  readonly topRankingEntries: readonly FantasyRankingEntryViewModel[];
}

export function toFantasyLeagueDashboardViewModel(
  dashboard: FantasyLeagueDashboard,
): FantasyLeagueDashboardViewModel {
  const playerDirectory = new Map(dashboard.players.map((player) => [player.id, player] as const));
  const myTeamPlayerIds = new Set(dashboard.myTeam?.players.map((player) => player.playerId) ?? []);
  const budgetRemaining = dashboard.myTeam?.budgetRemaining ?? FANTASY_TEAM_INITIAL_BUDGET;

  return {
    hasTeam: dashboard.myTeam !== null,
    inviteCode: dashboard.league.code,
    leagueId: dashboard.league.id,
    leagueName: dashboard.league.name,
    marketLink: `/fantasy/leagues/${dashboard.league.id}/market`,
    marketPlayers: [...dashboard.players]
      .sort((leftPlayer, rightPlayer) => {
        if (rightPlayer.price !== leftPlayer.price) {
          return rightPlayer.price - leftPlayer.price;
        }

        return leftPlayer.name.localeCompare(rightPlayer.name, 'es');
      })
      .map((player) => toFantasyMarketPlayerViewModel(player, myTeamPlayerIds, budgetRemaining)),
    marketStatusDescription: toMarketStatusDescription(dashboard.league.phase),
    marketStatusLabel: toMarketStatusLabel(dashboard.league.phase),
    memberCountLabel: formatFantasyMemberCount(dashboard.league.memberCount),
    myPointsLabel: formatFantasyPoints(dashboard.league.myPoints),
    myRankLabel: formatFantasyRank(dashboard.league.myRank),
    phaseDescription: toPhaseDescription(dashboard.league.phase),
    phaseLabel: toPhaseLabel(dashboard.league.phase),
    rankingDescription: toRankingDescription(dashboard.league.phase),
    rankingEntries: dashboard.ranking.map(toFantasyRankingEntryViewModel),
    rankingLink: `/fantasy/leagues/${dashboard.league.id}/ranking`,
    rankingTitle: toRankingTitle(dashboard.league.phase),
    spotlight: toFantasySpotlightCardViewModel(
      selectFantasySpotlightPlayer(dashboard.players, dashboard.league.phase),
      dashboard.league.phase,
    ),
    team: dashboard.myTeam
      ? {
          bench: dashboard.myTeam.players
            .filter((teamPlayer) => !teamPlayer.isStarter)
            .map((teamPlayer) => toFantasyRosterPlayerViewModel(teamPlayer, playerDirectory)),
          budgetRemainingLabel: formatFantasyMoney(dashboard.myTeam.budgetRemaining),
          budgetSpentLabel: formatFantasyMoney(
            FANTASY_TEAM_INITIAL_BUDGET - dashboard.myTeam.budgetRemaining,
          ),
          captainName:
            dashboard.myTeam.players
              .map((teamPlayer) => playerDirectory.get(teamPlayer.playerId))
              .find((player, index) => dashboard.myTeam!.players[index]?.isCaptain)?.name ?? null,
          compositionLabel: resolveTeamCompositionLabel(dashboard.myTeam.players, playerDirectory),
          formationLabel: `${dashboard.myTeam.players.filter((player) => player.isStarter).length} titulares · ${
            dashboard.myTeam.players.filter((player) => !player.isStarter).length
          } rotaciones`,
          matchdayPointsLabel: formatFantasyPoints(dashboard.myTeam.matchdayPoints),
          name: dashboard.myTeam.name,
          playersCountLabel: `${dashboard.myTeam.players.length} jugadores`,
          starters: dashboard.myTeam.players
            .filter((teamPlayer) => teamPlayer.isStarter)
            .map((teamPlayer) => toFantasyRosterPlayerViewModel(teamPlayer, playerDirectory)),
          teamValueLabel: formatFantasyMoney(dashboard.myTeam.teamValue),
          totalPointsLabel: formatFantasyPoints(dashboard.myTeam.totalPoints),
        }
      : null,
    teamCreationLink: `/fantasy/leagues/${dashboard.league.id}/create-team`,
    teamLink: `/fantasy/leagues/${dashboard.league.id}/team`,
    topRankingEntries: dashboard.ranking.slice(0, 5).map(toFantasyRankingEntryViewModel),
  };
}

function toFantasyRankingEntryViewModel(entry: FantasyRankingEntry): FantasyRankingEntryViewModel {
  return {
    isMe: entry.isMe,
    managerName: entry.managerName,
    matchdayPointsLabel: formatFantasyPoints(entry.matchdayPoints),
    rankLabel: formatFantasyRank(entry.rank),
    teamName: entry.teamName,
    teamValueLabel: formatFantasyMoney(entry.teamValue),
    totalPointsLabel: formatFantasyPoints(entry.totalPoints),
  };
}

function toFantasyMarketPlayerViewModel(
  player: FantasyPlayer,
  myTeamPlayerIds: ReadonlySet<string>,
  budgetRemaining: number,
): FantasyMarketPlayerViewModel {
  const isInMyTeam = myTeamPlayerIds.has(player.id);
  const canAfford = isInMyTeam || player.price <= budgetRemaining;

  return {
    affordabilityLabel: resolveAffordabilityLabel(player, isInMyTeam, budgetRemaining),
    avatar: player.avatar,
    canAfford,
    detailLink: `/fantasy/players/${player.id}`,
    id: player.id,
    isInMyTeam,
    name: player.name,
    photoPath: player.photoPath,
    pointsMatchdayLabel: formatFantasyPoints(player.pointsMatchday),
    pointsMatchdayValue: player.pointsMatchday,
    pointsTotalLabel: formatFantasyPoints(player.pointsTotal),
    pointsTotalValue: player.pointsTotal,
    priceChangeLabel: formatFantasySignedMoneyDifference(player.price, player.previousPrice),
    priceLabel: formatFantasyMoney(player.price),
    priceValue: player.price,
    roleLabel: player.roleLabel,
    scoutingNote: player.scoutingNote,
    side: player.side,
    sideLabel: player.sideLabel,
    statusLabel: resolveMarketStatusLabel(player, isInMyTeam, canAfford),
    statusTone: resolveMarketStatusTone(player, isInMyTeam, canAfford),
    teamId: player.teamId,
    teamLogoPath: player.teamLogoPath,
    teamName: player.teamName,
  };
}

function toFantasyRosterPlayerViewModel(
  teamPlayer: FantasyTeamPlayer,
  playerDirectory: ReadonlyMap<string, FantasyPlayer>,
): FantasyRosterPlayerViewModel {
  const player = playerDirectory.get(teamPlayer.playerId);

  return {
    avatar: player?.avatar ?? teamPlayer.playerId.slice(0, 2).toUpperCase(),
    captainLabel: teamPlayer.isCaptain ? 'Capitán x2' : null,
    detailLink: `/fantasy/players/${teamPlayer.playerId}`,
    id: teamPlayer.playerId,
    name: player?.name ?? teamPlayer.playerId,
    photoPath: player?.photoPath ?? null,
    priceLabel: player ? formatFantasyMoney(player.price) : 'Sin precio disponible',
    roleLabel: player?.roleLabel ?? 'Jugador pendiente',
    scoutingNote: player?.scoutingNote ?? 'Perfil pendiente de sincronizar.',
    sideLabel: player?.sideLabel ?? 'Sin lado',
    teamLogoPath: player?.teamLogoPath ?? null,
    teamName: player?.teamName ?? 'Equipo pendiente',
    totalPointsLabel: player ? formatFantasyPoints(player.pointsTotal) : 'Sin puntuación',
  };
}

function toFantasySpotlightCardViewModel(
  player: FantasyPlayer | null,
  phase: FantasyLeaguePhase,
): FantasySpotlightCardViewModel | null {
  if (!player) {
    return null;
  }

  return {
    avatarLabel: player.avatar,
    badgeLabel:
      phase === 'preseason' ? 'Jugador mejor cotizado' : formatFantasyPoints(player.pointsMatchday),
    name: player.name,
    photoPath: player.photoPath,
    priceLabel: formatFantasyMoney(player.price),
    supportingLabel: phase === 'preseason' ? player.scoutingNote : player.roleLabel,
    teamName: player.teamName,
    title: phase === 'preseason' ? 'Jugador a seguir' : 'MVP de la jornada',
  };
}

function selectFantasySpotlightPlayer(
  players: readonly FantasyPlayer[],
  phase: FantasyLeaguePhase,
): FantasyPlayer | null {
  if (phase !== 'preseason') {
    return calculateMatchdayMvp(players);
  }

  return (
    [...players]
      .sort((leftPlayer, rightPlayer) => {
        if (rightPlayer.price !== leftPlayer.price) {
          return rightPlayer.price - leftPlayer.price;
        }

        return leftPlayer.name.localeCompare(rightPlayer.name, 'es');
      })
      .at(0) ?? null
  );
}

function toPhaseLabel(phase: FantasyLeaguePhase): string {
  switch (phase) {
    case 'market-open':
      return 'Mercado abierto';
    case 'market-locked':
      return 'Mercado bloqueado';
    default:
      return 'Pretemporada';
  }
}

function toPhaseDescription(phase: FantasyLeaguePhase): string {
  switch (phase) {
    case 'market-open':
      return 'La jornada todavía no ha cerrado y puedes seguir ajustando la plantilla.';
    case 'market-locked':
      return 'La plantilla está cerrada hasta la siguiente apertura de mercado.';
    default:
      return 'La liga todavía no ha arrancado. Puedes hacer cambios libres para construir una plantilla sólida con presupuesto y roles equilibrados.';
  }
}

function toMarketStatusLabel(phase: FantasyLeaguePhase): string {
  switch (phase) {
    case 'market-open':
      return 'Mercado abierto y equipo editable.';
    case 'market-locked':
      return 'Mercado cerrado hasta nueva apertura.';
    default:
      return 'Mercado de pretemporada abierto.';
  }
}

function toMarketStatusDescription(phase: FantasyLeaguePhase): string {
  switch (phase) {
    case 'market-open':
      return 'Puedes fichar, vender y reordenar la plantilla antes del cierre.';
    case 'market-locked':
      return 'Las operaciones quedan congeladas hasta el siguiente ciclo de cambios.';
    default:
      return 'Aún no hay jornadas, así que el mercado sirve para preparar equipo, ajustar precio medio y detectar perfiles útiles.';
  }
}

function toRankingTitle(phase: FantasyLeaguePhase): string {
  return phase === 'preseason'
    ? 'Ranking provisional por valor de plantilla'
    : 'Clasificación fantasy';
}

function toRankingDescription(phase: FantasyLeaguePhase): string {
  return phase === 'preseason'
    ? 'Mientras no empiece la competición, la tabla se ordena por valor estimado de plantilla.'
    : 'La clasificación se ordena por puntos fantasy acumulados.';
}

function resolveAffordabilityLabel(
  player: FantasyPlayer,
  isInMyTeam: boolean,
  budgetRemaining: number,
): string {
  if (isInMyTeam) {
    return 'Ya forma parte de tu plantilla.';
  }

  if (player.price <= budgetRemaining) {
    return 'Entra en presupuesto.';
  }

  return `Te faltan ${formatFantasyMoney(player.price - budgetRemaining)} para ficharlo.`;
}

function resolveMarketStatusLabel(
  player: FantasyPlayer,
  isInMyTeam: boolean,
  canAfford: boolean,
): string {
  if (isInMyTeam) {
    return 'En tu plantilla';
  }

  if (player.teamId === UNASSIGNED_PLAYER_TEAM_ID) {
    return 'Agente libre';
  }

  return canAfford ? 'Disponible' : 'Fuera de presupuesto';
}

function resolveMarketStatusTone(
  player: FantasyPlayer,
  isInMyTeam: boolean,
  canAfford: boolean,
): FantasyMarketPlayerViewModel['statusTone'] {
  if (isInMyTeam) {
    return 'positive';
  }

  if (player.teamId === UNASSIGNED_PLAYER_TEAM_ID) {
    return 'neutral';
  }

  return canAfford ? 'positive' : 'warning';
}

function resolveTeamCompositionLabel(
  teamPlayers: readonly FantasyTeamPlayer[],
  playerDirectory: ReadonlyMap<string, FantasyPlayer>,
): string {
  const selectedPlayers = teamPlayers
    .map((teamPlayer) => playerDirectory.get(teamPlayer.playerId))
    .filter((player): player is FantasyPlayer => player !== undefined);
  const versatileCount = selectedPlayers.filter((player) => player.side === 'ambas').length;
  const freeAgentCount = selectedPlayers.filter(
    (player) => player.teamId === UNASSIGNED_PLAYER_TEAM_ID,
  ).length;
  const versatileLabel =
    versatileCount === 1 ? '1 perfil versátil' : `${versatileCount} perfiles versátiles`;
  const freeAgentLabel =
    freeAgentCount === 1 ? '1 agente libre' : `${freeAgentCount} agentes libres`;

  return `${versatileLabel} · ${freeAgentLabel}`;
}

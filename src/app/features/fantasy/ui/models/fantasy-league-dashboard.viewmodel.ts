import { UNASSIGNED_PLAYER_TEAM_ID } from '@features/players/domain/entities/player.entity';
import {
  type FantasyLeague,
  type FantasyLeagueDashboard,
  type FantasyLeaguePhase,
  type FantasyPlayer,
  type FantasyRankingEntry,
  type FantasyTeam,
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
  readonly canInspect: boolean;
  readonly inspectLabel: string;
  readonly isMe: boolean;
  readonly managerName: string;
  readonly matchdayPointsLabel: string;
  readonly rankLabel: string;
  readonly teamId: string;
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

export interface FantasyTeamInspectorViewModel {
  readonly bench: readonly FantasyRosterPlayerViewModel[];
  readonly captainName: string | null;
  readonly formationLabel: string;
  readonly isMe: boolean;
  readonly managerName: string;
  readonly matchdayPointsLabel: string;
  readonly playersCountLabel: string;
  readonly rankLabel: string;
  readonly starters: readonly FantasyRosterPlayerViewModel[];
  readonly teamId: string;
  readonly teamName: string;
  readonly teamValueLabel: string;
  readonly totalPointsLabel: string;
}

export interface FantasyDashboardActionViewModel {
  readonly href: string;
  readonly label: string;
  readonly tone: 'primary' | 'secondary';
}

export interface FantasyDashboardStatViewModel {
  readonly label: string;
  readonly supportingLabel: string;
  readonly value: string;
}

export interface FantasyDashboardHeroSummaryViewModel {
  readonly description: string;
  readonly facts: readonly FantasyDashboardStatViewModel[];
  readonly primaryAction: FantasyDashboardActionViewModel;
  readonly secondaryActions: readonly FantasyDashboardActionViewModel[];
}

export interface FantasyDashboardPrimarySummaryViewModel {
  readonly badges: readonly string[];
  readonly checklist: readonly string[];
  readonly description: string;
  readonly eyebrow: string;
  readonly metrics: readonly FantasyDashboardStatViewModel[];
  readonly mode: 'onboarding' | 'team';
  readonly primaryAction: FantasyDashboardActionViewModel;
  readonly secondaryActions: readonly FantasyDashboardActionViewModel[];
  readonly title: string;
}

export interface FantasyDashboardMarketSnapshotViewModel {
  readonly description: string;
  readonly metrics: readonly FantasyDashboardStatViewModel[];
  readonly primaryAction: FantasyDashboardActionViewModel;
  readonly secondaryAction: FantasyDashboardActionViewModel;
  readonly title: string;
}

export interface FantasyLeagueDashboardViewModel {
  readonly hasTeam: boolean;
  readonly heroSummary: FantasyDashboardHeroSummaryViewModel;
  readonly inviteCode: string;
  readonly leagueId: string;
  readonly leagueName: string;
  readonly marketLink: string;
  readonly marketPlayers: readonly FantasyMarketPlayerViewModel[];
  readonly marketSnapshot: FantasyDashboardMarketSnapshotViewModel;
  readonly marketStatusDescription: string;
  readonly marketStatusLabel: string;
  readonly memberCountLabel: string;
  readonly myPointsLabel: string;
  readonly myRankLabel: string;
  readonly overviewLink: string;
  readonly phaseDescription: string;
  readonly phaseLabel: string;
  readonly rankingDescription: string;
  readonly rankingEntries: readonly FantasyRankingEntryViewModel[];
  readonly rankingLink: string;
  readonly rankingTitle: string;
  readonly resultsLink: string;
  readonly spotlight: FantasySpotlightCardViewModel | null;
  readonly primarySummary: FantasyDashboardPrimarySummaryViewModel;
  readonly team: FantasyTeamViewModel | null;
  readonly teamCreationLink: string;
  readonly teamLink: string;
  readonly teamRosters: readonly FantasyTeamInspectorViewModel[];
  readonly topRankingEntries: readonly FantasyRankingEntryViewModel[];
}

export function toFantasyLeagueDashboardViewModel(
  dashboard: FantasyLeagueDashboard,
): FantasyLeagueDashboardViewModel {
  const playerDirectory = new Map(dashboard.players.map((player) => [player.id, player] as const));
  const myTeamPlayerIds = new Set(dashboard.myTeam?.players.map((player) => player.playerId) ?? []);
  const budgetRemaining = dashboard.myTeam?.budgetRemaining ?? FANTASY_TEAM_INITIAL_BUDGET;
  const overviewLink = `/fantasy/leagues/${dashboard.league.id}`;
  const marketLink = `/fantasy/leagues/${dashboard.league.id}/market`;
  const rankingLink = `/fantasy/leagues/${dashboard.league.id}/ranking`;
  const resultsLink = `/fantasy/leagues/${dashboard.league.id}/results`;
  const teamCreationLink = `/fantasy/leagues/${dashboard.league.id}/create-team`;
  const teamLink = `/fantasy/leagues/${dashboard.league.id}/team`;
  const marketPlayers = [...dashboard.players]
    .sort((leftPlayer, rightPlayer) => {
      if (rightPlayer.price !== leftPlayer.price) {
        return rightPlayer.price - leftPlayer.price;
      }

      return leftPlayer.name.localeCompare(rightPlayer.name, 'es');
    })
    .map((player) => toFantasyMarketPlayerViewModel(player, myTeamPlayerIds, budgetRemaining));
  const team = dashboard.myTeam ? toFantasyTeamViewModel(dashboard.myTeam, playerDirectory) : null;
  const inspectableTeamIds = new Set(dashboard.teams.map((team) => team.id));
  const rankingEntries = dashboard.ranking.map((entry) =>
    toFantasyRankingEntryViewModel(entry, inspectableTeamIds.has(entry.teamId)),
  );
  const teamRosters = dashboard.ranking.flatMap((entry) => {
    const team = dashboard.teams.find((candidate) => candidate.id === entry.teamId);

    if (!team) {
      return [];
    }

    return [toFantasyTeamInspectorViewModel(team, entry, playerDirectory)];
  });

  return {
    hasTeam: dashboard.myTeam !== null,
    heroSummary: toFantasyDashboardHeroSummaryViewModel(
      dashboard.league,
      dashboard.myTeam !== null,
      {
        marketLink,
        rankingLink,
        teamCreationLink,
        teamLink,
      },
    ),
    inviteCode: dashboard.league.code,
    leagueId: dashboard.league.id,
    leagueName: dashboard.league.name,
    marketLink,
    marketPlayers,
    marketSnapshot: toFantasyDashboardMarketSnapshotViewModel(
      dashboard.league.phase,
      marketPlayers,
      team,
      {
        marketLink,
        teamCreationLink,
        teamLink,
      },
    ),
    marketStatusDescription: toMarketStatusDescription(dashboard.league.phase),
    marketStatusLabel: toMarketStatusLabel(dashboard.league.phase),
    memberCountLabel: formatFantasyMemberCount(dashboard.league.memberCount),
    myPointsLabel: formatFantasyPoints(dashboard.league.myPoints),
    myRankLabel: formatFantasyRank(dashboard.league.myRank),
    overviewLink,
    phaseDescription: toPhaseDescription(dashboard.league.phase),
    phaseLabel: toPhaseLabel(dashboard.league.phase),
    primarySummary: toFantasyDashboardPrimarySummaryViewModel(team, dashboard.league.phase, {
      marketLink,
      teamCreationLink,
      teamLink,
    }),
    rankingDescription: toRankingDescription(dashboard.league.phase),
    rankingEntries,
    rankingLink,
    rankingTitle: toRankingTitle(dashboard.league.phase),
    resultsLink,
    spotlight: toFantasySpotlightCardViewModel(
      selectFantasySpotlightPlayer(dashboard.players, dashboard.league.phase),
      dashboard.league.phase,
    ),
    team,
    teamCreationLink,
    teamLink,
    teamRosters,
    topRankingEntries: rankingEntries.slice(0, 5),
  };
}

function toFantasyRankingEntryViewModel(
  entry: FantasyRankingEntry,
  canInspect: boolean,
): FantasyRankingEntryViewModel {
  return {
    canInspect,
    inspectLabel: entry.isMe ? 'Ver mi equipo' : 'Ver equipo',
    isMe: entry.isMe,
    managerName: entry.managerName,
    matchdayPointsLabel: formatFantasyPoints(entry.matchdayPoints),
    rankLabel: formatFantasyRank(entry.rank),
    teamId: entry.teamId,
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

function toFantasyTeamViewModel(
  team: FantasyTeam,
  playerDirectory: ReadonlyMap<string, FantasyPlayer>,
): FantasyTeamViewModel {
  const starters = team.players
    .filter((teamPlayer) => teamPlayer.isStarter)
    .map((teamPlayer) => toFantasyRosterPlayerViewModel(teamPlayer, playerDirectory));
  const bench = team.players
    .filter((teamPlayer) => !teamPlayer.isStarter)
    .map((teamPlayer) => toFantasyRosterPlayerViewModel(teamPlayer, playerDirectory));

  return {
    bench,
    budgetRemainingLabel: formatFantasyMoney(team.budgetRemaining),
    budgetSpentLabel: formatFantasyMoney(FANTASY_TEAM_INITIAL_BUDGET - team.budgetRemaining),
    captainName:
      team.players
        .map((teamPlayer) => playerDirectory.get(teamPlayer.playerId))
        .find((player, index) => team.players[index]?.isCaptain)?.name ?? null,
    compositionLabel: resolveTeamCompositionLabel(team.players, playerDirectory),
    formationLabel: `${starters.length} titulares · ${bench.length} rotaciones`,
    matchdayPointsLabel: formatFantasyPoints(team.matchdayPoints),
    name: team.name,
    playersCountLabel: `${team.players.length} jugadores`,
    starters,
    teamValueLabel: formatFantasyMoney(team.teamValue),
    totalPointsLabel: formatFantasyPoints(team.totalPoints),
  };
}

function toFantasyTeamInspectorViewModel(
  team: FantasyTeam,
  rankingEntry: FantasyRankingEntry,
  playerDirectory: ReadonlyMap<string, FantasyPlayer>,
): FantasyTeamInspectorViewModel {
  const teamViewModel = toFantasyTeamViewModel(team, playerDirectory);

  return {
    bench: teamViewModel.bench,
    captainName: teamViewModel.captainName,
    formationLabel: teamViewModel.formationLabel,
    isMe: rankingEntry.isMe,
    managerName: team.managerName,
    matchdayPointsLabel: teamViewModel.matchdayPointsLabel,
    playersCountLabel: teamViewModel.playersCountLabel,
    rankLabel: formatFantasyRank(rankingEntry.rank),
    starters: teamViewModel.starters,
    teamId: team.id,
    teamName: team.name,
    teamValueLabel: teamViewModel.teamValueLabel,
    totalPointsLabel: teamViewModel.totalPointsLabel,
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

function toDashboardHeroDescription(phase: FantasyLeaguePhase, hasTeam: boolean): string {
  switch (phase) {
    case 'market-open':
      return hasTeam
        ? 'Tu bloque está listo para competir: revisa mercado y ranking antes del cierre.'
        : 'Aún puedes montar la plantilla y aprovechar la apertura de mercado.';
    case 'market-locked':
      return hasTeam
        ? 'Tu equipo queda fijado hasta la próxima apertura. Revisa posición y valor actual.'
        : 'El mercado está cerrado, pero puedes seguir la liga y preparar el siguiente movimiento.';
    default:
      return hasTeam
        ? 'Tu plantilla ya está activa. Ajusta mercado, valor y capitán antes del arranque.'
        : 'Todavía estás a tiempo de construir una plantilla sólida antes de que empiece la liga.';
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

function toFantasyDashboardHeroSummaryViewModel(
  league: FantasyLeague,
  hasTeam: boolean,
  links: {
    readonly marketLink: string;
    readonly rankingLink: string;
    readonly teamCreationLink: string;
    readonly teamLink: string;
  },
): FantasyDashboardHeroSummaryViewModel {
  return {
    description: toDashboardHeroDescription(league.phase, hasTeam),
    facts: [
      {
        label: 'Código',
        supportingLabel: 'Comparte este acceso para sumar managers a la liga.',
        value: league.code,
      },
      {
        label: 'Participantes',
        supportingLabel: 'Managers activos en la competición.',
        value: formatFantasyMemberCount(league.memberCount),
      },
      {
        label: 'Posición',
        supportingLabel: 'Tu referencia actual dentro de la liga.',
        value: formatFantasyRank(league.myRank),
      },
    ],
    primaryAction: hasTeam
      ? {
          href: links.teamLink,
          label: 'Gestionar equipo',
          tone: 'primary',
        }
      : {
          href: links.teamCreationLink,
          label: 'Crear plantilla',
          tone: 'primary',
        },
    secondaryActions: [
      {
        href: links.marketLink,
        label: 'Mercado',
        tone: 'secondary',
      },
      {
        href: links.rankingLink,
        label: 'Clasificación',
        tone: 'secondary',
      },
    ],
  };
}

function toFantasyDashboardPrimarySummaryViewModel(
  team: FantasyTeamViewModel | null,
  phase: FantasyLeaguePhase,
  links: {
    readonly marketLink: string;
    readonly teamCreationLink: string;
    readonly teamLink: string;
  },
): FantasyDashboardPrimarySummaryViewModel {
  if (!team) {
    return {
      badges: [],
      checklist: ['Fichar 6 jugadores', 'Elegir capitán x2', 'Cerrar presupuesto sin pasarte'],
      description:
        phase === 'preseason'
          ? 'Empieza con una plantilla equilibrada y llega al arranque con ventaja.'
          : 'Configura la plantilla para entrar en la liga con una base competitiva.',
      eyebrow: 'Mi plantilla',
      metrics: [],
      mode: 'onboarding',
      primaryAction: {
        href: links.teamCreationLink,
        label: 'Crear plantilla',
        tone: 'primary',
      },
      secondaryActions: [
        {
          href: links.marketLink,
          label: 'Abrir mercado',
          tone: 'secondary',
        },
      ],
      title: 'Todavía no tienes plantilla',
    };
  }

  return {
    badges: [
      team.captainName ? `Capitán x2 · ${team.captainName}` : 'Capitán pendiente',
      team.formationLabel,
      team.compositionLabel,
    ],
    checklist: [],
    description:
      phase === 'preseason'
        ? 'Tu bloque principal ya está montado. Ahora toca afinar valor, capitán y presupuesto.'
        : 'Controla el estado de tu equipo y decide cuándo mover la plantilla.',
    eyebrow: 'Mi plantilla',
    metrics: [
      {
        label: 'Valor de plantilla',
        supportingLabel: 'Cotización actual de tu roster.',
        value: team.teamValueLabel,
      },
      {
        label: 'Presupuesto restante',
        supportingLabel: 'Margen libre para fichajes.',
        value: team.budgetRemainingLabel,
      },
      {
        label: 'Puntos totales',
        supportingLabel: 'Acumulado fantasy de la temporada.',
        value: team.totalPointsLabel,
      },
      {
        label: 'Jornada',
        supportingLabel: 'Producción de la fecha actual.',
        value: team.matchdayPointsLabel,
      },
    ],
    mode: 'team',
    primaryAction: {
      href: links.teamLink,
      label: 'Gestionar equipo',
      tone: 'primary',
    },
    secondaryActions: [
      {
        href: links.teamCreationLink,
        label: 'Editar plantilla',
        tone: 'secondary',
      },
    ],
    title: team.name,
  };
}

function toFantasyDashboardMarketSnapshotViewModel(
  phase: FantasyLeaguePhase,
  marketPlayers: readonly FantasyMarketPlayerViewModel[],
  team: FantasyTeamViewModel | null,
  links: {
    readonly marketLink: string;
    readonly teamCreationLink: string;
    readonly teamLink: string;
  },
): FantasyDashboardMarketSnapshotViewModel {
  const affordablePlayersCount = marketPlayers.filter(
    (player) => !player.isInMyTeam && player.canAfford,
  ).length;
  const playersInTeamCount = marketPlayers.filter((player) => player.isInMyTeam).length;

  return {
    description: toMarketStatusDescription(phase),
    metrics: [
      {
        label: 'Asequibles',
        supportingLabel: 'Jugadores que entran hoy en tu presupuesto.',
        value: `${affordablePlayersCount}`,
      },
      {
        label: 'En plantilla',
        supportingLabel: 'Piezas ya fijadas en tu equipo.',
        value: `${playersInTeamCount}`,
      },
      {
        label: team ? 'Presupuesto' : 'Presupuesto inicial',
        supportingLabel: team
          ? 'Saldo libre antes del próximo movimiento.'
          : 'Margen total disponible para construir tu draft.',
        value: team?.budgetRemainingLabel ?? formatFantasyMoney(FANTASY_TEAM_INITIAL_BUDGET),
      },
    ],
    primaryAction: {
      href: links.marketLink,
      label: 'Abrir mercado',
      tone: 'primary',
    },
    secondaryAction: team
      ? {
          href: links.teamLink,
          label: 'Ver mi equipo',
          tone: 'secondary',
        }
      : {
          href: links.teamCreationLink,
          label: 'Crear plantilla',
          tone: 'secondary',
        },
    title: toMarketStatusLabel(phase),
  };
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

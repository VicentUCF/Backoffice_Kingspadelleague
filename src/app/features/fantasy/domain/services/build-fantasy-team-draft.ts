import { type FantasyPlayer } from '../entities/fantasy.models';

export const FANTASY_TEAM_MAX_PLAYERS = 6;
export const FANTASY_TEAM_INITIAL_BUDGET = 100_000_000;

export interface FantasyTeamDraftSummary {
  readonly captainId: string | null;
  readonly captainName: string | null;
  readonly canSubmit: boolean;
  readonly remainingBudget: number;
  readonly selectedPlayers: readonly FantasyPlayer[];
  readonly selectedPlayersCount: number;
  readonly validationMessage: string | null;
}

export function buildFantasyTeamDraft(
  players: readonly FantasyPlayer[],
  selectedPlayerIds: readonly string[],
  captainId: string | null,
): FantasyTeamDraftSummary {
  const playersById = new Map(players.map((player) => [player.id, player]));
  const selectedPlayers = selectedPlayerIds.flatMap((playerId) => {
    const player = playersById.get(playerId);

    return player ? [player] : [];
  });
  const remainingBudget =
    FANTASY_TEAM_INITIAL_BUDGET -
    selectedPlayers.reduce((total, player) => total + player.price, 0);
  const sanitizedCaptainId = sanitizeFantasyDraftCaptain(selectedPlayerIds, captainId);
  const captainName =
    sanitizedCaptainId === null
      ? null
      : (selectedPlayers.find((player) => player.id === sanitizedCaptainId)?.name ?? null);

  return {
    captainId: sanitizedCaptainId,
    captainName,
    canSubmit:
      selectedPlayers.length === FANTASY_TEAM_MAX_PLAYERS &&
      remainingBudget >= 0 &&
      sanitizedCaptainId !== null,
    remainingBudget,
    selectedPlayers,
    selectedPlayersCount: selectedPlayers.length,
    validationMessage: resolveDraftValidationMessage(
      selectedPlayers.length,
      remainingBudget,
      sanitizedCaptainId,
    ),
  };
}

export function toggleFantasyDraftPlayer(
  players: readonly FantasyPlayer[],
  selectedPlayerIds: readonly string[],
  playerId: string,
): readonly string[] {
  if (selectedPlayerIds.includes(playerId)) {
    return selectedPlayerIds.filter((selectedId) => selectedId !== playerId);
  }

  if (selectedPlayerIds.length >= FANTASY_TEAM_MAX_PLAYERS) {
    return selectedPlayerIds;
  }

  const player = players.find((candidate) => candidate.id === playerId);

  if (!player) {
    return selectedPlayerIds;
  }

  const currentDraft = buildFantasyTeamDraft(players, selectedPlayerIds, null);

  if (player.price > currentDraft.remainingBudget) {
    return selectedPlayerIds;
  }

  return [...selectedPlayerIds, playerId];
}

export function sanitizeFantasyDraftCaptain(
  selectedPlayerIds: readonly string[],
  captainId: string | null,
): string | null {
  if (!captainId) {
    return null;
  }

  return selectedPlayerIds.includes(captainId) ? captainId : null;
}

function resolveDraftValidationMessage(
  selectedPlayersCount: number,
  remainingBudget: number,
  captainId: string | null,
): string | null {
  if (remainingBudget < 0) {
    return 'Has superado el presupuesto disponible para la plantilla.';
  }

  if (selectedPlayersCount < FANTASY_TEAM_MAX_PLAYERS) {
    const missingPlayersCount = FANTASY_TEAM_MAX_PLAYERS - selectedPlayersCount;
    const suffix = missingPlayersCount === 1 ? '' : 'es';

    return `Selecciona ${missingPlayersCount} jugador${suffix} más para completar el equipo.`;
  }

  if (!captainId) {
    return 'Selecciona un capitán para guardar el equipo.';
  }

  return null;
}

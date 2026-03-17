export const FANTASY_TEAM_STARTERS_COUNT = 4;

export function sanitizeFantasyTeamStarters(
  selectedPlayerIds: readonly string[],
  starterPlayerIds: readonly string[] | null | undefined,
): readonly string[] {
  const maxStarters = Math.min(FANTASY_TEAM_STARTERS_COUNT, selectedPlayerIds.length);
  const sanitizedStarters = (starterPlayerIds ?? []).filter((playerId) =>
    selectedPlayerIds.includes(playerId),
  );
  const uniqueStarters = [...new Set(sanitizedStarters)].slice(0, maxStarters);

  if (uniqueStarters.length === maxStarters) {
    return uniqueStarters;
  }

  return selectedPlayerIds.reduce<readonly string[]>((currentStarters, playerId) => {
    if (currentStarters.length >= maxStarters || currentStarters.includes(playerId)) {
      return currentStarters;
    }

    return [...currentStarters, playerId];
  }, uniqueStarters);
}

export function toggleFantasyTeamStarter(
  selectedPlayerIds: readonly string[],
  starterPlayerIds: readonly string[],
  playerId: string,
): readonly string[] {
  if (!selectedPlayerIds.includes(playerId)) {
    return sanitizeFantasyTeamStarters(selectedPlayerIds, starterPlayerIds);
  }

  const sanitizedStarters = sanitizeFantasyTeamStarters(selectedPlayerIds, starterPlayerIds);

  if (sanitizedStarters.includes(playerId)) {
    return sanitizedStarters.filter((starterId) => starterId !== playerId);
  }

  if (sanitizedStarters.length >= Math.min(FANTASY_TEAM_STARTERS_COUNT, selectedPlayerIds.length)) {
    return sanitizedStarters;
  }

  return [...sanitizedStarters, playerId];
}

export function resolveFantasyLineupValidationMessage(
  selectedPlayerIds: readonly string[],
  starterPlayerIds: readonly string[],
  captainId: string | null,
): string {
  if (selectedPlayerIds.length === 0) {
    return 'Todavía no tienes jugadores comprados para alinear la jornada.';
  }

  const requiredStarters = Math.min(FANTASY_TEAM_STARTERS_COUNT, selectedPlayerIds.length);

  if (starterPlayerIds.length !== requiredStarters) {
    return `Debes dejar ${requiredStarters} titulares activos antes de guardar la jornada.`;
  }

  if (!captainId || !selectedPlayerIds.includes(captainId)) {
    return 'Elige un capitán dentro de tu roster antes de guardar.';
  }

  if (!starterPlayerIds.includes(captainId)) {
    return 'El capitán de la jornada tiene que estar dentro de los titulares.';
  }

  return 'Todo listo para guardar la alineación de la jornada.';
}

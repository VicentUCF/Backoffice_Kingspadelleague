export interface FantasyResolvedPredictionOutcome {
  readonly bonusPoints: number;
  readonly hitPlayerIds: readonly string[];
  readonly hits: number;
}

export function resolveFantasyPredictionOutcome(
  submittedStarterPlayerIds: readonly string[],
  confirmedStarterPlayerIds: readonly string[],
): FantasyResolvedPredictionOutcome {
  const confirmedStarterSet = new Set(confirmedStarterPlayerIds);
  const hitPlayerIds = [...new Set(submittedStarterPlayerIds)].filter((playerId) =>
    confirmedStarterSet.has(playerId),
  );

  return {
    bonusPoints: hitPlayerIds.length,
    hitPlayerIds,
    hits: hitPlayerIds.length,
  };
}

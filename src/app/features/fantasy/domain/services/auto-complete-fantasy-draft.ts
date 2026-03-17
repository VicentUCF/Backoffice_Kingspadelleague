import { type FantasyPlayer } from '../entities/fantasy.models';

import { FANTASY_TEAM_MAX_PLAYERS, toggleFantasyDraftPlayer } from './build-fantasy-team-draft';

export function autoCompleteFantasyDraft(
  players: readonly FantasyPlayer[],
  selectedPlayerIds: readonly string[],
): readonly string[] {
  let nextSelectedPlayerIds: readonly string[] = [...selectedPlayerIds];
  const candidatePlayers = [...players]
    .filter((player) => !nextSelectedPlayerIds.includes(player.id))
    .sort((leftPlayer, rightPlayer) => {
      if (rightPlayer.price !== leftPlayer.price) {
        return rightPlayer.price - leftPlayer.price;
      }

      return leftPlayer.name.localeCompare(rightPlayer.name, 'es');
    });

  for (const player of candidatePlayers) {
    if (nextSelectedPlayerIds.length >= FANTASY_TEAM_MAX_PLAYERS) {
      break;
    }

    const nextCandidateSelection = toggleFantasyDraftPlayer(
      players,
      nextSelectedPlayerIds,
      player.id,
    );

    if (nextCandidateSelection.length > nextSelectedPlayerIds.length) {
      nextSelectedPlayerIds = nextCandidateSelection;
    }
  }

  return nextSelectedPlayerIds;
}

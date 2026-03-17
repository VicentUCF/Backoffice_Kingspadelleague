import { type FantasyPlayer } from '../entities/fantasy.models';

export function calculateMatchdayMvp(players: readonly FantasyPlayer[]): FantasyPlayer | null {
  if (players.length === 0) {
    return null;
  }

  return (
    [...players].sort((leftPlayer, rightPlayer) => {
      if (rightPlayer.pointsMatchday !== leftPlayer.pointsMatchday) {
        return rightPlayer.pointsMatchday - leftPlayer.pointsMatchday;
      }

      if (rightPlayer.price !== leftPlayer.price) {
        return rightPlayer.price - leftPlayer.price;
      }

      return leftPlayer.name.localeCompare(rightPlayer.name, 'es');
    })[0] ?? null
  );
}

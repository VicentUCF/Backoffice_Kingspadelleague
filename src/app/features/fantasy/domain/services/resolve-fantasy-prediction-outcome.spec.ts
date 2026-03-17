import { resolveFantasyPredictionOutcome } from './resolve-fantasy-prediction-outcome';

describe('resolveFantasyPredictionOutcome', () => {
  it('returns hits and bonus points from the submitted starters against the confirmed lineup', () => {
    expect(
      resolveFantasyPredictionOutcome(
        ['player-1', 'player-2', 'player-3', 'player-4'],
        ['player-2', 'player-3', 'player-5', 'player-6'],
      ),
    ).toEqual({
      bonusPoints: 2,
      hitPlayerIds: ['player-2', 'player-3'],
      hits: 2,
    });
  });

  it('deduplicates repeated submitted players before calculating the bonus', () => {
    expect(
      resolveFantasyPredictionOutcome(
        ['player-1', 'player-1', 'player-2'],
        ['player-1', 'player-3'],
      ),
    ).toEqual({
      bonusPoints: 1,
      hitPlayerIds: ['player-1'],
      hits: 1,
    });
  });
});

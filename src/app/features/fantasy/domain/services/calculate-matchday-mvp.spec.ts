import { calculateMatchdayMvp } from './calculate-matchday-mvp';

import { createFantasyPlayer } from '@features/fantasy/testing/fantasy-test.fixtures';

const player = createFantasyPlayer;

describe('calculateMatchdayMvp', () => {
  it('returns null when there are no players', () => {
    expect(calculateMatchdayMvp([])).toBeNull();
  });

  it('prioritizes highest matchday points', () => {
    const result = calculateMatchdayMvp([
      player({ id: 'p-1', pointsMatchday: 8 }),
      player({ id: 'p-2', pointsMatchday: 11 }),
    ]);

    expect(result?.id).toBe('p-2');
  });

  it('breaks tie by highest price then alphabetical name', () => {
    const result = calculateMatchdayMvp([
      player({ id: 'p-3', name: 'Zeta', pointsMatchday: 10, price: 20 }),
      player({ id: 'p-2', name: 'Beta', pointsMatchday: 10, price: 25 }),
      player({ id: 'p-1', name: 'Alfa', pointsMatchday: 10, price: 25 }),
    ]);

    expect(result?.id).toBe('p-1');
  });
});

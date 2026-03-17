import { createFantasyPlayer } from '@features/fantasy/testing/fantasy-test.fixtures';

import { autoCompleteFantasyDraft } from './auto-complete-fantasy-draft';

describe('autoCompleteFantasyDraft', () => {
  it('fills the remaining slots with the highest-priced players that still fit in budget', () => {
    const players = [
      createFantasyPlayer({ id: 'p-1', name: 'Alpha', price: 60_000_000 }),
      createFantasyPlayer({ id: 'p-2', name: 'Beta', price: 41_000_000 }),
      createFantasyPlayer({ id: 'p-3', name: 'Gamma', price: 8_000_000 }),
      createFantasyPlayer({ id: 'p-4', name: 'Delta', price: 8_000_000 }),
      createFantasyPlayer({ id: 'p-5', name: 'Epsilon', price: 8_000_000 }),
      createFantasyPlayer({ id: 'p-6', name: 'Zeta', price: 8_000_000 }),
      createFantasyPlayer({ id: 'p-7', name: 'Eta', price: 8_000_000 }),
    ];

    expect(autoCompleteFantasyDraft(players, [])).toEqual([
      'p-1',
      'p-4',
      'p-5',
      'p-7',
      'p-3',
      'p-6',
    ]);
  });

  it('preserves the current selection and only completes the missing places', () => {
    const players = [
      createFantasyPlayer({ id: 'p-1', name: 'Alpha', price: 15_000_000 }),
      createFantasyPlayer({ id: 'p-2', name: 'Beta', price: 14_500_000 }),
      createFantasyPlayer({ id: 'p-3', name: 'Gamma', price: 14_000_000 }),
      createFantasyPlayer({ id: 'p-4', name: 'Delta', price: 13_500_000 }),
      createFantasyPlayer({ id: 'p-5', name: 'Epsilon', price: 13_000_000 }),
      createFantasyPlayer({ id: 'p-6', name: 'Zeta', price: 12_500_000 }),
      createFantasyPlayer({ id: 'p-7', name: 'Eta', price: 12_000_000 }),
    ];

    expect(autoCompleteFantasyDraft(players, ['p-6', 'p-7'])).toEqual([
      'p-6',
      'p-7',
      'p-1',
      'p-2',
      'p-3',
      'p-4',
    ]);
  });
});

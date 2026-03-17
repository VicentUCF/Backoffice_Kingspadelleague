import {
  buildFantasyTeamDraft,
  FANTASY_TEAM_INITIAL_BUDGET,
  FANTASY_TEAM_MAX_PLAYERS,
  sanitizeFantasyDraftCaptain,
  toggleFantasyDraftPlayer,
} from './build-fantasy-team-draft';

import { createFantasyPlayer } from '@features/fantasy/testing/fantasy-test.fixtures';

describe('buildFantasyTeamDraft', () => {
  it('calculates the remaining budget and validates the captain selection', () => {
    const players = [
      createPlayer({ id: 'fp-1', name: 'Ale Ruiz', price: 20_000_000 }),
      createPlayer({ id: 'fp-2', name: 'Bea Gonzalez', price: 21_000_000 }),
      createPlayer({ id: 'fp-3', name: 'Arturo Coello', price: 22_000_000 }),
      createPlayer({ id: 'fp-4', name: 'Paula Josemaria', price: 23_000_000 }),
      createPlayer({ id: 'fp-5', name: 'Juan Lebron', price: 5_000_000 }),
      createPlayer({ id: 'fp-6', name: 'Agustin Tapia', price: 4_000_000 }),
    ];

    const draft = buildFantasyTeamDraft(
      players,
      players.map((player) => player.id),
      'fp-3',
    );

    expect(draft.remainingBudget).toBe(FANTASY_TEAM_INITIAL_BUDGET - 95_000_000);
    expect(draft.selectedPlayersCount).toBe(FANTASY_TEAM_MAX_PLAYERS);
    expect(draft.captainName).toBe('Arturo Coello');
    expect(draft.canSubmit).toBe(true);
    expect(draft.validationMessage).toBeNull();
  });

  it('rejects the captain when it is not part of the current selection', () => {
    const players = [
      createPlayer({ id: 'fp-1', price: 10_000_000 }),
      createPlayer({ id: 'fp-2', price: 10_000_000 }),
    ];

    const draft = buildFantasyTeamDraft(players, ['fp-1', 'fp-2'], 'fp-9');

    expect(draft.captainId).toBeNull();
    expect(draft.canSubmit).toBe(false);
    expect(draft.validationMessage).toBe('Selecciona 4 jugadores más para completar el equipo.');
  });
});

describe('toggleFantasyDraftPlayer', () => {
  it('adds and removes players while respecting the squad limit', () => {
    const players = Array.from({ length: 7 }, (_, index) =>
      createPlayer({
        id: `fp-${index + 1}`,
        price: 10_000_000,
      }),
    );

    const sixPlayers = players.slice(0, 6).map((player) => player.id);

    expect(toggleFantasyDraftPlayer(players, [], 'fp-1')).toEqual(['fp-1']);
    expect(toggleFantasyDraftPlayer(players, ['fp-1'], 'fp-1')).toEqual([]);
    expect(toggleFantasyDraftPlayer(players, sixPlayers, 'fp-7')).toEqual(sixPlayers);
  });

  it('prevents selections that exceed the available budget', () => {
    const players = [
      createPlayer({ id: 'fp-1', price: 60_000_000 }),
      createPlayer({ id: 'fp-2', price: 41_000_000 }),
    ];

    const selectedPlayers = toggleFantasyDraftPlayer(players, [], 'fp-1');

    expect(toggleFantasyDraftPlayer(players, selectedPlayers, 'fp-2')).toEqual(selectedPlayers);
  });
});

describe('sanitizeFantasyDraftCaptain', () => {
  it('returns null when the captain is no longer selected', () => {
    expect(sanitizeFantasyDraftCaptain(['fp-1', 'fp-2'], 'fp-3')).toBeNull();
  });
});

function createPlayer(
  overrides: Parameters<typeof createFantasyPlayer>[0],
): ReturnType<typeof createFantasyPlayer> {
  return createFantasyPlayer(overrides);
}

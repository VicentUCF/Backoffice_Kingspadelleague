import {
  resolveFantasyLineupValidationMessage,
  sanitizeFantasyLineupCaptain,
  sanitizeFantasyTeamStarters,
  toggleFantasyTeamStarter,
} from './build-fantasy-team-lineup';

describe('toggleFantasyTeamStarter', () => {
  it('does not replace a starter when trying to promote a rotation player and the lineup is already full', () => {
    expect(
      toggleFantasyTeamStarter(
        ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
        ['p1', 'p2', 'p3', 'p4'],
        'p5',
      ),
    ).toEqual(['p1', 'p2', 'p3', 'p4']);
  });

  it('removes a starter when sending that player to rotation', () => {
    expect(
      toggleFantasyTeamStarter(
        ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
        ['p1', 'p2', 'p3', 'p4'],
        'p3',
      ),
    ).toEqual(['p1', 'p2', 'p4']);
  });

  it('keeps empty lineup slots when moving multiple starters to rotation in sequence', () => {
    const startersAfterFirstMove = toggleFantasyTeamStarter(
      ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
      ['p1', 'p2', 'p3', 'p4'],
      'p3',
    );

    expect(startersAfterFirstMove).toEqual(['p1', 'p2', 'p4']);

    expect(
      toggleFantasyTeamStarter(['p1', 'p2', 'p3', 'p4', 'p5', 'p6'], startersAfterFirstMove, 'p2'),
    ).toEqual(['p1', 'p4']);
  });
});

describe('sanitizeFantasyTeamStarters', () => {
  it('fills missing starters from the selected roster in order', () => {
    expect(sanitizeFantasyTeamStarters(['p1', 'p2', 'p3', 'p4'], ['p3'])).toEqual([
      'p3',
      'p1',
      'p2',
      'p4',
    ]);
  });
});

describe('sanitizeFantasyLineupCaptain', () => {
  it('keeps the captain while it remains in the starters', () => {
    expect(sanitizeFantasyLineupCaptain(['p1', 'p2', 'p3', 'p4'], 'p2')).toBe('p2');
  });

  it('reassigns the captain to the first available starter if the previous one leaves the lineup', () => {
    expect(sanitizeFantasyLineupCaptain(['p1', 'p3', 'p4'], 'p2')).toBe('p1');
  });
});

describe('resolveFantasyLineupValidationMessage', () => {
  it('requires the captain to stay inside the starters', () => {
    expect(
      resolveFantasyLineupValidationMessage(
        ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
        ['p1', 'p2', 'p3', 'p4'],
        'p5',
      ),
    ).toBe('El capitán de la jornada tiene que estar dentro de los titulares.');
  });
});

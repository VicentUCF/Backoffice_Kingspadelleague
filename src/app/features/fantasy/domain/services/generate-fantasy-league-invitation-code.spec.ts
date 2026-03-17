import { generateFantasyLeagueInvitationCode } from './generate-fantasy-league-invitation-code';

describe('generateFantasyLeagueInvitationCode', () => {
  it('builds a stable uppercase code from the league name', () => {
    expect(generateFantasyLeagueInvitationCode('Amigos del curro', 2026)).toBe('AMIGOS26');
  });

  it('removes spaces and accents before truncating the code', () => {
    expect(generateFantasyLeagueInvitationCode('Pádel ñ', 2026)).toBe('PADELN26');
  });

  it('falls back to a generic base when the name has no valid characters', () => {
    expect(generateFantasyLeagueInvitationCode('   ', 2026)).toBe('LIGA26');
  });
});

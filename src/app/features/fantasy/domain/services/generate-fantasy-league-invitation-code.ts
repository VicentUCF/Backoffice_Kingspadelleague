const MAX_LEAGUE_CODE_LENGTH = 6;
const MIN_LEAGUE_CODE_LENGTH = 4;
const DEFAULT_LEAGUE_CODE_FALLBACK = 'LIGA';

export function generateFantasyLeagueInvitationCode(
  leagueName: string,
  seasonYear = new Date().getFullYear(),
): string {
  const normalizedName = leagueName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase();
  const codeBase = (normalizedName || DEFAULT_LEAGUE_CODE_FALLBACK)
    .slice(0, MAX_LEAGUE_CODE_LENGTH)
    .padEnd(
      Math.max(
        MIN_LEAGUE_CODE_LENGTH,
        Math.min(
          MAX_LEAGUE_CODE_LENGTH,
          normalizedName.length || DEFAULT_LEAGUE_CODE_FALLBACK.length,
        ),
      ),
      'X',
    );
  const yearSuffix = `${Math.abs(seasonYear)}`.slice(-2).padStart(2, '0');

  return `${codeBase}${yearSuffix}`;
}

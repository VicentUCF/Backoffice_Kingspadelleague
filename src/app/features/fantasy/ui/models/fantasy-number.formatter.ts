const compactCurrencyFormatter = new Intl.NumberFormat('es-ES', {
  compactDisplay: 'short',
  maximumFractionDigits: 1,
  notation: 'compact',
});
const integerFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 0,
});

export function formatFantasyInteger(value: number): string {
  return integerFormatter.format(value);
}

export function formatFantasyMoney(value: number): string {
  if (Math.abs(value) >= 1_000) {
    return `${normalizeFantasyWhitespace(compactCurrencyFormatter.format(value))} €`;
  }

  return `${formatFantasyInteger(value)} €`;
}

export function formatFantasyPoints(value: number): string {
  return `${formatFantasyInteger(value)} pts`;
}

export function formatFantasyRank(value: number): string {
  return `#${formatFantasyInteger(value)}`;
}

export function formatFantasyMemberCount(value: number): string {
  const suffix = value === 1 ? '' : 's';

  return `${formatFantasyInteger(value)} participante${suffix}`;
}

export function formatFantasySignedMoneyDifference(
  currentValue: number,
  previousValue: number,
): string {
  const difference = currentValue - previousValue;

  if (difference === 0) {
    return 'Sin cambios';
  }

  const sign = difference > 0 ? '+' : '-';

  return `${sign}${formatFantasyMoney(Math.abs(difference))}`;
}

function normalizeFantasyWhitespace(value: string): string {
  return value.replace(/\s/g, ' ').replace(/\s+/g, ' ').trim();
}

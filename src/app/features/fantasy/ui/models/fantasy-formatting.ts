const compactCurrencyFormatter = new Intl.NumberFormat('es-ES', {
  compactDisplay: 'short',
  maximumFractionDigits: 1,
  notation: 'compact',
});

const integerFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 0,
});

export function formatFantasyCurrency(value: number): string {
  if (Math.abs(value) >= 1_000) {
    return `${compactCurrencyFormatter.format(value)} €`;
  }

  return `${integerFormatter.format(value)} €`;
}

export function formatFantasySignedCurrencyDelta(value: number): string {
  if (value === 0) {
    return '0 €';
  }

  const absoluteValueLabel = formatFantasyCurrency(Math.abs(value));

  return value > 0 ? `+${absoluteValueLabel}` : `-${absoluteValueLabel}`;
}

export function formatFantasyPoints(value: number): string {
  return `${integerFormatter.format(value)} pts`;
}

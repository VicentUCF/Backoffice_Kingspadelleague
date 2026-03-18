import {
  type FantasyPlayer,
  type FantasyPlayerValueHistoryPoint,
} from '@features/fantasy/domain/entities/fantasy.models';
import { FANTASY_TEAM_INITIAL_BUDGET } from '@features/fantasy/domain/services/build-fantasy-team-draft';

import {
  formatFantasyMoney,
  formatFantasyPoints,
  formatFantasySignedMoneyDifference,
} from './fantasy-number.formatter';

const ratioFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});
const percentageFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 0,
});

const HISTORY_CHART_WIDTH = 100;
const HISTORY_CHART_HEIGHT = 56;
const HISTORY_CHART_PADDING_X = 8;
const HISTORY_CHART_PADDING_Y = 6;

export interface FantasyPlayerProfileKeyMetricViewModel {
  readonly id: string;
  readonly label: string;
  readonly supportingText: string;
  readonly tone: 'positive' | 'negative' | 'neutral';
  readonly value: string;
}

export interface FantasyPlayerProfileSignalViewModel {
  readonly id: string;
  readonly title: string;
  readonly value: string;
  readonly description: string;
  readonly tone: 'positive' | 'warning' | 'neutral';
}

export interface FantasyPlayerProfileValueHistoryPointViewModel {
  readonly id: string;
  readonly isCurrent: boolean;
  readonly label: string;
  readonly priceLabel: string;
  readonly value: number;
  readonly x: number;
  readonly y: number;
}

export interface FantasyPlayerProfileValueHistoryViewModel {
  readonly areaPoints: string;
  readonly deltaLabel: string;
  readonly highLabel: string;
  readonly linePoints: string;
  readonly lowLabel: string;
  readonly points: readonly FantasyPlayerProfileValueHistoryPointViewModel[];
}

export interface FantasyPlayerProfileViewModel {
  readonly avatarLabel: string;
  readonly decisionLabel: string;
  readonly decisionSummary: string;
  readonly decisionTitle: string;
  readonly decisionTone: 'positive' | 'warning' | 'neutral';
  readonly id: string;
  readonly keyMetrics: readonly FantasyPlayerProfileKeyMetricViewModel[];
  readonly marketGuidance: string;
  readonly marketTrendLabel: string;
  readonly matchdayPointsLabel: string;
  readonly metaDescription: string;
  readonly name: string;
  readonly pageTitle: string;
  readonly photoPath: string | null;
  readonly priceChangeLabel: string;
  readonly priceChangeTone: 'positive' | 'negative' | 'neutral';
  readonly previousPriceLabel: string;
  readonly priceLabel: string;
  readonly roleLabel: string;
  readonly scoutingNote: string;
  readonly sideLabel: string;
  readonly signals: readonly FantasyPlayerProfileSignalViewModel[];
  readonly teamLogoPath: string | null;
  readonly teamName: string;
  readonly totalPointsLabel: string;
  readonly valueHistory: FantasyPlayerProfileValueHistoryViewModel;
}

export function toFantasyPlayerProfileViewModel(
  player: FantasyPlayer,
): FantasyPlayerProfileViewModel {
  const priceChange = player.price - player.previousPrice;
  const budgetShare = player.price / FANTASY_TEAM_INITIAL_BUDGET;
  const pointsPerMillion =
    player.pointsTotal > 0 ? player.pointsTotal / (player.price / 1_000_000) : null;
  const decision = toDecisionViewModel(
    priceChange,
    budgetShare,
    player.pointsTotal,
    player.pointsMatchday,
    pointsPerMillion,
  );

  return {
    avatarLabel: player.avatar,
    decisionLabel: decision.decisionLabel,
    decisionSummary: decision.decisionSummary,
    decisionTitle: decision.decisionTitle,
    decisionTone: decision.decisionTone,
    id: player.id,
    keyMetrics: buildKeyMetrics(player, priceChange, budgetShare, pointsPerMillion),
    marketGuidance: `Se gestiona desde el mercado de tu liga. ${toMarketGuidance(priceChange)}`,
    marketTrendLabel: toMarketTrendLabel(priceChange),
    matchdayPointsLabel: formatFantasyPoints(player.pointsMatchday),
    metaDescription: `Consulta el valor, la evolución reciente y las señales de compra de ${player.name} en el fantasy de KingsPadelLeague.`,
    name: player.name,
    pageTitle: `${player.name} | Fantasy | KingsPadelLeague`,
    photoPath: player.photoPath,
    priceChangeLabel: formatFantasySignedMoneyDifference(player.price, player.previousPrice),
    priceChangeTone: toPriceChangeTone(priceChange),
    previousPriceLabel: formatFantasyMoney(player.previousPrice),
    priceLabel: formatFantasyMoney(player.price),
    roleLabel: player.roleLabel,
    scoutingNote: player.scoutingNote,
    sideLabel: player.sideLabel,
    signals: buildSignals(player, priceChange, budgetShare, pointsPerMillion),
    teamLogoPath: player.teamLogoPath,
    teamName: player.teamName,
    totalPointsLabel: formatFantasyPoints(player.pointsTotal),
    valueHistory: toValueHistoryViewModel(player.priceHistory, player.previousPrice, player.price),
  };
}

function buildKeyMetrics(
  player: FantasyPlayer,
  priceChange: number,
  budgetShare: number,
  pointsPerMillion: number | null,
): readonly FantasyPlayerProfileKeyMetricViewModel[] {
  return [
    {
      id: 'current-price',
      label: 'Precio actual',
      supportingText: `Venía de ${formatFantasyMoney(player.previousPrice)} en el último corte.`,
      tone: 'neutral',
      value: formatFantasyMoney(player.price),
    },
    {
      id: 'price-change',
      label: 'Variación',
      supportingText: toMarketTrendLabel(priceChange),
      tone: toPriceChangeTone(priceChange),
      value: formatFantasySignedMoneyDifference(player.price, player.previousPrice),
    },
    {
      id: 'total-points',
      label: 'Total fantasy',
      supportingText: 'Lo que ya ha devuelto en puntos a lo largo de la temporada.',
      tone: 'neutral',
      value: formatFantasyPoints(player.pointsTotal),
    },
    {
      id: 'matchday-points',
      label: 'Última jornada',
      supportingText: 'Pulso más reciente para medir si viene en tramo caliente.',
      tone: player.pointsMatchday >= 7 ? 'positive' : 'neutral',
      value: formatFantasyPoints(player.pointsMatchday),
    },
    {
      id: 'profitability',
      label: 'Rentabilidad',
      supportingText: toPointsPerMillionSupportingText(pointsPerMillion),
      tone: toProfitabilityTone(pointsPerMillion),
      value: toPointsPerMillionLabel(pointsPerMillion),
    },
    {
      id: 'budget-share',
      label: 'Peso en presupuesto',
      supportingText: toBudgetShareSupportingText(budgetShare),
      tone: toBudgetShareMetricTone(budgetShare),
      value: `${formatPercentage(budgetShare * 100)} %`,
    },
  ];
}

function buildSignals(
  player: FantasyPlayer,
  priceChange: number,
  budgetShare: number,
  pointsPerMillion: number | null,
): readonly FantasyPlayerProfileSignalViewModel[] {
  return [
    {
      id: 'market-moment',
      title: 'Precio',
      value: toMarketTrendLabel(priceChange),
      description: toMarketGuidance(priceChange),
      tone: priceChange < 0 ? 'positive' : priceChange > 0 ? 'warning' : 'neutral',
    },
    {
      id: 'profitability',
      title: 'Rentabilidad',
      value: toReturnSignalValue(pointsPerMillion, player.pointsTotal),
      description: toReturnSignalDescription(pointsPerMillion, player.pointsTotal),
      tone: toSignalToneFromProfitability(pointsPerMillion, player.pointsTotal),
    },
    {
      id: 'budget-fit',
      title: 'Presupuesto',
      value: toBudgetFitValue(budgetShare),
      description: `Consume ${formatPercentage(budgetShare * 100)} % del presupuesto inicial.`,
      tone: toBudgetFitTone(budgetShare),
    },
  ];
}

function toDecisionViewModel(
  priceChange: number,
  budgetShare: number,
  pointsTotal: number,
  pointsMatchday: number,
  pointsPerMillion: number | null,
): Pick<
  FantasyPlayerProfileViewModel,
  'decisionLabel' | 'decisionSummary' | 'decisionTitle' | 'decisionTone'
> {
  let score = 0;

  if (priceChange < 0) {
    score += 2;
  } else if (priceChange > 0) {
    score -= 1;
  }

  if (pointsPerMillion === null) {
    score -= 1;
  } else if (pointsPerMillion >= 7) {
    score += 2;
  } else if (pointsPerMillion >= 4.5) {
    score += 1;
  } else {
    score -= 1;
  }

  if (budgetShare <= 0.18) {
    score += 1;
  } else if (budgetShare >= 0.28) {
    score -= 1;
  }

  if (pointsMatchday >= 7) {
    score += 1;
  } else if (pointsMatchday === 0 && pointsTotal === 0) {
    score -= 1;
  }

  if (score >= 3) {
    return {
      decisionLabel: 'Momento favorable',
      decisionSummary:
        'El precio acompaña y el retorno fantasy ya justifica el coste. Encaja bien como entrada directa de mercado.',
      decisionTitle: 'Compra ahora',
      decisionTone: 'positive',
    };
  }

  if (score >= 1) {
    return {
      decisionLabel: 'Movimiento fino',
      decisionSummary:
        'No es un fichaje automático, pero tiene argumentos para entrar si te cuadra el hueco y el saldo.',
      decisionTitle: 'Compra selectiva',
      decisionTone: 'neutral',
    };
  }

  return {
    decisionLabel: 'Compra con freno',
    decisionSummary:
      'Ahora mismo pagas un coste exigente o todavía no ha convertido suficiente valor en puntos para justificar la entrada.',
    decisionTitle: 'Espera mercado',
    decisionTone: 'warning',
  };
}

function toValueHistoryViewModel(
  history: readonly FantasyPlayerValueHistoryPoint[],
  previousPrice: number,
  currentPrice: number,
): FantasyPlayerProfileValueHistoryViewModel {
  const resolvedHistory =
    history.length > 0
      ? history
      : [
          { label: 'Ayer', value: previousPrice },
          { label: 'Hoy', value: currentPrice },
        ];
  const values = resolvedHistory.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = Math.max(maxValue - minValue, 1);
  const chartWidth = HISTORY_CHART_WIDTH - HISTORY_CHART_PADDING_X * 2;
  const chartHeight = HISTORY_CHART_HEIGHT - HISTORY_CHART_PADDING_Y * 2;
  const stepX = resolvedHistory.length === 1 ? 0 : chartWidth / (resolvedHistory.length - 1);
  const points = resolvedHistory.map((point, index) => {
    const normalizedY =
      maxValue === minValue
        ? HISTORY_CHART_HEIGHT / 2
        : HISTORY_CHART_HEIGHT -
          HISTORY_CHART_PADDING_Y -
          ((point.value - minValue) / valueRange) * chartHeight;

    return {
      id: `${point.label}-${index + 1}`,
      isCurrent: index === resolvedHistory.length - 1,
      label: point.label,
      priceLabel: formatFantasyMoney(point.value),
      value: point.value,
      x: roundChartCoordinate(HISTORY_CHART_PADDING_X + index * stepX),
      y: roundChartCoordinate(normalizedY),
    };
  });
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ');
  const areaPoints =
    firstPoint && lastPoint
      ? `${firstPoint.x},${HISTORY_CHART_HEIGHT - HISTORY_CHART_PADDING_Y} ${linePoints} ${lastPoint.x},${HISTORY_CHART_HEIGHT - HISTORY_CHART_PADDING_Y}`
      : '';

  return {
    areaPoints,
    deltaLabel:
      firstPoint && lastPoint
        ? formatFantasySignedMoneyDifference(lastPoint.value, firstPoint.value)
        : 'Sin cambios',
    highLabel: formatFantasyMoney(maxValue),
    linePoints,
    lowLabel: formatFantasyMoney(minValue),
    points,
  };
}

function toPriceChangeTone(priceChange: number): FantasyPlayerProfileViewModel['priceChangeTone'] {
  if (priceChange > 0) {
    return 'positive';
  }

  if (priceChange < 0) {
    return 'negative';
  }

  return 'neutral';
}

function toMarketTrendLabel(priceChange: number): string {
  if (priceChange > 0) {
    return 'Sube de valor';
  }

  if (priceChange < 0) {
    return 'Baja de valor';
  }

  return 'Precio estable';
}

function toMarketGuidance(priceChange: number): string {
  if (priceChange > 0) {
    return 'Está ganando tracción en el mercado y puede encarecerse antes del siguiente corte.';
  }

  if (priceChange < 0) {
    return 'Ha corregido precio y puede ser una ventana útil para entrar sin quemar tanto saldo.';
  }

  return 'Mantiene un precio estable y sirve para construir plantilla con menos volatilidad.';
}

function toPointsPerMillionLabel(pointsPerMillion: number | null): string {
  if (pointsPerMillion === null) {
    return 'Sin retorno';
  }

  return `${ratioFormatter.format(pointsPerMillion)} pts/M €`;
}

function toPointsPerMillionSupportingText(pointsPerMillion: number | null): string {
  if (pointsPerMillion === null) {
    return 'Todavía no tiene suficiente producción para medir retorno.';
  }

  return 'Cuántos puntos te devuelve por cada millón invertido.';
}

function toProfitabilityTone(
  pointsPerMillion: number | null,
): FantasyPlayerProfileKeyMetricViewModel['tone'] {
  if (pointsPerMillion === null) {
    return 'neutral';
  }

  if (pointsPerMillion >= 7) {
    return 'positive';
  }

  if (pointsPerMillion < 4.5) {
    return 'negative';
  }

  return 'neutral';
}

function toReturnSignalValue(pointsPerMillion: number | null, pointsTotal: number): string {
  if (pointsPerMillion === null || pointsTotal === 0) {
    return 'Histórico por construir';
  }

  if (pointsPerMillion >= 7) {
    return 'Rentabilidad alta';
  }

  if (pointsPerMillion >= 4.5) {
    return 'Rentabilidad media';
  }

  return 'Rentabilidad exigida';
}

function toReturnSignalDescription(pointsPerMillion: number | null, pointsTotal: number): string {
  if (pointsPerMillion === null || pointsTotal === 0) {
    return 'Tiene poco histórico acumulado, así que el precio manda más que la producción.';
  }

  if (pointsPerMillion >= 7) {
    return 'Está convirtiendo muy bien el precio en puntos y soporta mejor una compra agresiva.';
  }

  if (pointsPerMillion >= 4.5) {
    return 'Devuelve puntos a un ritmo correcto, pero conviene no pagar de más por impulso.';
  }

  return 'Necesita producir más para justificar lo que cuesta ahora mismo.';
}

function toSignalToneFromProfitability(
  pointsPerMillion: number | null,
  pointsTotal: number,
): FantasyPlayerProfileSignalViewModel['tone'] {
  if (pointsPerMillion === null || pointsTotal === 0) {
    return 'neutral';
  }

  if (pointsPerMillion >= 7) {
    return 'positive';
  }

  if (pointsPerMillion < 4.5) {
    return 'warning';
  }

  return 'neutral';
}

function toBudgetFitValue(budgetShare: number): string {
  if (budgetShare <= 0.18) {
    return 'Compra ligera';
  }

  if (budgetShare >= 0.28) {
    return 'Apuesta premium';
  }

  return 'Encaje equilibrado';
}

function toBudgetFitTone(budgetShare: number): FantasyPlayerProfileSignalViewModel['tone'] {
  if (budgetShare <= 0.18) {
    return 'positive';
  }

  if (budgetShare >= 0.28) {
    return 'warning';
  }

  return 'neutral';
}

function toBudgetShareSupportingText(budgetShare: number): string {
  if (budgetShare <= 0.18) {
    return 'Coste ligero para completar rotación o fondo de plantilla.';
  }

  if (budgetShare >= 0.28) {
    return 'Te obliga a construir el resto del equipo con bastante más precisión.';
  }

  return 'Se mueve en una franja sana si buscas equilibrio de plantilla.';
}

function toBudgetShareMetricTone(
  budgetShare: number,
): FantasyPlayerProfileKeyMetricViewModel['tone'] {
  if (budgetShare <= 0.18) {
    return 'positive';
  }

  if (budgetShare >= 0.28) {
    return 'negative';
  }

  return 'neutral';
}

function formatPercentage(value: number): string {
  return percentageFormatter.format(value);
}

function roundChartCoordinate(value: number): number {
  return Math.round(value * 10) / 10;
}

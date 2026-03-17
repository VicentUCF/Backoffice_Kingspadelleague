import { type FantasyPlayer } from '@features/fantasy/domain/entities/fantasy.models';

import {
  formatFantasyMoney,
  formatFantasyPoints,
  formatFantasySignedMoneyDifference,
} from './fantasy-number.formatter';

export interface FantasyPlayerProfileViewModel {
  readonly avatarLabel: string;
  readonly id: string;
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
  readonly teamLogoPath: string | null;
  readonly teamName: string;
  readonly totalPointsLabel: string;
}

export function toFantasyPlayerProfileViewModel(
  player: FantasyPlayer,
): FantasyPlayerProfileViewModel {
  const priceChange = player.price - player.previousPrice;

  return {
    avatarLabel: player.avatar,
    id: player.id,
    marketGuidance: `Se gestiona desde el mercado de tu liga. ${toMarketGuidance(priceChange)}`,
    marketTrendLabel: toMarketTrendLabel(priceChange),
    matchdayPointsLabel: formatFantasyPoints(player.pointsMatchday),
    metaDescription: `Consulta el valor inicial, el rol y la situación de mercado de ${player.name} dentro del fantasy de KingsPadelLeague.`,
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
    teamLogoPath: player.teamLogoPath,
    teamName: player.teamName,
    totalPointsLabel: formatFantasyPoints(player.pointsTotal),
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
    return 'Está ganando tracción en el mercado y puede encarecerse antes del arranque oficial.';
  }

  if (priceChange < 0) {
    return 'Ha corregido precio y puede ser una ventana útil para completar rotación sin gastar de más.';
  }

  return 'Mantiene un precio estable y sirve para construir plantilla con menos volatilidad.';
}

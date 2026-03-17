import {
  type FantasyHomeMarketSection,
  type FantasyLeagueResults,
  type FantasyMarketMover,
  type FantasyResultsAward,
  type FantasyResultsPlayerLine,
  type FantasyResultsRankingEntry,
  type FantasyResultsRivalComparison,
} from '@features/fantasy/domain/entities/fantasy.models';

import {
  formatFantasyMoney,
  formatFantasyPoints,
  formatFantasyRank,
  formatFantasySignedMoneyDifference,
} from './fantasy-number.formatter';

export interface FantasyLeagueResultsActionViewModel {
  readonly href: string;
  readonly label: string;
}

export interface FantasyLeagueResultsHeroViewModel {
  readonly actions: readonly FantasyLeagueResultsActionViewModel[];
  readonly captainName: string | null;
  readonly captainPointsLabel: string | null;
  readonly headline: string;
  readonly matchdayPointsLabel: string;
  readonly predictionBonusLabel: string;
  readonly predictionHitsLabel: string;
  readonly predictionLockedMessage: string;
  readonly rankChangeLabel: string;
  readonly rankChangeTone: 'neutral' | 'positive' | 'warning';
  readonly rankLabel: string;
  readonly sundayChangeNote: string | null;
  readonly summary: string;
  readonly totalPointsLabel: string;
  readonly weekLabel: string;
}

export interface FantasyLeagueResultsRankingEntryViewModel {
  readonly isMe: boolean;
  readonly managerName: string;
  readonly matchdayPointsLabel: string;
  readonly movementLabel: string;
  readonly movementTone: 'neutral' | 'positive' | 'warning';
  readonly rankLabel: string;
  readonly teamName: string;
}

export interface FantasyLeagueResultsPlayerLineViewModel {
  readonly avatar: string;
  readonly captainLabel: string | null;
  readonly detailLink: string;
  readonly name: string;
  readonly photoPath: string | null;
  readonly pointsLabel: string;
  readonly priceChangeLabel: string;
  readonly priceChangeTone: 'negative' | 'neutral' | 'positive';
  readonly teamLogoPath: string | null;
  readonly teamName: string;
}

export interface FantasyLeagueResultsAwardViewModel {
  readonly highlight: string;
  readonly id: string;
  readonly supportingText: string;
  readonly title: string;
  readonly tone: FantasyResultsAward['tone'];
  readonly winnerName: string;
}

export interface FantasyLeagueResultsRivalComparisonViewModel {
  readonly pointsDeltaLabel: string;
  readonly pointsDeltaTone: 'negative' | 'positive';
  readonly rivalManagerName: string;
  readonly rivalTeamName: string;
  readonly summary: string;
}

export interface FantasyLeagueResultsMarketMoverViewModel {
  readonly avatar: string;
  readonly detailLink: string;
  readonly name: string;
  readonly photoPath: string | null;
  readonly priceChangeLabel: string;
  readonly priceChangeTone: 'negative' | 'neutral' | 'positive';
  readonly priceLabel: string;
  readonly recentPointsLabel: string;
  readonly teamLogoPath: string | null;
  readonly teamName: string;
}

export interface FantasyLeagueResultsMarketSectionViewModel {
  readonly description: string;
  readonly id: string;
  readonly movers: readonly FantasyLeagueResultsMarketMoverViewModel[];
  readonly title: string;
}

export interface FantasyLeagueResultsPageViewModel {
  readonly hero: FantasyLeagueResultsHeroViewModel;
  readonly leagueName: string;
  readonly marketSections: readonly FantasyLeagueResultsMarketSectionViewModel[];
  readonly myTeamName: string;
  readonly overviewLink: string;
  readonly playerLines: readonly FantasyLeagueResultsPlayerLineViewModel[];
  readonly ranking: readonly FantasyLeagueResultsRankingEntryViewModel[];
  readonly rankingLink: string;
  readonly resultsLink: string;
  readonly rivalComparisons: readonly FantasyLeagueResultsRivalComparisonViewModel[];
  readonly awards: readonly FantasyLeagueResultsAwardViewModel[];
  readonly teamCreationLink: string;
  readonly teamLink: string;
  readonly marketLink: string;
}

export function toFantasyLeagueResultsPageViewModel(
  results: FantasyLeagueResults,
): FantasyLeagueResultsPageViewModel {
  const leagueId = results.league.id;
  const rankChange = results.previousRank - results.myRank;
  const overviewLink = `/fantasy/leagues/${leagueId}`;
  const teamLink = `/fantasy/leagues/${leagueId}/team`;
  const marketLink = `/fantasy/leagues/${leagueId}/market`;
  const rankingLink = `/fantasy/leagues/${leagueId}/ranking`;
  const resultsLink = `/fantasy/leagues/${leagueId}/results`;
  const teamCreationLink = `/fantasy/leagues/${leagueId}/create-team`;

  return {
    hero: {
      actions: [
        { href: marketLink, label: 'Mercado' },
        { href: teamLink, label: 'Mi equipo' },
        { href: rankingLink, label: 'Clasificación' },
      ],
      captainName: results.captainName,
      captainPointsLabel:
        results.captainPoints === null ? null : formatFantasyPoints(results.captainPoints),
      headline: results.headline,
      matchdayPointsLabel: formatFantasyPoints(results.matchdayPoints),
      predictionBonusLabel: formatFantasyPoints(results.predictionBonusPoints),
      predictionHitsLabel: `${results.predictionHits}/4 aciertos`,
      predictionLockedMessage: results.predictionLockedMessage,
      rankChangeLabel: toRankChangeLabel(rankChange),
      rankChangeTone: toRankChangeTone(rankChange),
      rankLabel: formatFantasyRank(results.myRank),
      sundayChangeNote: results.sundayChangeNote,
      summary: results.summary,
      totalPointsLabel: formatFantasyPoints(results.totalPoints),
      weekLabel: results.weekLabel,
    },
    leagueName: results.league.name,
    marketSections: results.marketSections.map(toFantasyLeagueResultsMarketSectionViewModel),
    marketLink,
    myTeamName: results.myTeamName,
    overviewLink,
    playerLines: results.playerLines.map(toFantasyLeagueResultsPlayerLineViewModel),
    ranking: results.ranking.map(toFantasyLeagueResultsRankingEntryViewModel),
    rankingLink,
    resultsLink,
    rivalComparisons: results.rivalComparisons.map(toFantasyLeagueResultsRivalComparisonViewModel),
    awards: results.awards.map((award) => ({ ...award })),
    teamCreationLink,
    teamLink,
  };
}

function toFantasyLeagueResultsRankingEntryViewModel(
  entry: FantasyResultsRankingEntry,
): FantasyLeagueResultsRankingEntryViewModel {
  return {
    isMe: entry.isMe,
    managerName: entry.managerName,
    matchdayPointsLabel: formatFantasyPoints(entry.matchdayPoints),
    movementLabel: toMovementLabel(entry.movement),
    movementTone: toRankChangeTone(entry.movement),
    rankLabel: formatFantasyRank(entry.rank),
    teamName: entry.teamName,
  };
}

function toFantasyLeagueResultsPlayerLineViewModel(
  playerLine: FantasyResultsPlayerLine,
): FantasyLeagueResultsPlayerLineViewModel {
  return {
    avatar: playerLine.avatar,
    captainLabel: playerLine.isCaptain ? 'Capitán' : null,
    detailLink: `/fantasy/players/${playerLine.playerId}`,
    name: playerLine.name,
    photoPath: playerLine.photoPath,
    pointsLabel: formatFantasyPoints(playerLine.points),
    priceChangeLabel: formatFantasySignedMoneyDifference(playerLine.priceChange, 0),
    priceChangeTone:
      playerLine.priceChange > 0 ? 'positive' : playerLine.priceChange < 0 ? 'negative' : 'neutral',
    teamLogoPath: playerLine.teamLogoPath,
    teamName: playerLine.teamName,
  };
}

function toFantasyLeagueResultsRivalComparisonViewModel(
  comparison: FantasyResultsRivalComparison,
): FantasyLeagueResultsRivalComparisonViewModel {
  return {
    pointsDeltaLabel: `${comparison.pointsDelta > 0 ? '+' : ''}${formatFantasyPoints(comparison.pointsDelta)}`,
    pointsDeltaTone: comparison.pointsDelta >= 0 ? 'positive' : 'negative',
    rivalManagerName: comparison.rivalManagerName,
    rivalTeamName: comparison.rivalTeamName,
    summary: comparison.summary,
  };
}

function toFantasyLeagueResultsMarketSectionViewModel(
  section: FantasyHomeMarketSection,
): FantasyLeagueResultsMarketSectionViewModel {
  return {
    id: section.id,
    title: section.title,
    description: section.description,
    movers: section.movers.map(toFantasyLeagueResultsMarketMoverViewModel),
  };
}

function toFantasyLeagueResultsMarketMoverViewModel(
  mover: FantasyMarketMover,
): FantasyLeagueResultsMarketMoverViewModel {
  return {
    avatar: mover.avatar,
    detailLink: `/fantasy/players/${mover.playerId}`,
    name: mover.name,
    photoPath: mover.photoPath,
    priceChangeLabel: formatFantasySignedMoneyDifference(
      mover.currentPrice,
      mover.currentPrice - mover.priceChange,
    ),
    priceChangeTone:
      mover.priceChange > 0 ? 'positive' : mover.priceChange < 0 ? 'negative' : 'neutral',
    priceLabel: formatFantasyMoney(mover.currentPrice),
    recentPointsLabel: mover.recentPoints.map((points) => formatFantasyPoints(points)).join(' · '),
    teamLogoPath: mover.teamLogoPath,
    teamName: mover.teamName,
  };
}

function toMovementLabel(value: number): string {
  if (value > 0) {
    return `+${value}`;
  }

  if (value < 0) {
    return `${value}`;
  }

  return '=';
}

function toRankChangeLabel(value: number): string {
  if (value > 0) {
    return `Subes ${value} posición${value === 1 ? '' : 'es'}`;
  }

  if (value < 0) {
    return `Caes ${Math.abs(value)} posición${value === -1 ? '' : 'es'}`;
  }

  return 'Mantienes posición';
}

function toRankChangeTone(value: number): FantasyLeagueResultsHeroViewModel['rankChangeTone'] {
  if (value > 0) {
    return 'positive';
  }

  if (value < 0) {
    return 'warning';
  }

  return 'neutral';
}

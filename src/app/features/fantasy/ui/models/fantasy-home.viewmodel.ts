import {
  type FantasyHomeExperience,
  type FantasyHomeMarketSection,
  type FantasyMarketMover,
  type FantasyWeeklyFeedEntry,
  type FantasyWeeklyPhase,
} from '@features/fantasy/domain/entities/fantasy.models';

import {
  toFantasyLeagueCardsViewModel,
  type FantasyLeagueCardViewModel,
} from './fantasy-leagues.viewmodel';
import {
  formatFantasyPoints,
  formatFantasyRank,
  formatFantasySignedMoneyDifference,
} from './fantasy-number.formatter';

export interface FantasyHomeActionViewModel {
  readonly href: string;
  readonly label: string;
  readonly tone: 'primary' | 'secondary';
}

export interface FantasyHomeMetricViewModel {
  readonly label: string;
  readonly supportingText: string;
  readonly tone: 'neutral' | 'positive' | 'warning';
  readonly value: string;
}

export interface FantasyHomeCountdownViewModel {
  readonly isUrgent: boolean;
  readonly label: string;
  readonly targetIso: string | null;
}

export interface FantasyHomePredictionOutcomeViewModel {
  readonly bonusLabel: string;
  readonly headline: string;
  readonly hitsLabel: string;
  readonly lockedMessage: string;
  readonly sundayChangeNote: string | null;
}

export interface FantasyHomeTeamSummaryViewModel {
  readonly captainLabel: string;
  readonly subtitle: string;
  readonly teamName: string;
}

export interface FantasyHomeMarketMoverViewModel {
  readonly avatar: string;
  readonly detailLink: string;
  readonly name: string;
  readonly photoPath: string | null;
  readonly priceChangeLabel: string;
  readonly priceChangeTone: 'negative' | 'neutral' | 'positive';
  readonly recentPointsLabel: string;
  readonly teamLogoPath: string | null;
  readonly teamName: string;
}

export interface FantasyHomeMarketSectionViewModel {
  readonly description: string;
  readonly id: string;
  readonly movers: readonly FantasyHomeMarketMoverViewModel[];
  readonly title: string;
}

export interface FantasyHomeFeedEntryViewModel {
  readonly accentLabel: string;
  readonly actorName: string;
  readonly detail: string;
  readonly headline: string;
  readonly id: string;
  readonly relativeTimeLabel: string;
  readonly tone: 'brand' | 'neutral' | 'warning';
}

export interface FantasyHomePrimaryLeagueViewModel {
  readonly actions: readonly FantasyHomeActionViewModel[];
  readonly countdown: FantasyHomeCountdownViewModel | null;
  readonly leagueCode: string;
  readonly leagueName: string;
  readonly marketSections: readonly FantasyHomeMarketSectionViewModel[];
  readonly marketLink: string;
  readonly overviewLink: string;
  readonly phase: FantasyWeeklyPhase;
  readonly phaseLabel: string;
  readonly predictionOutcome: FantasyHomePredictionOutcomeViewModel | null;
  readonly rankingLink: string;
  readonly resultsLink: string;
  readonly secondaryNote: string;
  readonly statusMetrics: readonly FantasyHomeMetricViewModel[];
  readonly summary: string;
  readonly teamDraftLink: string;
  readonly teamLink: string;
  readonly teamSummary: FantasyHomeTeamSummaryViewModel;
  readonly title: string;
  readonly weeklyFeed: readonly FantasyHomeFeedEntryViewModel[];
}

export interface FantasyHomePageViewModel {
  readonly primaryLeague: FantasyHomePrimaryLeagueViewModel;
  readonly secondaryLeagues: readonly FantasyLeagueCardViewModel[];
}

export function toFantasyHomePageViewModel(
  experience: FantasyHomeExperience,
): FantasyHomePageViewModel | null {
  const primaryLeague = experience.primaryLeague;

  if (!primaryLeague) {
    return null;
  }

  const leagueId = primaryLeague.league.id;
  const leagueLinks = buildFantasyHomeLeagueLinks(leagueId);
  const phase = primaryLeague.weeklyCycle.phase;
  const rankChange =
    primaryLeague.impactSummary.previousRank - primaryLeague.impactSummary.currentRank;
  const predictionOutcome = primaryLeague.weeklyCycle.predictionOutcome;

  return {
    primaryLeague: {
      actions: buildFantasyHomeActions(phase, leagueLinks),
      countdown: primaryLeague.weeklyCycle.countdown
        ? {
            isUrgent: primaryLeague.weeklyCycle.countdown.isUrgent,
            label: primaryLeague.weeklyCycle.countdown.label,
            targetIso: primaryLeague.weeklyCycle.countdown.targetIso,
          }
        : null,
      leagueCode: primaryLeague.league.code,
      leagueName: primaryLeague.league.name,
      marketSections: primaryLeague.marketSections.map(toFantasyHomeMarketSectionViewModel),
      marketLink: leagueLinks.marketLink,
      overviewLink: '/fantasy',
      phase,
      phaseLabel: primaryLeague.weeklyCycle.phaseLabel,
      predictionOutcome: predictionOutcome
        ? {
            bonusLabel: formatFantasyPoints(predictionOutcome.bonusPoints),
            headline:
              phase === 'matchday-finished'
                ? 'Tu bonus de porra ya quedó aplicado'
                : 'Tu bonus de porra ya está cerrado',
            hitsLabel: `${predictionOutcome.hits}/${predictionOutcome.confirmedStarterPlayerIds.length} aciertos`,
            lockedMessage: predictionOutcome.lockedMessage,
            sundayChangeNote: predictionOutcome.sundayChangeNote,
          }
        : null,
      rankingLink: leagueLinks.rankingLink,
      resultsLink: leagueLinks.resultsLink,
      secondaryNote: primaryLeague.weeklyCycle.note,
      statusMetrics: buildFantasyHomeStatusMetrics(primaryLeague, phase, rankChange),
      summary: primaryLeague.weeklyCycle.summary,
      teamDraftLink: leagueLinks.teamDraftLink,
      teamLink: leagueLinks.teamLink,
      teamSummary: {
        captainLabel: primaryLeague.impactSummary.captainName
          ? `Capitán x2 · ${primaryLeague.impactSummary.captainName}`
          : 'Capitán pendiente',
        subtitle:
          phase === 'prediction-open'
            ? 'La alineación que guardes aquí será tu porra del viernes.'
            : 'Ahora ya puedes leer el bonus de porra y decidir el equipo definitivo.',
        teamName: primaryLeague.teamName,
      },
      title: primaryLeague.weeklyCycle.headline,
      weeklyFeed: primaryLeague.feed.map((entry) => ({
        accentLabel: entry.accentLabel,
        actorName: entry.actorName,
        detail: entry.detail,
        headline: entry.headline,
        id: entry.id,
        relativeTimeLabel: entry.relativeTimeLabel,
        tone: toFeedEntryTone(entry.type),
      })),
    },
    secondaryLeagues: toFantasyLeagueCardsViewModel(experience.secondaryLeagues),
  };
}

function buildFantasyHomeActions(
  phase: FantasyWeeklyPhase,
  links: FantasyHomeLeagueLinks,
): readonly FantasyHomeActionViewModel[] {
  switch (phase) {
    case 'prediction-open':
      return [
        { href: links.teamDraftLink, label: 'Hacer porra', tone: 'primary' },
        { href: links.teamLink, label: 'Mi equipo', tone: 'secondary' },
        { href: links.rankingLink, label: 'Clasificación', tone: 'secondary' },
      ];
    case 'lineups-published':
      return [
        { href: links.teamDraftLink, label: 'Editar equipo', tone: 'primary' },
        { href: links.teamLink, label: 'Ver mi equipo', tone: 'secondary' },
        { href: links.marketLink, label: 'Mercado', tone: 'secondary' },
      ];
    case 'team-locked':
      return [
        { href: links.teamLink, label: 'Equipo cerrado', tone: 'primary' },
        { href: links.resultsLink, label: 'Esperar resultados', tone: 'secondary' },
        { href: links.rankingLink, label: 'Clasificación', tone: 'secondary' },
      ];
    case 'matchday-finished':
      return [
        { href: links.resultsLink, label: 'Ver resumen', tone: 'primary' },
        { href: links.teamLink, label: 'Mi equipo', tone: 'secondary' },
        { href: links.marketLink, label: 'Mercado', tone: 'secondary' },
      ];
  }
}

interface FantasyHomeLeagueLinks {
  readonly marketLink: string;
  readonly rankingLink: string;
  readonly resultsLink: string;
  readonly teamDraftLink: string;
  readonly teamLink: string;
}

function buildFantasyHomeLeagueLinks(leagueId: string): FantasyHomeLeagueLinks {
  return {
    marketLink: `/fantasy/leagues/${leagueId}/market`,
    rankingLink: `/fantasy/leagues/${leagueId}/ranking`,
    resultsLink: `/fantasy/leagues/${leagueId}/results`,
    teamDraftLink: `/fantasy/leagues/${leagueId}/create-team`,
    teamLink: `/fantasy/leagues/${leagueId}/team`,
  };
}

function buildFantasyHomeStatusMetrics(
  experience: FantasyHomeExperience['primaryLeague'],
  phase: FantasyWeeklyPhase,
  rankChange: number,
): readonly FantasyHomeMetricViewModel[] {
  if (!experience) {
    return [];
  }

  const baseMetrics: FantasyHomeMetricViewModel[] = [
    {
      label: 'Posición',
      supportingText: 'Tu lugar actual en la liga.',
      tone: toRankChangeTone(rankChange),
      value: formatFantasyRank(experience.impactSummary.currentRank),
    },
    {
      label: 'Última jornada',
      supportingText: 'Puntos que llegas arrastrando.',
      tone: 'neutral',
      value: formatFantasyPoints(experience.impactSummary.lastMatchdayPoints),
    },
    {
      label: 'Movimiento',
      supportingText: 'Comparado con la semana anterior.',
      tone: toRankChangeTone(rankChange),
      value: toRankChangeLabel(rankChange),
    },
  ];

  if (phase === 'prediction-open' || phase === 'lineups-published') {
    return baseMetrics;
  }

  const predictionOutcome = experience.weeklyCycle.predictionOutcome;

  return [
    {
      label: 'Fantasy',
      supportingText: 'Lo que sumó tu equipo en pista.',
      tone: 'neutral',
      value: formatFantasyPoints(experience.impactSummary.lastMatchdayPoints),
    },
    {
      label: 'Bonus porra',
      supportingText: 'Acierto fijado con las alineaciones del viernes.',
      tone: predictionOutcome?.bonusPoints ? 'positive' : 'neutral',
      value: formatFantasyPoints(predictionOutcome?.bonusPoints ?? 0),
    },
    {
      label: 'Posición',
      supportingText: 'Cómo te deja la jornada en la liga.',
      tone: toRankChangeTone(rankChange),
      value: formatFantasyRank(experience.impactSummary.currentRank),
    },
  ];
}

function toFantasyHomeMarketSectionViewModel(
  section: FantasyHomeMarketSection,
): FantasyHomeMarketSectionViewModel {
  return {
    description: section.description,
    id: section.id,
    movers: section.movers.map(toFantasyHomeMarketMoverViewModel),
    title: section.title,
  };
}

function toFantasyHomeMarketMoverViewModel(
  mover: FantasyMarketMover,
): FantasyHomeMarketMoverViewModel {
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
    recentPointsLabel: mover.recentPoints.map((points) => formatFantasyPoints(points)).join(' · '),
    teamLogoPath: mover.teamLogoPath,
    teamName: mover.teamName,
  };
}

function toRankChangeLabel(value: number): string {
  if (value > 0) {
    return `+${value} posición${value === 1 ? '' : 'es'}`;
  }

  if (value < 0) {
    return `${value} posición${value === -1 ? '' : 'es'}`;
  }

  return 'Sin cambio';
}

function toRankChangeTone(value: number): FantasyHomeMetricViewModel['tone'] {
  if (value > 0) {
    return 'positive';
  }

  if (value < 0) {
    return 'warning';
  }

  return 'neutral';
}

function toFeedEntryTone(
  type: FantasyWeeklyFeedEntry['type'],
): FantasyHomeFeedEntryViewModel['tone'] {
  switch (type) {
    case 'signing':
      return 'brand';
    case 'captain':
      return 'warning';
    default:
      return 'neutral';
  }
}

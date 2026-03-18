import { type FantasyLeague } from '@features/fantasy/domain/entities/fantasy.models';

import {
  formatFantasyMemberCount,
  formatFantasyPoints,
  formatFantasyRank,
} from './fantasy-number.formatter';

export interface FantasyLeagueCardViewModel {
  readonly code: string;
  readonly dashboardLink: string;
  readonly id: string;
  readonly marketLink: string;
  readonly memberCountLabel: string;
  readonly myPointsLabel: string;
  readonly myRankLabel: string;
  readonly name: string;
  readonly phaseLabel: string;
  readonly rankingLink: string;
  readonly teamLink: string;
}

export function toFantasyLeagueCardsViewModel(
  leagues: readonly FantasyLeague[],
): readonly FantasyLeagueCardViewModel[] {
  return leagues.map((league) => ({
    code: league.code,
    dashboardLink: '/fantasy',
    id: league.id,
    marketLink: `/fantasy/leagues/${league.id}/market`,
    memberCountLabel: formatFantasyMemberCount(league.memberCount),
    myPointsLabel: formatFantasyPoints(league.myPoints),
    myRankLabel: formatFantasyRank(league.myRank),
    name: league.name,
    phaseLabel: toFantasyLeaguePhaseLabel(league.phase),
    rankingLink: `/fantasy/leagues/${league.id}/ranking`,
    teamLink: `/fantasy/leagues/${league.id}/team`,
  }));
}

function toFantasyLeaguePhaseLabel(phase: FantasyLeague['phase']): string {
  switch (phase) {
    case 'market-open':
      return 'Mercado abierto';
    case 'market-locked':
      return 'Mercado bloqueado';
    default:
      return 'Pretemporada';
  }
}

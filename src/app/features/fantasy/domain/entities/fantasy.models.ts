import { type PlayerSide } from '@features/players/domain/entities/player.entity';

export type FantasyLeaguePhase = 'preseason' | 'market-open' | 'market-locked';

export interface FantasyLeague {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly memberCount: number;
  readonly myRank: number;
  readonly myPoints: number;
  readonly phase: FantasyLeaguePhase;
}

export interface FantasyTeamPlayer {
  readonly playerId: string;
  readonly isStarter: boolean;
  readonly isCaptain: boolean;
}

export interface FantasyTeam {
  readonly id: string;
  readonly leagueId: string;
  readonly managerName: string;
  readonly name: string;
  readonly budgetRemaining: number;
  readonly teamValue: number;
  readonly totalPoints: number;
  readonly matchdayPoints: number;
  readonly submittedCaptainId: string | null;
  readonly submittedStarterPlayerIds: readonly string[];
  readonly players: readonly FantasyTeamPlayer[];
}

export interface FantasyPlayer {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly avatar: string;
  readonly photoPath: string | null;
  readonly teamId: string;
  readonly teamName: string;
  readonly teamLogoPath: string | null;
  readonly side: PlayerSide;
  readonly sideLabel: string;
  readonly roleLabel: string;
  readonly scoutingNote: string;
  readonly price: number;
  readonly previousPrice: number;
  readonly pointsMatchday: number;
  readonly pointsTotal: number;
}

export interface FantasyRankingEntry {
  readonly rank: number;
  readonly teamId: string;
  readonly teamName: string;
  readonly managerName: string;
  readonly totalPoints: number;
  readonly matchdayPoints: number;
  readonly teamValue: number;
  readonly isMe: boolean;
}

export interface FantasyLeagueDashboard {
  readonly league: FantasyLeague;
  readonly myTeam: FantasyTeam | null;
  readonly teams: readonly FantasyTeam[];
  readonly ranking: readonly FantasyRankingEntry[];
  readonly players: readonly FantasyPlayer[];
  readonly marketLocked: boolean;
  readonly weeklyCycle: FantasyWeeklyCycle;
}

export type FantasyWeeklyMode = 'prep' | 'results';

export type FantasyWeeklyPhase =
  | 'prediction-open'
  | 'lineups-published'
  | 'team-locked'
  | 'matchday-finished';

export interface FantasyWeeklyCountdown {
  readonly isUrgent: boolean;
  readonly label: string;
  readonly targetIso: string | null;
}

export interface FantasyPredictionOutcome {
  readonly bonusPoints: number;
  readonly confirmedStarterPlayerIds: readonly string[];
  readonly hitPlayerIds: readonly string[];
  readonly hits: number;
  readonly lockedMessage: string;
  readonly sundayChangeNote: string | null;
}

export interface FantasyWeeklyCycle {
  readonly countdown: FantasyWeeklyCountdown | null;
  readonly headline: string;
  readonly note: string;
  readonly officialLineupLabel: string | null;
  readonly phase: FantasyWeeklyPhase;
  readonly phaseLabel: string;
  readonly predictionOutcome: FantasyPredictionOutcome | null;
  readonly summary: string;
}

export interface FantasyMarketMover {
  readonly playerId: string;
  readonly name: string;
  readonly avatar: string;
  readonly photoPath: string | null;
  readonly teamName: string;
  readonly teamLogoPath: string | null;
  readonly currentPrice: number;
  readonly priceChange: number;
  readonly recentPoints: readonly number[];
}

export interface FantasyHomeMarketSection {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly movers: readonly FantasyMarketMover[];
}

export interface FantasyWeeklyFeedEntry {
  readonly id: string;
  readonly type: 'signing' | 'captain' | 'market' | 'ranking';
  readonly actorName: string;
  readonly headline: string;
  readonly detail: string;
  readonly accentLabel: string;
  readonly relativeTimeLabel: string;
}

export interface FantasyHomeImpactSummary {
  readonly currentRank: number;
  readonly previousRank: number;
  readonly totalPoints: number;
  readonly lastMatchdayPoints: number;
  readonly supportingText: string;
  readonly captainPlayerId: string | null;
  readonly captainName: string | null;
  readonly captainPoints: number | null;
}

export interface FantasyHomeNextMatchdaySummary {
  readonly kickoffLabel: string;
  readonly countdownLabel: string;
  readonly changesAvailable: number;
  readonly isUrgent: boolean;
}

export interface FantasyHomePrimaryLeague {
  readonly league: FantasyLeague;
  readonly teamName: string;
  readonly mode: FantasyWeeklyMode;
  readonly headline: string;
  readonly summary: string;
  readonly impactSummary: FantasyHomeImpactSummary;
  readonly nextMatchdaySummary: FantasyHomeNextMatchdaySummary | null;
  readonly marketSections: readonly FantasyHomeMarketSection[];
  readonly feed: readonly FantasyWeeklyFeedEntry[];
  readonly weeklyCycle: FantasyWeeklyCycle;
}

export interface FantasyHomeExperience {
  readonly primaryLeague: FantasyHomePrimaryLeague | null;
  readonly secondaryLeagues: readonly FantasyLeague[];
}

export interface FantasyResultsRankingEntry {
  readonly rank: number;
  readonly teamName: string;
  readonly managerName: string;
  readonly matchdayPoints: number;
  readonly movement: number;
  readonly isMe: boolean;
}

export interface FantasyResultsPlayerLine {
  readonly playerId: string;
  readonly name: string;
  readonly avatar: string;
  readonly photoPath: string | null;
  readonly teamName: string;
  readonly teamLogoPath: string | null;
  readonly points: number;
  readonly isCaptain: boolean;
  readonly priceChange: number;
}

export interface FantasyResultsAward {
  readonly id: string;
  readonly title: string;
  readonly winnerName: string;
  readonly supportingText: string;
  readonly highlight: string;
  readonly tone: 'brand' | 'positive' | 'warning';
}

export interface FantasyResultsRivalComparison {
  readonly rivalManagerName: string;
  readonly rivalTeamName: string;
  readonly pointsDelta: number;
  readonly summary: string;
}

export interface FantasyLeagueResults {
  readonly league: FantasyLeague;
  readonly weekLabel: string;
  readonly headline: string;
  readonly summary: string;
  readonly myTeamName: string;
  readonly myRank: number;
  readonly previousRank: number;
  readonly matchdayPoints: number;
  readonly predictionBonusPoints: number;
  readonly predictionHits: number;
  readonly predictionLockedMessage: string;
  readonly sundayChangeNote: string | null;
  readonly totalPoints: number;
  readonly captainPlayerId: string | null;
  readonly captainName: string | null;
  readonly captainPoints: number | null;
  readonly ranking: readonly FantasyResultsRankingEntry[];
  readonly playerLines: readonly FantasyResultsPlayerLine[];
  readonly awards: readonly FantasyResultsAward[];
  readonly rivalComparisons: readonly FantasyResultsRivalComparison[];
  readonly marketSections: readonly FantasyHomeMarketSection[];
}

export interface CreateFantasyLeagueCommand {
  readonly description: string;
  readonly name: string;
}

export interface SaveFantasyTeamCommand {
  readonly captainId: string | null;
  readonly leagueId: string;
  readonly selectedPlayerIds: readonly string[];
  readonly starterPlayerIds?: readonly string[];
  readonly teamName: string;
}

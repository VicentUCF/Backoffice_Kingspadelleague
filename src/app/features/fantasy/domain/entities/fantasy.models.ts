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
  readonly name: string;
  readonly budgetRemaining: number;
  readonly teamValue: number;
  readonly totalPoints: number;
  readonly matchdayPoints: number;
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
  readonly ranking: readonly FantasyRankingEntry[];
  readonly players: readonly FantasyPlayer[];
  readonly marketLocked: boolean;
}

export interface CreateFantasyLeagueCommand {
  readonly description: string;
  readonly name: string;
}

export interface SaveFantasyTeamCommand {
  readonly leagueId: string;
  readonly teamName: string;
  readonly selectedPlayerIds: readonly string[];
  readonly captainId: string;
}

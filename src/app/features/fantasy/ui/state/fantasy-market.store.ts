import { computed, inject, Injectable, signal } from '@angular/core';

import { FANTASY_TEAM_INITIAL_BUDGET } from '@features/fantasy/domain/services/build-fantasy-team-draft';
import { type FantasyLeagueDashboard } from '@features/fantasy/domain/entities/fantasy.models';
import {
  toFantasyLeagueDashboardViewModel,
  type FantasyLeagueDashboardViewModel,
  type FantasyMarketPlayerViewModel,
} from '@features/fantasy/ui/models/fantasy-league-dashboard.viewmodel';
import {
  ALL_FANTASY_MARKET_SIDES,
  ALL_FANTASY_MARKET_STATUS,
  ALL_FANTASY_MARKET_TEAMS,
  FANTASY_MARKET_SIDE_OPTIONS,
  FANTASY_MARKET_SORT_OPTIONS,
  FANTASY_MARKET_STATUS_OPTIONS,
  buildFantasyMarketTeamOptions,
  coerceFantasyMarketAvailabilityFilter,
  coerceFantasyMarketSideFilter,
  coerceFantasyMarketSort,
  filterFantasyMarketPlayers,
} from '@features/fantasy/ui/models/fantasy-market.filters';
import { formatFantasyMoney } from '@features/fantasy/ui/models/fantasy-number.formatter';
import { LOAD_FANTASY_LEAGUE_DASHBOARD_USE_CASE } from '@features/fantasy/ui/providers/fantasy.providers';

@Injectable()
export class FantasyMarketStore {
  private readonly loadLeagueDashboardUseCase = inject(LOAD_FANTASY_LEAGUE_DASHBOARD_USE_CASE);

  readonly currentLeagueId = signal<string | null>(null);
  readonly dashboard = signal<FantasyLeagueDashboard | null>(null);
  readonly searchQuery = signal('');
  readonly selectedAvailability = signal<string>(ALL_FANTASY_MARKET_STATUS);
  readonly selectedSide = signal<string>(ALL_FANTASY_MARKET_SIDES);
  readonly selectedSort = signal<string>('price-desc');
  readonly selectedTeamId = signal<string>(ALL_FANTASY_MARKET_TEAMS);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly viewModel = computed<FantasyLeagueDashboardViewModel | null>(() => {
    const dashboard = this.dashboard();

    return dashboard ? toFantasyLeagueDashboardViewModel(dashboard) : null;
  });
  readonly filteredPlayers = computed<readonly FantasyMarketPlayerViewModel[]>(() => {
    const viewModel = this.viewModel();

    return viewModel
      ? filterFantasyMarketPlayers(viewModel.marketPlayers, {
          query: this.searchQuery(),
          side: coerceFantasyMarketSideFilter(this.selectedSide()),
          sortBy: coerceFantasyMarketSort(this.selectedSort()),
          status: coerceFantasyMarketAvailabilityFilter(this.selectedAvailability()),
          teamId: this.selectedTeamId(),
        })
      : [];
  });
  readonly budgetRemainingLabel = computed(() => {
    return (
      this.viewModel()?.team?.budgetRemainingLabel ??
      formatFantasyMoney(FANTASY_TEAM_INITIAL_BUDGET)
    );
  });
  readonly teamOptions = computed(() => {
    return this.viewModel()
      ? buildFantasyMarketTeamOptions(this.viewModel()!.marketPlayers)
      : [{ label: 'Todos los equipos', value: ALL_FANTASY_MARKET_TEAMS }];
  });
  readonly sideOptions = FANTASY_MARKET_SIDE_OPTIONS;
  readonly statusOptions = FANTASY_MARKET_STATUS_OPTIONS;
  readonly sortOptions = FANTASY_MARKET_SORT_OPTIONS;
  readonly hasPlayers = computed(() => this.filteredPlayers().length > 0);
  readonly isNotFound = computed(() => {
    return (
      !this.isLoading() &&
      this.currentLeagueId() !== null &&
      this.dashboard() === null &&
      this.errorMessage() === null
    );
  });
  readonly resultsLabel = computed(() => {
    const resultsCount = this.filteredPlayers().length;

    return `${resultsCount} jugadores visibles en el mercado`;
  });
  readonly affordablePlayersCountLabel = computed(() => {
    const affordablePlayersCount = this.filteredPlayers().filter(
      (player) => player.canAfford,
    ).length;

    return `${affordablePlayersCount} encajan en tu presupuesto`;
  });

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setSelectedAvailability(value: string): void {
    this.selectedAvailability.set(value);
  }

  setSelectedSide(value: string): void {
    this.selectedSide.set(value);
  }

  setSelectedSort(value: string): void {
    this.selectedSort.set(value);
  }

  setSelectedTeamId(value: string): void {
    this.selectedTeamId.set(value);
  }

  async load(leagueId: string | null): Promise<void> {
    this.currentLeagueId.set(leagueId);
    this.dashboard.set(null);
    this.searchQuery.set('');
    this.selectedAvailability.set(ALL_FANTASY_MARKET_STATUS);
    this.selectedSide.set(ALL_FANTASY_MARKET_SIDES);
    this.selectedSort.set('price-desc');
    this.selectedTeamId.set(ALL_FANTASY_MARKET_TEAMS);
    this.errorMessage.set(null);

    if (!leagueId) {
      return;
    }

    this.isLoading.set(true);

    try {
      this.dashboard.set(await this.loadLeagueDashboardUseCase.execute(leagueId));
    } catch {
      this.errorMessage.set('No pudimos cargar el mercado fantasy.');
    } finally {
      this.isLoading.set(false);
    }
  }
}

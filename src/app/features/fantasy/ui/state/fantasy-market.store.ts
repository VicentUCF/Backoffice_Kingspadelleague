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
import { SAVE_FANTASY_TEAM_USE_CASE } from '@features/fantasy/ui/providers/fantasy.providers';

export interface FantasyMarketListPlayerViewModel extends FantasyMarketPlayerViewModel {
  readonly actionDisabled: boolean;
  readonly actionHint: string | null;
  readonly actionLabel: string;
}

@Injectable()
export class FantasyMarketStore {
  private readonly loadLeagueDashboardUseCase = inject(LOAD_FANTASY_LEAGUE_DASHBOARD_USE_CASE);
  private readonly saveFantasyTeamUseCase = inject(SAVE_FANTASY_TEAM_USE_CASE);

  readonly currentLeagueId = signal<string | null>(null);
  readonly dashboard = signal<FantasyLeagueDashboard | null>(null);
  readonly searchQuery = signal('');
  readonly selectedAvailability = signal<string>(ALL_FANTASY_MARKET_STATUS);
  readonly selectedSide = signal<string>(ALL_FANTASY_MARKET_SIDES);
  readonly selectedSort = signal<string>('price-desc');
  readonly selectedTeamId = signal<string>(ALL_FANTASY_MARKET_TEAMS);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
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
  readonly marketPlayers = computed<readonly FantasyMarketListPlayerViewModel[]>(() => {
    const currentTeamPlayerIds = new Set(
      this.dashboard()?.myTeam?.players.map((player) => player.playerId) ?? [],
    );
    const teamIsComplete = currentTeamPlayerIds.size >= 6;

    return this.filteredPlayers().map((player) => ({
      ...player,
      actionDisabled:
        this.isSaving() || (!player.isInMyTeam && (teamIsComplete || !player.canAfford)),
      actionHint: resolveMarketActionHint(player, teamIsComplete),
      actionLabel: resolveMarketActionLabel(player, teamIsComplete),
    }));
  });
  readonly ownedPlayers = computed<readonly FantasyMarketListPlayerViewModel[]>(() => {
    const players = this.viewModel()?.marketPlayers ?? [];

    return players
      .filter((player) => player.isInMyTeam)
      .map((player) => ({
        ...player,
        actionDisabled: this.isSaving(),
        actionHint: 'Se quita de tu plantilla actual.',
        actionLabel: 'Vender',
      }));
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
  readonly hasPlayers = computed(() => this.marketPlayers().length > 0);
  readonly hasOwnedPlayers = computed(() => this.ownedPlayers().length > 0);
  readonly isNotFound = computed(() => {
    return (
      !this.isLoading() &&
      this.currentLeagueId() !== null &&
      this.dashboard() === null &&
      this.errorMessage() === null
    );
  });
  readonly resultsLabel = computed(() => {
    const resultsCount = this.marketPlayers().length;

    return `${resultsCount} jugadores visibles en el mercado`;
  });
  readonly affordablePlayersCountLabel = computed(() => {
    const affordablePlayersCount = this.filteredPlayers().filter(
      (player) => player.canAfford,
    ).length;

    return `${affordablePlayersCount} encajan en tu presupuesto`;
  });
  readonly ownedPlayersCountLabel = computed(
    () => `${this.ownedPlayers().length} ya están en tu equipo`,
  );
  readonly canResetFilters = computed(() => {
    return (
      this.searchQuery().trim().length > 0 ||
      this.selectedAvailability() !== ALL_FANTASY_MARKET_STATUS ||
      this.selectedSide() !== ALL_FANTASY_MARKET_SIDES ||
      this.selectedSort() !== 'price-desc' ||
      this.selectedTeamId() !== ALL_FANTASY_MARKET_TEAMS
    );
  });
  readonly teamSlotsLabel = computed(() => {
    const playersCount = this.dashboard()?.myTeam?.players.length ?? 0;

    return `${playersCount}/6 plazas ocupadas`;
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

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedAvailability.set(ALL_FANTASY_MARKET_STATUS);
    this.selectedSide.set(ALL_FANTASY_MARKET_SIDES);
    this.selectedSort.set('price-desc');
    this.selectedTeamId.set(ALL_FANTASY_MARKET_TEAMS);
  }

  async buyPlayer(playerId: string): Promise<boolean> {
    const dashboard = this.dashboard();

    if (!dashboard) {
      return false;
    }

    const currentPlayerIds = dashboard.myTeam?.players.map((player) => player.playerId) ?? [];

    if (currentPlayerIds.includes(playerId) || currentPlayerIds.length >= 6) {
      return false;
    }

    const player = dashboard.players.find((candidate) => candidate.id === playerId);

    if (!player) {
      return false;
    }

    const nextDashboard = await this.persistMarketTeam(
      [...currentPlayerIds, playerId],
      dashboard.myTeam?.name ?? 'Mi equipo fantasy',
    );

    if (nextDashboard) {
      this.dashboard.set(nextDashboard);
      return true;
    }

    return false;
  }

  async sellPlayer(playerId: string): Promise<boolean> {
    const dashboard = this.dashboard();

    if (!dashboard?.myTeam) {
      return false;
    }

    const currentPlayerIds = dashboard.myTeam.players.map((player) => player.playerId);

    if (!currentPlayerIds.includes(playerId)) {
      return false;
    }

    const nextSelectedPlayerIds = currentPlayerIds.filter(
      (selectedPlayerId) => selectedPlayerId !== playerId,
    );
    const nextDashboard = await this.persistMarketTeam(
      nextSelectedPlayerIds,
      dashboard.myTeam.name,
    );

    if (nextDashboard) {
      this.dashboard.set(nextDashboard);
      return true;
    }

    return false;
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
      this.errorMessage.set('No hemos podido cargar el mercado fantasy.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private async persistMarketTeam(
    selectedPlayerIds: readonly string[],
    teamName: string,
  ): Promise<FantasyLeagueDashboard | null> {
    const dashboard = this.dashboard();

    if (!dashboard) {
      return null;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    try {
      const currentCaptainId =
        dashboard.myTeam?.players.find((player) => player.isCaptain)?.playerId ?? null;
      const captainId =
        currentCaptainId && selectedPlayerIds.includes(currentCaptainId)
          ? currentCaptainId
          : (selectedPlayerIds[0] ?? null);
      const nextDashboard = await this.saveFantasyTeamUseCase.execute({
        leagueId: dashboard.league.id,
        teamName,
        selectedPlayerIds,
        captainId,
      });

      if (!nextDashboard) {
        this.errorMessage.set('No hemos podido actualizar tu plantilla desde el mercado.');
        return null;
      }

      return nextDashboard;
    } catch {
      this.errorMessage.set('No hemos podido actualizar tu plantilla desde el mercado.');
      return null;
    } finally {
      this.isSaving.set(false);
    }
  }
}

function resolveMarketActionLabel(
  player: FantasyMarketPlayerViewModel,
  teamIsComplete: boolean,
): string {
  if (player.isInMyTeam) {
    return 'Vender';
  }

  if (teamIsComplete) {
    return 'Plantilla completa';
  }

  return player.canAfford ? 'Comprar' : 'Sin saldo';
}

function resolveMarketActionHint(
  player: FantasyMarketPlayerViewModel,
  teamIsComplete: boolean,
): string | null {
  if (player.isInMyTeam) {
    return 'Se quita de tu plantilla actual.';
  }

  if (teamIsComplete) {
    return 'Vende un jugador para abrir hueco.';
  }

  return player.canAfford ? 'Compra directa desde mercado.' : player.affordabilityLabel;
}

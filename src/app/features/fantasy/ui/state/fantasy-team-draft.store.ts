import { computed, inject, Injectable, signal } from '@angular/core';

import { autoCompleteFantasyDraft } from '@features/fantasy/domain/services/auto-complete-fantasy-draft';
import {
  buildFantasyTeamDraft,
  FANTASY_TEAM_MAX_PLAYERS,
  sanitizeFantasyDraftCaptain,
  toggleFantasyDraftPlayer,
  type FantasyTeamDraftSummary,
} from '@features/fantasy/domain/services/build-fantasy-team-draft';
import { type FantasyLeagueDashboard } from '@features/fantasy/domain/entities/fantasy.models';
import {
  toFantasyLeagueDashboardViewModel,
  type FantasyLeagueDashboardViewModel,
  type FantasyMarketPlayerViewModel,
} from '@features/fantasy/ui/models/fantasy-league-dashboard.viewmodel';
import {
  ALL_FANTASY_MARKET_TEAMS,
  buildFantasyMarketTeamOptions,
} from '@features/fantasy/ui/models/fantasy-market.filters';
import { formatFantasyMoney } from '@features/fantasy/ui/models/fantasy-number.formatter';
import {
  LOAD_FANTASY_LEAGUE_DASHBOARD_USE_CASE,
  SAVE_FANTASY_TEAM_USE_CASE,
} from '@features/fantasy/ui/providers/fantasy.providers';

export interface FantasyDraftPlayerViewModel extends FantasyMarketPlayerViewModel {
  readonly isSelected: boolean;
  readonly selectionDisabled: boolean;
  readonly selectionHint: string | null;
}

@Injectable()
export class FantasyTeamDraftStore {
  private readonly loadLeagueDashboardUseCase = inject(LOAD_FANTASY_LEAGUE_DASHBOARD_USE_CASE);
  private readonly saveFantasyTeamUseCase = inject(SAVE_FANTASY_TEAM_USE_CASE);

  readonly currentLeagueId = signal<string | null>(null);
  readonly dashboard = signal<FantasyLeagueDashboard | null>(null);
  readonly selectedPlayerIds = signal<readonly string[]>([]);
  readonly captainId = signal<string | null>(null);
  readonly teamName = signal('');
  readonly searchQuery = signal('');
  readonly selectedTeamId = signal<string>(ALL_FANTASY_MARKET_TEAMS);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly viewModel = computed<FantasyLeagueDashboardViewModel | null>(() => {
    const dashboard = this.dashboard();

    return dashboard ? toFantasyLeagueDashboardViewModel(dashboard) : null;
  });
  readonly teamOptions = computed(() => {
    return this.viewModel()
      ? buildFantasyMarketTeamOptions(this.viewModel()!.marketPlayers)
      : [{ label: 'Todos los equipos', value: ALL_FANTASY_MARKET_TEAMS }];
  });
  readonly draft = computed<FantasyTeamDraftSummary>(() => {
    return buildFantasyTeamDraft(
      this.dashboard()?.players ?? [],
      this.selectedPlayerIds(),
      this.captainId(),
    );
  });
  readonly allPlayers = computed<readonly FantasyDraftPlayerViewModel[]>(() => {
    const viewModel = this.viewModel();

    if (!viewModel) {
      return [];
    }

    const selectedPlayerIds = this.selectedPlayerIds();
    const draft = this.draft();

    return viewModel.marketPlayers.map((player) => {
      const isSelected = selectedPlayerIds.includes(player.id);

      return {
        ...player,
        isSelected,
        selectionDisabled:
          !isSelected &&
          (draft.selectedPlayersCount >= FANTASY_TEAM_MAX_PLAYERS ||
            player.priceValue > draft.remainingBudget),
        selectionHint: resolveSelectionHint(
          isSelected,
          draft.selectedPlayersCount,
          player.priceValue,
          draft.remainingBudget,
        ),
      };
    });
  });
  readonly players = computed<readonly FantasyDraftPlayerViewModel[]>(() => {
    const normalizedQuery = normalizeDraftSearch(this.searchQuery());

    return this.allPlayers().filter((player) => {
      if (
        this.selectedTeamId() !== ALL_FANTASY_MARKET_TEAMS &&
        player.teamId !== this.selectedTeamId()
      ) {
        return false;
      }

      if (normalizedQuery.length === 0) {
        return true;
      }

      const searchableValues = [player.name, player.teamName, player.roleLabel, player.sideLabel];

      return searchableValues.some((value) =>
        normalizeDraftSearch(value).includes(normalizedQuery),
      );
    });
  });
  readonly captainOptions = computed(() => {
    return this.draft().selectedPlayers.map((player) => ({
      label: player.name,
      value: player.id,
    }));
  });
  readonly selectedPlayers = computed(() => {
    const selectedPlayerIds = this.selectedPlayerIds();

    return this.allPlayers().filter((player) => selectedPlayerIds.includes(player.id));
  });
  readonly summary = computed(() => {
    const viewModel = this.viewModel();
    const draft = this.draft();

    if (!viewModel) {
      return null;
    }

    return {
      canSubmit: draft.canSubmit,
      captainId: draft.captainId,
      captainName: draft.captainName,
      captainStatusLabel: draft.captainName ? `Listo · ${draft.captainName}` : 'Pendiente',
      hasExistingTeam: viewModel.hasTeam,
      heading: viewModel.hasTeam ? 'Ajusta tu plantilla' : 'Crea tu equipo',
      leagueName: viewModel.leagueName,
      remainingBudgetLabel: formatFantasyMoney(draft.remainingBudget),
      selectedPlayersCount: draft.selectedPlayersCount,
      selectedPlayersCountLabel: `${draft.selectedPlayersCount}/${FANTASY_TEAM_MAX_PLAYERS} jugadores`,
      teamName: this.teamName(),
      validationMessage: draft.validationMessage,
    };
  });
  readonly isNotFound = computed(() => {
    return (
      !this.isLoading() &&
      this.currentLeagueId() !== null &&
      this.dashboard() === null &&
      this.errorMessage() === null
    );
  });

  setCaptainId(playerId: string): void {
    this.captainId.set(playerId || null);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setSelectedTeamId(teamId: string): void {
    this.selectedTeamId.set(teamId);
  }

  setTeamName(teamName: string): void {
    this.teamName.set(teamName);
  }

  autoCompleteDraft(): void {
    const dashboard = this.dashboard();

    if (!dashboard) {
      return;
    }

    const nextSelectedPlayerIds = autoCompleteFantasyDraft(
      dashboard.players,
      this.selectedPlayerIds(),
    );

    this.selectedPlayerIds.set(nextSelectedPlayerIds);
    this.captainId.set(
      sanitizeFantasyDraftCaptain(nextSelectedPlayerIds, this.captainId()) ??
        nextSelectedPlayerIds[0] ??
        null,
    );
  }

  clearDraft(): void {
    this.selectedPlayerIds.set([]);
    this.captainId.set(null);
  }

  togglePlayer(playerId: string): void {
    const dashboard = this.dashboard();

    if (!dashboard) {
      return;
    }

    const nextSelectedPlayerIds = toggleFantasyDraftPlayer(
      dashboard.players,
      this.selectedPlayerIds(),
      playerId,
    );

    this.selectedPlayerIds.set(nextSelectedPlayerIds);
    this.captainId.set(sanitizeFantasyDraftCaptain(nextSelectedPlayerIds, this.captainId()));
  }

  async load(leagueId: string | null): Promise<void> {
    this.currentLeagueId.set(leagueId);
    this.dashboard.set(null);
    this.selectedPlayerIds.set([]);
    this.captainId.set(null);
    this.teamName.set('');
    this.searchQuery.set('');
    this.selectedTeamId.set(ALL_FANTASY_MARKET_TEAMS);
    this.errorMessage.set(null);

    if (!leagueId) {
      return;
    }

    this.isLoading.set(true);

    try {
      const dashboard = await this.loadLeagueDashboardUseCase.execute(leagueId);

      this.dashboard.set(dashboard);

      if (dashboard?.myTeam) {
        const initialSelectedPlayerIds = dashboard.myTeam.players.map((player) => player.playerId);
        const initialCaptainId =
          dashboard.myTeam.players.find((player) => player.isCaptain)?.playerId ?? null;

        this.selectedPlayerIds.set(initialSelectedPlayerIds);
        this.captainId.set(initialCaptainId);
        this.teamName.set(dashboard.myTeam.name);
      } else if (dashboard) {
        this.teamName.set('Nuevo equipo fantasy');
      }
    } catch {
      this.errorMessage.set('No pudimos preparar la plantilla fantasy.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async save(): Promise<boolean> {
    const summary = this.summary();
    const captainId = this.captainId();
    const leagueId = this.currentLeagueId();

    if (!summary?.canSubmit || !captainId || !leagueId) {
      return false;
    }

    this.isLoading.set(true);

    try {
      const nextDashboard = await this.saveFantasyTeamUseCase.execute({
        leagueId,
        teamName: this.teamName(),
        selectedPlayerIds: this.selectedPlayerIds(),
        captainId,
      });

      if (!nextDashboard) {
        this.errorMessage.set('No pudimos guardar la plantilla fantasy.');
        return false;
      }

      this.dashboard.set(nextDashboard);
      this.errorMessage.set(null);
      return true;
    } catch {
      this.errorMessage.set('No pudimos guardar la plantilla fantasy.');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }
}

function resolveSelectionHint(
  isSelected: boolean,
  selectedPlayersCount: number,
  playerPrice: number,
  remainingBudget: number,
): string | null {
  if (isSelected) {
    return 'Ya forma parte de tu borrador.';
  }

  if (selectedPlayersCount >= FANTASY_TEAM_MAX_PLAYERS) {
    return 'Plantilla completa.';
  }

  if (playerPrice > remainingBudget) {
    return 'Sin presupuesto suficiente.';
  }

  return null;
}

function normalizeDraftSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

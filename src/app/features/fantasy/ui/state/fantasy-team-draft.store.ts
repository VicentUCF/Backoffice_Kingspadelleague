import { computed, inject, Injectable, signal } from '@angular/core';

import { autoCompleteFantasyDraft } from '@features/fantasy/domain/services/auto-complete-fantasy-draft';
import {
  FANTASY_TEAM_STARTERS_COUNT,
  resolveFantasyLineupValidationMessage,
  sanitizeFantasyTeamStarters,
  toggleFantasyTeamStarter,
} from '@features/fantasy/domain/services/build-fantasy-team-lineup';
import {
  buildFantasyTeamDraft,
  FANTASY_TEAM_MAX_PLAYERS,
  sanitizeFantasyDraftCaptain,
  toggleFantasyDraftPlayer,
  type FantasyTeamDraftSummary,
} from '@features/fantasy/domain/services/build-fantasy-team-draft';
import {
  type FantasyLeagueDashboard,
  type FantasyPredictionOutcome,
} from '@features/fantasy/domain/entities/fantasy.models';
import {
  toFantasyLeagueDashboardViewModel,
  type FantasyLeagueDashboardViewModel,
  type FantasyMarketPlayerViewModel,
} from '@features/fantasy/ui/models/fantasy-league-dashboard.viewmodel';
import {
  ALL_FANTASY_MARKET_TEAMS,
  buildFantasyMarketTeamOptions,
} from '@features/fantasy/ui/models/fantasy-market.filters';
import {
  formatFantasyMoney,
  formatFantasyPoints,
} from '@features/fantasy/ui/models/fantasy-number.formatter';
import {
  LOAD_FANTASY_LEAGUE_DASHBOARD_USE_CASE,
  SAVE_FANTASY_TEAM_USE_CASE,
} from '@features/fantasy/ui/providers/fantasy.providers';

export interface FantasyDraftPlayerViewModel extends FantasyMarketPlayerViewModel {
  readonly isSelected: boolean;
  readonly selectionDisabled: boolean;
  readonly selectionHint: string | null;
}

export interface FantasySelectedRosterPlayerViewModel extends FantasyDraftPlayerViewModel {
  readonly isConfirmedStarter: boolean;
  readonly isStarter: boolean;
  readonly lineupStateLabel: string | null;
  readonly lineupStateTone: 'neutral' | 'positive' | 'warning';
  readonly starterToggleDisabled: boolean;
  readonly starterToggleHint: string | null;
}

interface FantasyTeamDraftPredictionOutcomeViewModel {
  readonly bonusLabel: string;
  readonly hitsLabel: string;
  readonly lockedMessage: string;
  readonly sundayChangeNote: string | null;
}

@Injectable()
export class FantasyTeamDraftStore {
  private readonly loadLeagueDashboardUseCase = inject(LOAD_FANTASY_LEAGUE_DASHBOARD_USE_CASE);
  private readonly saveFantasyTeamUseCase = inject(SAVE_FANTASY_TEAM_USE_CASE);

  readonly currentLeagueId = signal<string | null>(null);
  readonly dashboard = signal<FantasyLeagueDashboard | null>(null);
  readonly selectedPlayerIds = signal<readonly string[]>([]);
  readonly starterPlayerIds = signal<readonly string[]>([]);
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
  readonly selectedPlayers = computed<readonly FantasySelectedRosterPlayerViewModel[]>(() => {
    const playersById = new Map(this.allPlayers().map((player) => [player.id, player] as const));
    const selectedPlayerIds = this.selectedPlayerIds();
    const starterPlayerIds = this.starterPlayerIds();
    const startersCount = starterPlayerIds.length;
    const requiredStarters = Math.min(FANTASY_TEAM_STARTERS_COUNT, selectedPlayerIds.length);
    const confirmedStarterIds = new Set(
      this.dashboard()?.weeklyCycle.predictionOutcome?.confirmedStarterPlayerIds ?? [],
    );
    const submittedStarterIds = new Set(
      this.dashboard()?.myTeam?.submittedStarterPlayerIds ?? starterPlayerIds,
    );

    return selectedPlayerIds.flatMap((playerId) => {
      const player = playersById.get(playerId);

      if (!player) {
        return [];
      }

      const isStarter = starterPlayerIds.includes(playerId);

      return [
        {
          ...player,
          isConfirmedStarter: confirmedStarterIds.has(playerId),
          isStarter,
          lineupStateLabel: resolveLineupStateLabel(
            this.dashboard()?.weeklyCycle.predictionOutcome ?? null,
            submittedStarterIds.has(playerId),
            confirmedStarterIds.has(playerId),
          ),
          lineupStateTone: resolveLineupStateTone(
            this.dashboard()?.weeklyCycle.predictionOutcome ?? null,
            submittedStarterIds.has(playerId),
            confirmedStarterIds.has(playerId),
          ),
          starterToggleDisabled: !isStarter && startersCount >= requiredStarters,
          starterToggleHint: resolveStarterToggleHint(isStarter, startersCount, requiredStarters),
        },
      ];
    });
  });
  readonly summary = computed(() => {
    const viewModel = this.viewModel();
    const draft = this.draft();
    const selectedPlayerIds = this.selectedPlayerIds();
    const starterPlayerIds = this.starterPlayerIds();
    const hasExistingTeam = viewModel?.hasTeam ?? false;
    const weeklyCycle = this.dashboard()?.weeklyCycle ?? null;
    const isLockedPhase =
      weeklyCycle?.phase === 'team-locked' || weeklyCycle?.phase === 'matchday-finished';
    const hasValidExistingLineup = hasExistingTeam
      ? selectedPlayerIds.length > 0 &&
        starterPlayerIds.length ===
          Math.min(FANTASY_TEAM_STARTERS_COUNT, selectedPlayerIds.length) &&
        captainIdIsValid(selectedPlayerIds, starterPlayerIds, this.captainId())
      : false;
    const validationMessage = hasExistingTeam
      ? resolveExistingTeamValidationMessage(
          weeklyCycle?.phase ?? 'prediction-open',
          selectedPlayerIds,
          starterPlayerIds,
          this.captainId(),
        )
      : draft.validationMessage;
    const canSubmit = hasExistingTeam ? !isLockedPhase && hasValidExistingLineup : draft.canSubmit;

    if (!viewModel) {
      return null;
    }

    const predictionOutcome = mapPredictionOutcomeViewModel(weeklyCycle?.predictionOutcome ?? null);
    const flowMode = resolveDraftFlowMode(weeklyCycle?.phase ?? null, hasExistingTeam);

    return {
      canSubmit,
      captainId: draft.captainId,
      captainName: draft.captainName,
      captainStatusLabel: draft.captainName ? `Listo · ${draft.captainName}` : 'Pendiente',
      countdownLabel: weeklyCycle?.countdown?.label ?? null,
      countdownTargetIso: weeklyCycle?.countdown?.targetIso ?? null,
      flowMode,
      hasExistingTeam,
      heading: resolveDraftHeading(flowMode),
      helperText: hasExistingTeam
        ? (weeklyCycle?.summary ?? viewModel.phaseDescription)
        : viewModel.phaseDescription,
      leagueName: viewModel.leagueName,
      phaseLabel: hasExistingTeam ? (weeklyCycle?.phaseLabel ?? 'Plantilla') : 'Alta inicial',
      predictionOutcome,
      poolIntro: resolvePoolIntro(flowMode),
      saveLabel: resolveSaveLabel(flowMode, hasExistingTeam),
      secondaryNote: hasExistingTeam ? (weeklyCycle?.note ?? null) : null,
      startersCount: starterPlayerIds.length,
      startersCountLabel: `${starterPlayerIds.length}/${Math.min(
        FANTASY_TEAM_STARTERS_COUNT,
        selectedPlayerIds.length,
      )} titulares`,
      remainingBudgetLabel: formatFantasyMoney(draft.remainingBudget),
      selectedPlayersCount: draft.selectedPlayersCount,
      selectedPlayersCountLabel: `${draft.selectedPlayersCount}/${FANTASY_TEAM_MAX_PLAYERS} jugadores`,
      teamName: this.teamName(),
      validationMessage,
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

    if (this.viewModel()?.hasTeam) {
      const confirmedStarterPlayerIds =
        dashboard.weeklyCycle.predictionOutcome?.confirmedStarterPlayerIds ?? [];

      this.starterPlayerIds.set(
        confirmedStarterPlayerIds.length
          ? sanitizeFantasyTeamStarters(this.selectedPlayerIds(), confirmedStarterPlayerIds)
          : sanitizeFantasyTeamStarters(this.selectedPlayerIds(), this.starterPlayerIds()),
      );
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
    this.starterPlayerIds.set(
      sanitizeFantasyTeamStarters(nextSelectedPlayerIds, this.starterPlayerIds()),
    );
  }

  clearDraft(): void {
    if (this.viewModel()?.hasTeam) {
      this.starterPlayerIds.set(
        sanitizeFantasyTeamStarters(
          this.selectedPlayerIds(),
          this.dashboard()?.myTeam?.submittedStarterPlayerIds ?? this.selectedPlayerIds(),
        ),
      );
      this.captainId.set(this.dashboard()?.myTeam?.submittedCaptainId ?? this.captainId());
      return;
    }

    this.selectedPlayerIds.set([]);
    this.starterPlayerIds.set([]);
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
    this.starterPlayerIds.set(
      sanitizeFantasyTeamStarters(nextSelectedPlayerIds, this.starterPlayerIds()),
    );
    this.captainId.set(sanitizeFantasyDraftCaptain(nextSelectedPlayerIds, this.captainId()));
  }

  toggleStarter(playerId: string): void {
    this.starterPlayerIds.set(
      toggleFantasyTeamStarter(this.selectedPlayerIds(), this.starterPlayerIds(), playerId),
    );
  }

  async load(leagueId: string | null): Promise<void> {
    this.currentLeagueId.set(leagueId);
    this.dashboard.set(null);
    this.selectedPlayerIds.set([]);
    this.starterPlayerIds.set([]);
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
        const initialStarterPlayerIds = dashboard.myTeam.players
          .filter((player) => player.isStarter)
          .map((player) => player.playerId);

        this.selectedPlayerIds.set(initialSelectedPlayerIds);
        this.starterPlayerIds.set(initialStarterPlayerIds);
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
        starterPlayerIds: this.starterPlayerIds(),
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

function resolveStarterToggleHint(
  isStarter: boolean,
  startersCount: number,
  requiredStarters: number,
): string | null {
  if (isStarter) {
    return 'Sale del bloque titular y pasa a rotación.';
  }

  if (startersCount >= requiredStarters) {
    return 'Quita antes a un titular para meterlo en la alineación.';
  }

  return 'Entra como titular para esta jornada.';
}

function resolveExistingTeamValidationMessage(
  phase: FantasyLeagueDashboard['weeklyCycle']['phase'],
  selectedPlayerIds: readonly string[],
  starterPlayerIds: readonly string[],
  captainId: string | null,
): string {
  if (phase === 'team-locked' || phase === 'matchday-finished') {
    return 'El equipo ya está cerrado. Ahora solo queda esperar la jornada.';
  }

  if (phase === 'prediction-open') {
    const baseMessage = resolveFantasyLineupValidationMessage(
      selectedPlayerIds,
      starterPlayerIds,
      captainId,
    );

    return baseMessage === 'Todo listo para guardar la alineación de la jornada.'
      ? 'Todo listo para enviar tu porra del viernes.'
      : baseMessage;
  }

  return resolveFantasyLineupValidationMessage(selectedPlayerIds, starterPlayerIds, captainId);
}

function captainIdIsValid(
  selectedPlayerIds: readonly string[],
  starterPlayerIds: readonly string[],
  captainId: string | null,
): boolean {
  return (
    captainId !== null &&
    selectedPlayerIds.includes(captainId) &&
    starterPlayerIds.includes(captainId)
  );
}

function resolveDraftFlowMode(
  phase: FantasyLeagueDashboard['weeklyCycle']['phase'] | null,
  hasExistingTeam: boolean,
): 'create' | 'edit' | 'locked' | 'prediction' {
  if (!hasExistingTeam) {
    return 'create';
  }

  switch (phase) {
    case 'lineups-published':
      return 'edit';
    case 'team-locked':
    case 'matchday-finished':
      return 'locked';
    default:
      return 'prediction';
  }
}

function resolveDraftHeading(flowMode: 'create' | 'edit' | 'locked' | 'prediction'): string {
  switch (flowMode) {
    case 'prediction':
      return 'Tu alineación será tu porra';
    case 'edit':
      return 'Edita tu equipo tras el viernes';
    case 'locked':
      return 'Equipo cerrado';
    default:
      return 'Crea tu equipo';
  }
}

function resolveSaveLabel(
  flowMode: 'create' | 'edit' | 'locked' | 'prediction',
  hasExistingTeam: boolean,
): string {
  if (!hasExistingTeam) {
    return 'Guardar plantilla';
  }

  switch (flowMode) {
    case 'prediction':
      return 'Guardar porra';
    case 'edit':
      return 'Guardar equipo';
    case 'locked':
      return 'Equipo cerrado';
    default:
      return 'Guardar plantilla';
  }
}

function resolvePoolIntro(flowMode: 'create' | 'edit' | 'locked' | 'prediction'): string | null {
  switch (flowMode) {
    case 'prediction':
      return 'Estos 6 jugadores son tu roster. Elige aquí los 4 que presentas como porra antes del viernes.';
    case 'edit':
      return 'Ya puedes reordenar tu roster con los titulares oficiales del viernes sobre la mesa.';
    case 'locked':
      return 'La jornada ya está cerrada. Revisa quién entró y quién se quedó fuera.';
    default:
      return null;
  }
}

function mapPredictionOutcomeViewModel(
  predictionOutcome: FantasyPredictionOutcome | null,
): FantasyTeamDraftPredictionOutcomeViewModel | null {
  if (!predictionOutcome) {
    return null;
  }

  return {
    bonusLabel: formatFantasyPoints(predictionOutcome.bonusPoints),
    hitsLabel: `${predictionOutcome.hits}/4 aciertos`,
    lockedMessage: predictionOutcome.lockedMessage,
    sundayChangeNote: predictionOutcome.sundayChangeNote,
  };
}

function resolveLineupStateLabel(
  predictionOutcome: FantasyPredictionOutcome | null,
  wasSubmitted: boolean,
  isConfirmedStarter: boolean,
): string | null {
  if (!predictionOutcome) {
    return wasSubmitted ? 'En tu porra' : null;
  }

  if (wasSubmitted && isConfirmedStarter) {
    return 'Acierto';
  }

  if (wasSubmitted && !isConfirmedStarter) {
    return 'No salió';
  }

  if (!wasSubmitted && isConfirmedStarter) {
    return 'Titular confirmado';
  }

  return 'Rotación';
}

function resolveLineupStateTone(
  predictionOutcome: FantasyPredictionOutcome | null,
  wasSubmitted: boolean,
  isConfirmedStarter: boolean,
): FantasySelectedRosterPlayerViewModel['lineupStateTone'] {
  if (!predictionOutcome) {
    return wasSubmitted ? 'neutral' : 'warning';
  }

  if (isConfirmedStarter) {
    return 'positive';
  }

  return wasSubmitted ? 'warning' : 'neutral';
}

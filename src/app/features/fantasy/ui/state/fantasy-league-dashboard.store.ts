import { computed, inject, Injectable, signal } from '@angular/core';

import { type FantasyLeagueDashboard } from '@features/fantasy/domain/entities/fantasy.models';
import {
  toFantasyLeagueDashboardViewModel,
  type FantasyLeagueDashboardViewModel,
} from '@features/fantasy/ui/models/fantasy-league-dashboard.viewmodel';
import { LOAD_FANTASY_LEAGUE_DASHBOARD_USE_CASE } from '@features/fantasy/ui/providers/fantasy.providers';

@Injectable()
export class FantasyLeagueDashboardStore {
  private readonly loadLeagueDashboardUseCase = inject(LOAD_FANTASY_LEAGUE_DASHBOARD_USE_CASE);

  readonly dashboard = signal<FantasyLeagueDashboard | null>(null);
  readonly currentLeagueId = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly viewModel = computed<FantasyLeagueDashboardViewModel | null>(() => {
    const dashboard = this.dashboard();

    return dashboard ? toFantasyLeagueDashboardViewModel(dashboard) : null;
  });
  readonly isNotFound = computed(() => {
    return (
      !this.isLoading() &&
      this.currentLeagueId() !== null &&
      this.dashboard() === null &&
      this.errorMessage() === null
    );
  });

  async load(leagueId: string | null): Promise<void> {
    this.currentLeagueId.set(leagueId);
    this.dashboard.set(null);
    this.errorMessage.set(null);

    if (!leagueId) {
      return;
    }

    this.isLoading.set(true);

    try {
      this.dashboard.set(await this.loadLeagueDashboardUseCase.execute(leagueId));
    } catch {
      this.errorMessage.set('No hemos podido cargar los datos de esta liga.');
    } finally {
      this.isLoading.set(false);
    }
  }
}

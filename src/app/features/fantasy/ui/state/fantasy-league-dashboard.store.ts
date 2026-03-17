import { computed, inject, Injectable, signal } from '@angular/core';

import { calculateMatchdayMvp } from '@features/fantasy/domain/services/calculate-matchday-mvp';
import { type FantasyLeagueDashboard } from '@features/fantasy/domain/entities/fantasy.models';
import { LOAD_FANTASY_LEAGUE_DASHBOARD_USE_CASE } from '@features/fantasy/ui/providers/fantasy.providers';

@Injectable()
export class FantasyLeagueDashboardStore {
  private readonly loadLeagueDashboardUseCase = inject(LOAD_FANTASY_LEAGUE_DASHBOARD_USE_CASE);

  readonly dashboard = signal<FantasyLeagueDashboard | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly mvp = computed(() => {
    const dashboard = this.dashboard();

    if (!dashboard) {
      return null;
    }

    return calculateMatchdayMvp(dashboard.players);
  });

  async load(leagueId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      this.dashboard.set(await this.loadLeagueDashboardUseCase.execute(leagueId));
    } catch {
      this.errorMessage.set('No pudimos cargar la información de la liga.');
    } finally {
      this.isLoading.set(false);
    }
  }
}

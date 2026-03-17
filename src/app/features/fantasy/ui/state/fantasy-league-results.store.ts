import { computed, inject, Injectable, signal } from '@angular/core';

import { type FantasyLeagueResults } from '@features/fantasy/domain/entities/fantasy.models';
import {
  type FantasyLeagueResultsPageViewModel,
  toFantasyLeagueResultsPageViewModel,
} from '@features/fantasy/ui/models/fantasy-league-results.viewmodel';
import { LOAD_FANTASY_LEAGUE_RESULTS_USE_CASE } from '@features/fantasy/ui/providers/fantasy.providers';

@Injectable()
export class FantasyLeagueResultsStore {
  private readonly loadFantasyLeagueResultsUseCase = inject(LOAD_FANTASY_LEAGUE_RESULTS_USE_CASE);

  readonly currentLeagueId = signal<string | null>(null);
  readonly results = signal<FantasyLeagueResults | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly viewModel = computed<FantasyLeagueResultsPageViewModel | null>(() => {
    const results = this.results();

    return results ? toFantasyLeagueResultsPageViewModel(results) : null;
  });
  readonly isNotFound = computed(() => {
    return (
      !this.isLoading() &&
      this.currentLeagueId() !== null &&
      this.results() === null &&
      this.errorMessage() === null
    );
  });

  async load(leagueId: string | null): Promise<void> {
    this.currentLeagueId.set(leagueId);
    this.results.set(null);
    this.errorMessage.set(null);

    if (!leagueId) {
      return;
    }

    this.isLoading.set(true);

    try {
      this.results.set(await this.loadFantasyLeagueResultsUseCase.execute(leagueId));
    } catch {
      this.errorMessage.set('No pudimos cargar los resultados fantasy de esta liga.');
    } finally {
      this.isLoading.set(false);
    }
  }
}

import { computed, inject, Injectable, signal } from '@angular/core';

import {
  toFantasyLeagueCardsViewModel,
  type FantasyLeagueCardViewModel,
} from '@features/fantasy/ui/models/fantasy-leagues.viewmodel';
import { LOAD_MY_FANTASY_LEAGUES_USE_CASE } from '@features/fantasy/ui/providers/fantasy.providers';

@Injectable()
export class FantasyLeaguesStore {
  private readonly loadMyLeaguesUseCase = inject(LOAD_MY_FANTASY_LEAGUES_USE_CASE);

  readonly leagues = signal<readonly FantasyLeagueCardViewModel[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hasLeagues = computed(() => this.leagues().length > 0);

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      this.leagues.set(toFantasyLeagueCardsViewModel(await this.loadMyLeaguesUseCase.execute()));
    } catch {
      this.errorMessage.set('No pudimos cargar tus ligas fantasy.');
    } finally {
      this.isLoading.set(false);
    }
  }
}

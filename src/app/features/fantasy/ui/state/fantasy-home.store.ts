import { computed, inject, Injectable, signal } from '@angular/core';

import { type FantasyHomeExperience } from '@features/fantasy/domain/entities/fantasy.models';
import {
  type FantasyHomePageViewModel,
  toFantasyHomePageViewModel,
} from '@features/fantasy/ui/models/fantasy-home.viewmodel';
import { LOAD_FANTASY_HOME_EXPERIENCE_USE_CASE } from '@features/fantasy/ui/providers/fantasy.providers';

@Injectable()
export class FantasyHomeStore {
  private readonly loadFantasyHomeExperienceUseCase = inject(LOAD_FANTASY_HOME_EXPERIENCE_USE_CASE);

  readonly experience = signal<FantasyHomeExperience | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly viewModel = computed<FantasyHomePageViewModel | null>(() => {
    const experience = this.experience();

    return experience ? toFantasyHomePageViewModel(experience) : null;
  });
  readonly hasAnyLeagues = computed(() => {
    const experience = this.experience();

    if (!experience) {
      return false;
    }

    return experience.primaryLeague !== null || experience.secondaryLeagues.length > 0;
  });

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      this.experience.set(await this.loadFantasyHomeExperienceUseCase.execute());
    } catch {
      this.errorMessage.set('No hemos podido cargar tu semana fantasy.');
      this.experience.set(null);
    } finally {
      this.isLoading.set(false);
    }
  }
}
